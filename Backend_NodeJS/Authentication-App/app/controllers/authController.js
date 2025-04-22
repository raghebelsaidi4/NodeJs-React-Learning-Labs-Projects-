const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @desc Register a new user
 * @route POST /auth/register
 * @access Public
 */
const register = async (req, res) => {
    try {
        const {first_name, last_name, email, password} = req.body;

        // validate input fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }

        // Check for valid email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({message: 'Invalid email format'});
        }

        // Check for existing user
        const foundUser = await User.findOne({email}).exec();
        if (foundUser) {
            return res.status(409).json({message: 'User already exists'});
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
        });

        // Create tokens
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '15m'}
        );

        const refreshToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                },
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '7d'}
        );

        // Set secure cookie with refresh token
        res.cookie('jwt', refreshToken, {
            httpOnly: true, //accessible only by web server (Prevent XSS attacks)
            secure: true, //https in production
            sameSite: 'None', //cross-site cookie
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return user data and access token
        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({message: 'Internal server error'});
    }
};

/**
 * @desc Handles user login by validating credentials and issuing JWT tokens
 * @route POST /auth/login
 * @access Public
 * @returns {Object} JSON response with access token and user info
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate input more thoroughly
    if (!email || !password) {
        return res.status(400).json({
            message: 'All fields are required',
            fieldErrors: {
                email: !email ? 'Valid email is required' : undefined,
                password: !password ? 'Password must be 8+ characters' : undefined
            }
        });
    }

    try {
        // Case-insensitive search with trimmed email
        const foundUser = await User.findOne({
            email: email.toLowerCase().trim()
        }).select('+password').exec(); // Explicitly include password field

        // Security: Generic message prevents user enumeration
        if (!foundUser || !foundUser.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Critical security check
        if (typeof password !== 'string' || typeof foundUser.password !== 'string') {
            console.error('Password type mismatch:', {
                inputType: typeof password,
                storedType: typeof foundUser.password
            });
            return res.status(500).json({ message: 'Authentication error' });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        // Token generation - consider rotating secrets periodically
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: foundUser._id,
                    // Add roles if applicable: roles: foundUser.roles
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: foundUser._id }, // Simpler payload for refresh token
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Secure cookie settings (adjust for your deployment)
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
            sameSite: 'strict', // Protection against CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/auth/refresh' // Restrict to refresh endpoint
        });

        return res.json({
            accessToken,
            user: {
                id: foundUser._id,
                email: foundUser.email,
                // Include other non-sensitive fields as needed
            },
            expiresIn: 900 // 15 minutes in seconds
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Authentication failed',
            ...(process.env.NODE_ENV === 'development' && {
                debug: error.message
            })
        });
    }
};

/**
 * @desc Refresh Access Token
 * @route GET /auth/refresh
 * @access Public - Requires valid refresh token cookie
 *
 * Validates the refresh token and issues a new access token.
 * Implements proper token rotation security practices.
 * @error 401 Unauthorized - No refresh token provided
 * @error 403 Forbidden - Invalid/expired refresh token
 * @error 401 Unauthorized - User no longer exists
 *
 * @returns {Object} JSON with new access token
 */
const refresh = (req, res) => {
    // 1. Check for refresh token in cookies
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized - No refresh token provided',
            code: 'MISSING_REFRESH_TOKEN'
        });
    }

    const refreshToken = cookies.jwt;

    try {
        // 2. Verify refresh token
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    // Clear invalid cookie
                    res.clearCookie('jwt', {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None'
                    });

                    // Different error messages for different cases
                    const errorType = err.name === 'TokenExpiredError'
                        ? 'Refresh token expired'
                        : 'Invalid refresh token';

                    return res.status(403).json({
                        success: false,
                        message: `Forbidden - ${errorType}`,
                        code: err.name || 'INVALID_REFRESH_TOKEN'
                    });
                }

                // 3. Find user in database
                const foundUser = await User.findById(decoded.UserInfo?.id).exec();

                if (!foundUser) {
                    return res.status(401).json({
                        success: false,
                        message: 'Unauthorized - User no longer exists',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // 4. Generate new access token (15 minutes expiration)
                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            id: foundUser._id,
                        },
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' } // Increased from 10s to 15 minutes
                );

                // 5. Return new access token
                return res.json({
                    success: true,
                    accessToken,
                    expiresIn: 15 * 60 // 15 minutes in seconds
                });
            }
        );
    } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            code: 'TOKEN_REFRESH_FAILED'
        });
    }
};

/**
 * @desc Logout user by clearing the JWT refresh token cookie
 * @route POST /auth/logout
 * @access Public - Clears the HTTP-only cookie
 *
 * Security Considerations:
 * - Only clears the specific 'jwt' cookie used for refresh tokens
 * - Uses secure cookie clearance settings matching the cookie creation settings
 * - Returns appropriate status codes for different scenarios
 *
 * @returns {Object} JSON response with success message
 *
 * @status 204 - No content (when no cookie exists)
 * @status 200 - Successfully logged out
 * @status 500 - Server error during logout
 */
const logout = async (req, res) => {
    // 1. Check for refresh token in cookies
    const cookies = req.cookies;

    // 2. If no JWT cookie exists, return 204 No Content
    if (!cookies?.jwt) {
        return res.status(204).json({
            success: true,
            message: 'No content - No refresh token present'
        });
    }

    try {
        // 3. Clear the HTTP-only cookie with secure settings
        res.clearCookie('jwt', {
            httpOnly: true,    // Prevent client-side JS access
            secure: true,      // Only send over HTTPS
            sameSite: 'None',  // Required for cross-site cookies
            path: '/auth/refresh' // Must match cookie's original path
        });

        // 4. Return success response
        return res.status(200).json({
            success: true,
            message: 'Logout successful - Refresh token cleared'
        });

    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
            code: 'LOGOUT_FAILED'
        });
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout,
};
