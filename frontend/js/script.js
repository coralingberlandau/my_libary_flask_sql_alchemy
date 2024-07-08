const SERVER = 'https://my-libary-flask-sql-alchemy.onrender.com';

// Function to parse JWT token
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(base64);
    } catch (e) {
        console.error('Invalid token', e);
        return null;
    }
};

// Check if there is a saved access token in localStorage
const token = localStorage.getItem('accessToken');
console.log('Retrieved token:', token);

if (token) {
    // Parse the token to get user information
    const user = parseJwt(token);
    if (user) {
        console.log('User authenticated:', user);
        // Add the token to the Authorization header for every request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        console.error('Invalid token found.');
        localStorage.removeItem('accessToken');
        window.location.href = 'login/login.html';
    }
} else {
    console.log('No access token found. Redirecting to login page.');
    window.location.href = 'login/login.html';
}

// index - home \\

window.onload = function(){
    const username = localStorage.getItem('email');
    console.log(username)
    document.getElementById('username').innerHTML = `Welcome back ${username}`;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript loaded!');
    // Additional JavaScript code can be added here
});

// Function to handle login form submission
const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${SERVER}/login`, { email, password });
        const token = response.data.accessToken;

        // Save the token in localStorage
        localStorage.setItem('accessToken', token);
        console.log('Token saved:', token);

        // Redirect to the home page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login failed', error);
    }
};

document.getElementById('loginForm').addEventListener('submit', handleLogin);