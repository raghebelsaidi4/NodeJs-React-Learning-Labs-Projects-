const axios = require('axios');

const USERS_URL = 'https://jsonplaceholder.typicode.com/users';
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const COMMENTS_URL = 'https://jsonplaceholder.typicode.com/comments';

async function getComments(username) {
    try {
        const {data: user} = await axios.get(`${USERS_URL}?username=${username}`);
        if (user.length === 0) {
            throw new Error(`User with username ${username} not found.`);
        }

        const {data: posts} = await axios.get(`${POSTS_URL}?userId=${user[0].id}`);
        if (posts.length === 0) {
            throw new Error(`No posts found for user with id ${user[0].id}.`);
        }

        const {data: comments} = await axios.get(`${COMMENTS_URL}?postId=${posts[0].id}`);
        if (comments.length === 0) {
            throw new Error(`No comments found for post with id ${posts[0].id}.`);
        }

        const userWithComment = await axios.get(`${USERS_URL}?email=${comments[1].email}`);
        console.log(userWithComment);
    } catch (error) {
        console.error(`Error fetching comments: ${error.message}`);
    }
}

getComments('Bret');