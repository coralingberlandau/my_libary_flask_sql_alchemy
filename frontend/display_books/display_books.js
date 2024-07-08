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

// display_books

document.addEventListener('DOMContentLoaded', function() {
    console.log("Document loaded, fetching books...");
    axios.get(SERVER + '/books')
        .then(response => {
            console.log("Books fetched successfully:", response.data);
            const books = response.data;
            const tableBody = document.querySelector('#booksTable tbody');
            
            if (!tableBody) {
                console.error("Table body element not found!");
                return;
            }

            books.forEach(book => {
                // Construct the image URL
                const imageUrl = SERVER + '/media' + book.image_src.split('media')[1];
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.id}</td>
                    <td>${book.book_name}</td>
                    <td>${book.author}</td>
                    <td>${book.year_published}</td>
                    <td>${book.type_1_2_3}</td>
                    <td>${book.is_available ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                    <td>${book.is_deleted ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</td>
                    <td>${book.loan_period} days</td>
                    <td><img src="${imageUrl}" alt="Book Image" style="max-width: 100px; max-height: 100px;" /></td>
                `;
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching books:', error);
        });
});