// find_book //

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
    const bookNameInput = document.getElementById('bookNameInput');
    const booksTableBody = document.querySelector('#booksTable tbody');
    const errorMessage = document.querySelector('.error-message');

    if (!searchButton || !bookNameInput || !booksTableBody || !errorMessage) {
        console.error('One or more required elements not found.');
        return;
    }

    searchButton.addEventListener('click', findBookByName);

    async function findBookByName() {
        const bookName = bookNameInput.value.trim();
        if (bookName === '') {
            alert('Please enter a book name');
            return;
        }

        try {
            const response = await axios.get(`http://127.0.0.1:5000/book/${encodeURIComponent(bookName)}`);
            const book = response.data;

            booksTableBody.innerHTML = '';
            if (!book) {
                errorMessage.textContent = 'Book not found';
                return;
            }

            errorMessage.textContent = ''; // Clear error message if book is found
            const imageUrl = SERVER + '/media' + book.image_src.split('media')[1];
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${book.id}</td>
                        <td>${book.book_name}</td>
                        <td>${book.author}</td>
                        <td>${book.year_published}</td>
                        <td>${book.type_1_2_3}</td>
                        <td>${book.is_available ? 'Yes' : 'No'}</td>
                        <td>${book.is_deleted ? 'Yes' : 'No'}</td>
                        <td>${book.loan_period}</td>
                        <td><img src="${imageUrl}" alt="Book Image" style="max-width: 100px; max-height: 100px;" /></td>

                    `;
            booksTableBody.appendChild(row);
        } catch (error) {
            console.error('Error fetching book:', error);
            errorMessage.textContent = `An error occurred while fetching the book: ${error.response?.data?.message || error.message}`;
        }
    }
});
