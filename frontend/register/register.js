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

/// sing - up ///

const signup = () => {
    const user_name = document.getElementById('user_name').value;
    const city = document.getElementById('city').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const is_admin = document.getElementById('is_admin').checked;
    const errorMessage = document.getElementById('error-message');

    if (age < 0) {
        errorMessage.textContent = 'Age cannot be less than 0';
        errorMessage.style.display = 'block';
        return;
    }

    axios.post(SERVER + '/register', {
        user_name: user_name,
        city: city,
        age: age,
        email: email,
        password: password,
        is_admin: is_admin
    })
    .then(response => {
        if (response.status === 201) {
            window.location.href = 'login.html'; // Redirect to login page or desired page
        } else {
            errorMessage.textContent = response.data.message;
            errorMessage.style.display = 'block';
        }
    })
    .catch(error => {
        errorMessage.textContent = error.response.data.message;
        errorMessage.style.display = 'block';
    });
}