// Function to update book details

const SERVER = 'http://127.0.0.1:5000';

const updateBook = () => {
    const bookId = document.getElementById('bookId').value;
    const token = localStorage.getItem('accessToken');

    console.log('Updating book with ID:', bookId);

    const data = {
        book_name: document.getElementById('bookName').value,
        author: document.getElementById('author').value,
        year_published: document.getElementById('yearPublished').value,
        type_1_2_3: parseInt(document.getElementById('type').value), // Assuming 'type' is a select element with integer values
        is_available: document.getElementById('isAvailable').value === 'true',
        is_deleted: document.getElementById('isDeleted').value === 'true'
    };

    const formData = new FormData();
    formData.append('book_id', bookId);
    formData.append('book_name', data.book_name);
    formData.append('author', data.author);
    formData.append('year_published', data.year_published);
    formData.append('type_1_2_3', data.type_1_2_3);
    formData.append('is_available', data.is_available);
    formData.append('is_deleted', data.is_deleted);

    axios.put(`${SERVER}/book/update/${bookId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        console.log(response.data.message);
        const modal = document.getElementById('successModal');
        modal.style.display = 'block';

        // Clear form fields and error message
        document.getElementById('bookId').value = '';
        document.getElementById('bookName').value = '';
        document.getElementById('author').value = '';
        document.getElementById('yearPublished').value = '';
        document.getElementById('type').value = '';
        document.getElementById('isAvailable').value = 'true';
        document.getElementById('isDeleted').value = 'false';
        document.getElementById('image_src').value = '';
        document.querySelector('.error-message').innerText = '';

        // Close modal on close button click
        const span = document.getElementsByClassName('close')[0];
        span.onclick = function() {
            modal.style.display = 'none';
        }

        // Close modal on outside click
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error('There was an error!', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            document.querySelector('.error-message').innerText = 'Failed to update book: ' + error.response.data.message;
        } else {
            document.querySelector('.error-message').innerText = 'Failed to update book. Please try again.';
        }
    });
}

// Attach event listener to update button
const updateButton = document.getElementById('updateButton');
if (updateButton) {
    updateButton.addEventListener('click', updateBook);
}
