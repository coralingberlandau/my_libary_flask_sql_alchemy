const updateUser = () => {
    const userId = document.getElementById('customerId').value;
    const token = localStorage.getItem('accessToken');

    console.log('Updating user with ID:', userId);

    const data = {
        user_name: document.getElementById('customerName').value,
        city: document.getElementById('city').value,
        age: document.getElementById('age').value,
        email: document.getElementById('email').value,
        is_admin: document.getElementById('isAdmin').value === 'true',
        is_deleted: document.getElementById('isDeleted').value === 'true'
    };

    axios.put(`http://127.0.0.1:5000/user/update/${userId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            console.log(response.data.message); // Log success message
            document.getElementById('successModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error updating user:', error);
            document.getElementById('error-message').innerText = 'Failed to update user. Please try again.';
        });
}

