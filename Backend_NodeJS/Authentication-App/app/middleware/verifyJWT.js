const jwt = require("jsonwebtoken");

/**
 * @desc JWT Verification Middleware
 * @middleware verifyJWT
 * @access Private
 *
 * Verifies access token from Authorization header and attaches user ID to request object.
 * Handles various token verification scenarios with appropriate error responses.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @error 401 Unauthorized - Missing or malformed Authorization header
 * @error 403 Forbidden - Invalid or expired token
 * @error 500 Internal Server Error - Verification process failed
 */
const verifyJWT = (req, res, next) => {
    // 1. Check for Authorization header (case-insensitive)
    const authHeader = (
        req.headers.authorization ||
        req.headers.Authorization ||
        ''
    ).trim();

    // 2. Validate header format
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Missing or invalid authorization header",
            code: "INVALID_AUTH_HEADER",
            solution: "Include valid 'Bearer <token>' in Authorization header"
        });
    }

    // 3. Extract token from header
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Malformed token",
            code: "MALFORMED_TOKEN"
        });
    }

    try {
        // 4. Verify token asynchronously
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // 5. Handle specific verification errors
                let errorMessage = "Forbidden - Invalid token";
                let statusCode = 403;

                if (err.name === 'TokenExpiredError') {
                    errorMessage = "Forbidden - Token expired";
                    statusCode = 403; // Or 401 depending on your auth flow
                } else if (err.name === 'JsonWebTokenError') {
                    errorMessage = "Forbidden - Token verification failed";
                }

                return res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                    code: err.name || "TOKEN_VERIFICATION_FAILED",
                    ...(process.env.NODE_ENV === 'development' && {
                        debug: err.message
                    })
                });
            }

            // 6. Attach user information to request
            req.userId = decoded.UserInfo?.id; // More explicit naming than req.user
            req.userRoles = decoded.UserInfo?.roles;

            // 7. Continue to next middleware
            next();
        });
    } catch (error) {
        // 8. Handle unexpected errors
        console.error("JWT Verification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication",
            code: "AUTH_SERVER_ERROR"
        });
    }
};

module.exports = verifyJWT;