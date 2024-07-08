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
}

document.addEventListener('DOMContentLoaded', function() {
    const removeButton = document.getElementById('removeButton');
    const successModal = document.getElementById('successModal');
    const closeModalButton = successModal.querySelector('.close');
    const errorMessage = document.querySelector('.error-message');

    removeButton.addEventListener('click', function() {
        const customerId = document.getElementById('customerId').value;
        const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage

        if (!token) {
            console.error('JWT token not found in localStorage');
            errorMessage.textContent = 'JWT token not found. Please log in.';
            return;
        }

        // Parse JWT token to get user information
        const userInfo = parseJwt(token);
        if (!userInfo) {
            console.error('Invalid token');
            errorMessage.textContent = 'Invalid token. Please log in again.';
            return;
        }

        axios.delete(`${SERVER}/user/delete/${customerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(function(response) {
            successModal.style.display = 'block';
        })
        .catch(function(error) {
            if (error.response) {
                console.error('Error:', error.response.data);
                errorMessage.textContent = 'Failed to remove customer: ' + error.response.data.message;
            } else {
                console.error('Error:', error.message);
                errorMessage.textContent = 'Failed to remove customer. Please try again.';
            }
        });
    });

    closeModalButton.addEventListener('click', function() {
        successModal.style.display = 'none';
    });
});