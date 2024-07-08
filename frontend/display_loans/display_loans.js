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

// display_loans //
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, fetching book loans...');
    fetchBookLoans();
});

function fetchBookLoans() {
    axios.get(SERVER + '/bookloans')
        .then(function(response) {
            console.log('Book loans fetched successfully:', response.data);
            displayBookLoans(response.data);
        })
        .catch(function(error) {
            console.error('Error fetching book loans:', error);
        });
}

function displayBookLoans(bookLoans) {
    const tableBody = document.querySelector('#bookLoansTable tbody');
    if (!tableBody) {
        console.error('Table body element not found!');
        return;
    }

    tableBody.innerHTML = '';

    bookLoans.forEach(function(loan) {
        const row = `
            <tr>
                <td>${loan.user_name}</td>
                <td>${loan.book_name}</td>
                <td>${loan.loan_date}</td>
                <td>${loan.return_date}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}