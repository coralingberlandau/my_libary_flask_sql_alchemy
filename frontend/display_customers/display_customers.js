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

/* display_customers */

document.addEventListener('DOMContentLoaded', function () {
    console.log('Document loaded, fetching users...');
    fetchUsers();
});

async function fetchUsers() {
    try {
        const response = await axios.get( SERVER +'/users');
        const users = response.data;
        console.log('Users fetched successfully:', users);

        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

const displayUsers = (users) => {
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = ''; // Clear existing table rows

    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.user_name}</td>
                <td>${user.city}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.created_at}</td>
                <td>${user.updated_at}</td>
                <td>${user.last_login_at}</td>
                <td>${user.is_admin ? 'Yes' : 'No'}</td>
                <td>${user.is_deleted ? 'Yes' : 'No'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}
