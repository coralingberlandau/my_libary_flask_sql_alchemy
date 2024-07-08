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

// Check if there is a saved access token
const token = localStorage.getItem('accessToken');

if (token) {
    // Parse the token to get user information
    const user = parseJwt(token);
    if (user) {
        console.log('User authenticated:', user);
        // Add the token to the Authorization header for every request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        console.error('Invalid token found.');
    }
} else {
    console.error('No access token found. Please log in.');
}

const SERVER = 'http://127.0.0.1:5000';

// Login //

const login = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    axios.post(`${SERVER}/login`, {
        email: email,
        password: password
    })
    .then(response => {
        if (response && response.data && response.data.access_token) {
            console.log(response.data);
            let token = response.data.access_token;
            let decoded = parseJwt(token);
            if (decoded && decoded.user_id) {
                let userId = decoded.user_id;
                // Display welcome message
                document.getElementById('welcome-message').innerText = `Welcome back, User ${userId}!`;
                document.getElementById('welcome-message').style.display = 'block';
            }
            // Store email and token in localStorage
            localStorage.setItem('email', email);
            localStorage.setItem('accessToken', token);
            window.location.href = '../index.html'; // Redirect to dashboard or desired page
        } else {
            errorMessage.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
        errorMessage.style.display = 'block';
    });
}
