const SERVER = 'https://my-libary-flask-sql-alchemy.onrender.com';

// add a book //
const addBook = () => {
    const bookName = document.getElementById('book_name').value;
    const author = document.getElementById('author').value;
    const yearPublished = document.getElementById('year_published').value;
    const type123 = document.getElementById('country').value;
    const imageSrc = document.getElementById('image_src').files[0]; 

    // Create form data object to send as multipart/form-data
    const formData = new FormData();
    formData.append('book_name', bookName);
    formData.append('author', author);
    formData.append('year_published', parseInt(yearPublished)); 
    formData.append('type_1_2_3', parseInt(type123)); 
    formData.append('image_src', imageSrc);  

    axios.post(SERVER + '/book/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',  // Set content type for formData
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    .then(response => {
        console.log(response.data.message); 
        // Show the modal
        let modal = document.getElementById('successModal');
        modal.style.display = 'block';

        // Clear form fields after successful submission
        document.getElementById('book_name').value = '';
        document.getElementById('author').value = '';
        document.getElementById('year_published').value = '';
        document.getElementById('country').value = ''; 
        document.getElementById('image_src').value = ''; 
        document.getElementById('error-message').innerText = ''; 

        // Close the modal when the user clicks on <span> (x)
        let span = document.getElementsByClassName('close')[0];
        span.onclick = function() {
            modal.style.display = 'none';
        }
        
        // Close the modal when the user clicks anywhere outside of the modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error('Error adding book:', error); // Log error message
        // Display error message to user
        document.getElementById('error-message').innerText = 'Failed to add book. Please try again.';
    });
}