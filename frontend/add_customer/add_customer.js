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

// add_customer.js

// Function to handle form submission
const signup = () => {
    const form = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');
    
    // Retrieve form data
    const user_name = form.elements['user_name'].value;
    const city = form.elements['city'].value;
    const age = form.elements['age'].value;
    const email = form.elements['email'].value;
    const password = form.elements['password'].value;
    const is_admin = form.elements['is_admin'].checked;
    
    // Prepare data to send
    const data = {
        user_name: user_name,
        city: city,
        age: parseInt(age), // Ensure age is parsed as integer
        email: email,
        password: password,
        is_admin: is_admin
    };
    
    // Send POST request using Axios
    axios.post('http://127.0.0.1:5000/register', data)
        .then(response => {
            console.log('Registration successful:', response.data);
            // Optionally, redirect or show a success message
            window.location.href = '../login/login.html'; // Redirect to login page
        })
        .catch(error => {
            console.error('Registration failed:', error.response.data);
            // Display error message to user
            errorMessage.textContent = error.response.data.message;
        });
}
