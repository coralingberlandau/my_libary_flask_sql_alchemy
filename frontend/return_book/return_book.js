const SERVER = 'https://my-libary-flask-sql-alchemy.onrender.com';

// Function to handle book return process
const returnBook = () => {
    const bookNameInput = document.getElementById('book_name_to_return');
    console.log('Book name input:', bookNameInput);

    const token = localStorage.getItem('accessToken'); // Get JWT token from localStorage

    if (!bookNameInput || !token) {
        console.error('Book name input:', bookNameInput, 'Token:', token);
        document.getElementById('error-message').innerText = 'Please provide book name and ensure you are logged in.';
        return;
    }

    const bookName = bookNameInput.value.trim(); // Get book name from form

    if (!bookName) {
        console.error('Book name is empty.');
        document.getElementById('error-message').innerText = 'Please provide book name.';
        return;
    }

    axios.get(`${SERVER}/book/${bookName}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const bookId = response.data.id; 

        axios.post(SERVER + '/bookloan/return', {
            user_id: 1, 
            book_id: bookId 
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log(response.data.message); 
            let modal = document.getElementById('successModal');
            modal.style.display = 'block';
            // Clear input fields and error messages if needed
            bookNameInput.value = ''; 
            document.getElementById('error-message').innerText = ''; 
        })
        .catch(error => {
            console.error('There was an error!', error);
            document.getElementById('error-message').innerText = error.response.data.message;
        });
    })
    .catch(error => {
        console.error('Error finding book:', error);
        document.getElementById('error-message').innerText = 'Book not found. Please check the book name.';
    });
}

// Modal handling
document.addEventListener('DOMContentLoaded', function () {
    let modal = document.getElementById('successModal');
    let span = document.getElementsByClassName('close')[0];

    span.onclick = function () {
        modal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});