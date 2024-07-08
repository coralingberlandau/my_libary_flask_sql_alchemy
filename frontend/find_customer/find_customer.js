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

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const customerNameInput = document.getElementById('customerNameInput');
    const customersTableBody = document.querySelector('#customersTable tbody');
    const errorMessage = document.querySelector('.error-message');

    if (!searchButton || !customerNameInput || !customersTableBody || !errorMessage) {
        console.error('One or more required elements not found.');
        return;
    }

    searchButton.addEventListener('click', findCustomerByName);

    async function findCustomerByName() {
        const userName = customerNameInput.value.trim();
        if (userName === '') {
            alert('Please enter a customer name');
            return;
        }

        try {
            const response = await axios.get(`${SERVER}/user/${encodeURIComponent(userName)}`);
            const customer = response.data;

            customersTableBody.innerHTML = '';
            if (!customer) {
                errorMessage.textContent = 'Customer not found';
                return;
            }

            errorMessage.textContent = ''; // Clear error message if customer is found

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.user_name}</td>
                <td>${customer.city}</td>
                <td>${customer.age}</td>
                <td>${customer.email}</td>
                <td>${customer.created_at}</td>
                <td>${customer.updated_at}</td>
                <td>${customer.last_login_at}</td>
                <td>${customer.is_admin ? 'Yes' : 'No'}</td>
                <td>${customer.is_deleted ? 'Yes' : 'No'}</td>
            `;
            customersTableBody.appendChild(row);
        } catch (error) {
            console.error('Error fetching customer:', error);
            errorMessage.textContent = `An error occurred while fetching the customer: ${error.response?.data?.message || error.message}`;
        }
    }
});
