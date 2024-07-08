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

const SERVER = 'http://127.0.0.1:5000';

// Function to display success message
const showSuccessMessage = () => {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = 'Book deleted successfully!';
    successMessage.style.display = 'block';
};

document.addEventListener('DOMContentLoaded', function() {
    const removeButton = document.getElementById('removeButton');
    const errorMessage = document.querySelector('.error-message');

    removeButton.addEventListener('click', function() {
        const bookId = document.getElementById('bookId').value;
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

        axios.delete(`${SERVER}/book/delete/${bookId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(function(response) {
            showSuccessMessage(); // Display success message
        })
        .catch(function(error) {
            if (error.response) {
                console.error('Error:', error.response.data);
                errorMessage.textContent = 'Failed to remove book: ' + error.response.data.message;
            } else {
                console.error('Error:', error.message);
                errorMessage.textContent = 'Failed to remove book. Please try again.';
            }
        });
    });
});
