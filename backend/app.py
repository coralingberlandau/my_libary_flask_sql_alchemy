import json
from flask import Flask, Response, request, jsonify, current_app, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, verify_jwt_in_request
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.utils import secure_filename
import os

from flask_cors import CORS

app = Flask(__name__)

CORS(app) 

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///libary.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config["JWT_SECRET_KEY"] = 'jwt_secret_key_here'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1) 
UPLOAD_FOLDER =  os.path.join(os.getcwd(), 'media')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50), unique=False, nullable=False)
    city = db.Column(db.String(50), unique=False, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    is_deleted = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return f'<User {self.user_name}>'
    
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_name = db.Column(db.String(100), unique=True, nullable=False)
    author = db.Column(db.String(50), nullable=False)
    year_published = db.Column(db.Integer, nullable=False)
    type_1_2_3 = db.Column(db.Integer, nullable=False)
    is_available = db.Column(db.Boolean, nullable=False, default=True)
    is_deleted = db.Column(db.Boolean, nullable=False, default=False)
    loan_period = db.Column(db.Integer, nullable=False)  
    image_src = db.Column(db.String(300), nullable=False) 

    def __repr__(self):
        return '<Book {}>'.format(self.book_name)

    def get_return_date(self):
        return datetime.now() + timedelta(days=self.loan_period)


def add_book(book_name, author, year_published, type_1_2_3):
    if type_1_2_3 == 1:
        loan_period = 10 
    elif type_1_2_3 == 2:
        loan_period = 5  
    elif type_1_2_3 == 3:
        loan_period = 2  
    else:
        raise ValueError("type_1_2_3 must be 1, 2, or 3")

    new_book = Book(
        book_name=book_name,
        author=author,
        year_published=year_published,
        type_1_2_3=type_1_2_3,
        loan_period=loan_period 
    )
    db.session.add(new_book)
    db.session.commit()

    return new_book

class BookLoan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    loan_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    return_date = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=False)  

    # Additional fields and relationships - Define relationships
    user = db.relationship('User', backref=db.backref('book_loans', lazy=True))
    book = db.relationship('Book', backref=db.backref('book_loans', lazy=True))

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_identity = get_jwt_identity()
            user_id = user_identity.get("user_id")
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({"message": "User not found"}), 404
            
            if not user.is_admin:
                return jsonify({"message": "Admins only!"}), 403
            
            return fn(*args, **kwargs)
        
        except Exception as e:
            current_app.logger.error(f"Failed to verify admin status: {e}")
            return jsonify({"message": "Internal server error"}), 500
    
    return wrapper

# JWT token management
@jwt.user_identity_loader
def user_identity_lookup(user):
    return {'user_id': user.id, 'is_admin': user.is_admin}

## ^^^^^^^ test ^^^^^^^^^^^^^^^  ## ^^^^^^^ test ^^^^^^^^^^^^^^^ ## ## ^^^^^^^ test ^^^^^^^^^^^^^^^ ##

# Define a test endpoint
@app.route("/test", methods=["GET"])
def test():
    return "{'test' : 'success'}"

## ^^^^^^^ book ^^^^^^^^^^^^^^^  ## ^^^^^^^ book ^^^^^^^^^^^^^^^ ## ## ^^^^^^^ book ^^^^^^^^^^^^^^^ ##

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

## Create_book -- (post) ##  usage = http://127.0.0.1:5000/book/create

@app.route("/book/create", methods=["POST"])
@jwt_required()
@admin_required  # Assuming you have a decorator like this for admin authorization
def create_book():
    try:
        current_user = get_jwt_identity()

        # Check if the post request has the file part
        if 'image_src' not in request.files:
            return jsonify({'message': 'No file part in the request'}), 400
        
        file = request.files['image_src']

        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            data = request.form  # Get other form data
            book_name = data.get('book_name')
            author = data.get('author')
            year_published = data.get('year_published')
            type_1_2_3 = data.get('type_1_2_3')
            is_available = data.get('is_available', True)
            is_deleted = data.get('is_deleted', False)
            image_src = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # Save image path

            # Convert string 'False'/'True' to boolean False/True if necessary
            if isinstance(is_available, str):
                is_available = is_available.lower() == 'true'
            if isinstance(is_deleted, str):
                is_deleted = is_deleted.lower() == 'true'

            # Determine loan_period based on type_1_2_3
            if type_1_2_3 == '1':
                loan_period = 10
            elif type_1_2_3 == '2':
                loan_period = 5
            elif type_1_2_3 == '3':
                loan_period = 2
            else:
                return jsonify({'message': 'Invalid type_1_2_3 value. Must be 1, 2, or 3.'}), 400

            new_book = Book(
                book_name=book_name,
                author=author,
                year_published=year_published,
                type_1_2_3=type_1_2_3,
                is_available=is_available,
                is_deleted=is_deleted,
                loan_period=loan_period,
                image_src=image_src  # Set image_src to the saved file path
            )

            db.session.add(new_book)
            db.session.commit()

            return jsonify({'message': 'Book created successfully'}), 201
        else:
            return jsonify({'message': 'Allowed file types are png, jpg, jpeg, gif'}), 400

    except Exception as e:
        # Log the error
        app.logger.error(f"Error during book creation: {e}")
        return jsonify({'message': 'Failed to create book', 'error': str(e)}), 500
    
## Read book by name -- (get) ##  usage: http://127.0.0.1:5000/book/<string:book_name> - לשים לב שצאיך לשנות את הסיומת שיהיה כללי
@app.route("/book/<string:book_name>", methods=['GET'])
@jwt_required()  # Require JWT token to access this endpoint
def get_book_by_name(book_name):
    try:
        print("here")
        book = Book.query.filter_by(book_name=book_name).first()
        if not book:
            return jsonify({'message': 'Book not found'}), 404
        
        book_detail = {
            "id": book.id,
            "book_name": book.book_name,
            "author": book.author,
            "year_published": book.year_published,
            "type_1_2_3": book.type_1_2_3,
            "is_available": book.is_available,
            "is_deleted": book.is_deleted,
            "loan_period": book.loan_period,
            "image_src": book.image_src  

        }
        
        return jsonify(book_detail), 200

    except Exception as e:
        app.logger.error(f"Error fetching book details: {e}")
        return jsonify({'message': 'Failed to fetch book details', 'error': str(e)}), 500
    

@app.route('/media/<filename>')
def media(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/images')
def get_images():
    files = Book.query.all()
    images = [{'id': file.id, 'userName': file.userName, 'email': file.email, 'filename': file.filename} for file in files]
    return jsonify(images)

## Read all -- (get) ##  usage: http://127.0.0.1:5000/books

@app.route("/books", methods=["GET"])
#@jwt_required()
def get_books():
    try:
        books = Book.query.order_by(Book.id).all()
        books_list = []

        for book in books:
            book_info = {
                'id': book.id,
                'book_name': book.book_name,
                'author': book.author,
                'year_published': book.year_published,
                'type_1_2_3': book.type_1_2_3,
                'is_available': book.is_available,
                'is_deleted': book.is_deleted,
                'loan_period': book.loan_period,
                'image_src': book.image_src  # Include image_src in book details

            }
            books_list.append(book_info)

        return json.dumps(books_list, ensure_ascii=False, indent=2), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'message': 'Failed to retrieve books', 'error': str(e)}), 400

## Update -- (put) ##  usage:http://127.0.0.1:5000/book/update/<int:book_id>  

@app.route("/book/update/<int:book_id>", methods=["PUT"])
@jwt_required()
@admin_required  
def update_book(book_id):
    print('start')
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'message': 'Book not found'}), 404

    data = request.form
    book.book_name = data.get('book_name', book.book_name)
    book.author = data.get('author', book.author)
    
    year_published = data.get('year_published')
    if year_published:
        book.year_published = int(year_published)
    
    type_1_2_3 = data.get('type_1_2_3')
    if type_1_2_3:
        book.type_1_2_3 = int(type_1_2_3)
    
    is_available = data.get('is_available')
    if is_available is not None:
        book.is_available = is_available == 'true'
    
    is_deleted = data.get('is_deleted')
    if is_deleted is not None:
        book.is_deleted = is_deleted == 'true'

    if 'image_src' in request.files:
        image = request.files['image_src']
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)
        book.image_src = image_path
    print('here')
    try:
        db.session.commit()
        return jsonify({'message': 'Book updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating book: {str(e)}'}), 500

## Delete -- (deleta) ##  usage:http://127.0.0.1:5000/book/delete/4

@app.route("/book/delete/<int:book_id>", methods=["DELETE"])
@jwt_required()  # Require JWT token to access this endpoint
@admin_required  # Assuming you have a decorator like this for admin authorization
def delete_book_by_id(book_id):
    try:
        book = Book.query.get(book_id)
        if not book:
            return jsonify({'message': 'Book not found'}), 404

        # Mark the book as not available and as deleted
        book.is_available = False
        book.is_deleted = True
        db.session.commit()

        return jsonify({'message': 'Book marked as not available and deleted'}), 200
    except Exception as e:
        # Log the error
        app.logger.error(f"Error during marking book as not available and deleted: {e}")
        return jsonify({'message': 'Failed to mark book as not available and deleted', 'error': str(e)}), 500

## ^^^^^^^ user ^^^^^^^^^^^^^^^  ## ^^^^^^^ user ^^^^^^^^^^^^^^^

## Read user by name -- (get) ##  usage: http://127.0.0.1:5000/user/<string:user_name> 

@app.route("/user/<string:user_name>")
@jwt_required()
@admin_required
def get_user_by_name(user_name):
    user = User.query.filter_by(user_name=user_name).first_or_404()
    user_detail = {
        "id": user.id,
        "user_name": user.user_name,
        "city": user.city,
        "age": user.age,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "is_admin": user.is_admin,
        "is_deleted": user.is_deleted
    }
    return Response(
        response=json.dumps(user_detail, ensure_ascii=False),
        status=200,
        mimetype='application/json'
    )

## Read all user -- (get) ##  usage: http://127.0.0.1:5000/users
@app.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_users():
    try:
        users = User.query.order_by(User.id).all()
        
        users_list = []
        for user in users:
            user_detail = {
                'id': user.id,
                'user_name': user.user_name,
                'city': user.city,
                'age': user.age,
                'email': user.email,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat(),
                'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None,
                'is_admin': user.is_admin,
                'is_deleted': user.is_deleted
            }
            users_list.append(user_detail)

        # Convert list of dictionaries to JSON string using json.dumps
        users_json = json.dumps(users_list, ensure_ascii=False, indent=2)

        return app.response_class(
            response=users_json,
            status=200,
            mimetype='application/json'
        )
    except Exception as e:
        app.logger.error(f"Error retrieving user list: {e}")
        return jsonify({'message': 'Failed to retrieve user list', 'error': str(e)}), 500


## Delete -- (deleta) ##  usage: http://127.0.0.1:5000/user/delete/<int:id>

@app.route("/user/delete/<int:id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user_by_id(id):
    try:
        # Retrieve user by id
        user = User.query.get(id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Only admins can delete users
        current_user_id = get_jwt_identity().get("user_id")
        current_user = User.query.get(current_user_id)
        
        if not current_user.is_admin:
            return jsonify({'message': 'Unauthorized to delete this user'}), 403

        # Mark the user as deleted
        user.is_deleted = True
        db.session.commit()

        return jsonify({'message': 'User deactivated successfully'}), 200
    except Exception as e:
        app.logger.error(f"Failed to deactivate user: {e}")
        return jsonify({'message': 'Failed to deactivate user', 'error': str(e)}), 500

## Update -- (put) ##  usage: http://127.0.0.1:5000/user/update/1 ==> http://127.0.0.1:5000/user/update/<int:id>

@app.route("/user/update/<int:id>", methods=["GET", "PUT"])
@jwt_required()
def user_update_by_id(id):
    user = User.query.get_or_404(id)

    # Ensure the authenticated user is updating their own profile or is an admin
    current_user_identity = get_jwt_identity()
    current_user_id = current_user_identity.get("user_id")
    if current_user_id != user.id and not current_user_identity.get("is_admin"):
        return jsonify({"message": "Unauthorized to update this user"}), 403

    if request.method == "PUT":
        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400

        if "user_name" in data:
            new_user_name = data["user_name"]
            if new_user_name != user.user_name:
                existing_user = User.query.filter_by(user_name=new_user_name).first()
                if existing_user and existing_user.id != user.id:
                    return jsonify({"message": "Username already exists"}), 400
                user.user_name = new_user_name

        if "city" in data:
            user.city = data["city"]

        if "age" in data:
            user.age = data["age"]

        if "email" in data:
            new_email = data["email"]
            if new_email != user.email:
                existing_email = User.query.filter_by(email=new_email).first()
                if existing_email and existing_email.id != user.id:
                    return jsonify({"message": "Email already exists"}), 400
                user.email = new_email

        if "password" in data:
            user.password_hash = generate_password_hash(data["password"])

        if "is_admin" in data:
            user.is_admin = data["is_admin"]

        if "is_deleted" in data:
            user.is_deleted = data["is_deleted"]

        user.updated_at = datetime.utcnow()  # Update the updated_at timestamp
        db.session.commit()
        return jsonify({"message": "User updated successfully"})

    # For GET request, return user details
    return jsonify({
        "user_name": user.user_name,
        "city": user.city,
        "age": user.age,
        "email": user.email,
        "is_admin": user.is_admin,
        "is_deleted": user.is_deleted
    })

# ----------------------------------------------------------------------------------- #
# Routes for registration, login, and private endpoint

## Create user = register -- (post) ##  usage = http://127.0.0.1:5000/register
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        app.logger.debug(f"Received data: {data}")
        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        user_name = data.get('user_name')
        city = data.get('city')
        age = data.get('age')
        email = data.get('email')
        password = data.get('password')
        is_admin = data.get('is_admin', False)  # Default to False if not provided

        if not user_name or not city or not age or not email or not password:
            return jsonify({'message': 'Username, city, age, email, and password are required'}), 400

        if '@' not in email:
            return jsonify({'message': 'Invalid email address'}), 400

        if User.query.filter_by(user_name=user_name).first():
            return jsonify({'message': 'Username already exists'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400

        password_hash = generate_password_hash(password)
        new_user = User(
            user_name=user_name,
            city=city,
            age=age,
            email=email,
            password_hash=password_hash,
            is_admin=is_admin
        )
        db.session.add(new_user)
        db.session.commit()
        app.logger.debug(f"User {user_name} registered successfully")


        return jsonify({'message': 'Registered successfully'}), 201
    except Exception as e:
        app.logger.error(f"Error during registration: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

## login user -- (post) ##  usage = http://127.0.0.1:5000/login

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    identity = user
    access_token = create_access_token(identity=identity, expires_delta=timedelta(days=7))
    return jsonify(access_token=access_token), 200

# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#BOOK_LOAN

## Create_book_loan -- (post) ##  usage = http://127.0.0.1:5000/bookloan/create
@app.route("/bookloan/create", methods=["POST"])
@jwt_required()  # Require JWT token to access this endpoint
def create_book_loan():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        user_id = data.get('user_id')
        book_id = data.get('book_id')

        if not user_id or not book_id:
            return jsonify({'message': 'User ID and Book ID are required'}), 400

        if not isinstance(user_id, int) or not isinstance(book_id, int):
            return jsonify({'message': 'User ID and Book ID need to be numbers'}), 400
        
        book = Book.query.get(book_id)
        if not book:
            return jsonify({'message': 'Book not found'}), 404
        if not book.is_available:
            return jsonify({'message': 'Book is not available for loan'}), 400

        due_date = datetime.utcnow() + timedelta(days=book.loan_period)

        book.is_available = False  # Mark the book as not available

        new_book_loan = BookLoan(
            user_id=user_id,
            book_id=book_id,
            loan_date=datetime.utcnow(),
            due_date=due_date
        )

        db.session.add(new_book_loan)
        db.session.commit()

        return jsonify({'message': 'Book loan created successfully'}), 201

    except Exception as e:
        app.logger.error(f"Error during book loan creation: {e}")
        return jsonify({'message': 'Failed to create book loan', 'error': str(e)}), 500
 
## - Return a Book -- (post) ##  usage = http://127.0.0.1:5000/bookloan/return
@app.route("/bookloan/return", methods=["POST"])
@jwt_required()
def return_book_loan():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        user_id = data.get('user_id')
        book_id = data.get('book_id')

        if not user_id or not book_id:
            return jsonify({'message': 'User ID and Book ID are required'}), 400

        if not isinstance(user_id, int) or not isinstance(book_id, int):
            return jsonify({'message': 'User ID and Book ID need to be numbers'}), 400
        
        book_loan = BookLoan.query.filter_by(user_id=user_id, book_id=book_id, return_date=None).first()
        if not book_loan:
            return jsonify({'message': 'Active book loan not found'}), 404

        book_loan.return_date = datetime.utcnow()  # Set the return date
        book = Book.query.get(book_id)
        book.is_available = True  # Mark the book as available

        db.session.commit()

        return jsonify({'message': 'Book returned successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error during book return: {e}")
        return jsonify({'message': 'Failed to return book', 'error': str(e)}), 500

# Update -- (put) ##  usage: http://127.0.0.1:5000/bookloan/update/<int:id> 

@app.route("/bookloan/update/<int:id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_book_loan_by_id(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No input data provided"}), 400

        loan = BookLoan.query.get(id)
        if not loan:
            return jsonify({'message': 'Book loan not found'}), 404

        # Logging the current state of the loan
        app.logger.info(f"Current loan state: {loan}")

        # Update book loan attributes if provided
        if 'return_date' in data:
            try:
                return_date = datetime.strptime(data['return_date'], '%Y-%m-%d %H:%M:%S')
                loan.return_date = return_date
                app.logger.info(f"Updating return_date to: {return_date}")
            except ValueError:
                return jsonify({"message": "Invalid date format. Use 'YYYY-MM-DD HH:MM:SS'"}), 400

        db.session.commit()  # Save the changes to the database
        app.logger.info(f"Loan updated: {loan}")
        return jsonify({'message': 'Book loan updated successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error during book loan update: {e}")
        return jsonify({'message': 'Failed to update book loan', 'error': str(e)}), 500


## Read - get_book_loans -- (get) ##  usage: http://127.0.0.1:5000/bookloans

@app.route("/bookloans", methods=["GET"])
@jwt_required()
@admin_required
def get_book_loans():
    try:
        book_loans = db.session.query(BookLoan, User, Book).join(User, BookLoan.user_id == User.id).join(Book, BookLoan.book_id == Book.id).all()
        
        book_loans_list = []
        for loan, user, book in book_loans:
            loan_detail = {
                'user_name': user.user_name,
                'book_name': book.book_name,
                'loan_date': loan.loan_date.isoformat(),
                'return_date': loan.return_date.isoformat() if loan.return_date else None
            }
            book_loans_list.append(loan_detail)

        return json.dumps(book_loans_list, ensure_ascii=False, indent=2), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        app.logger.error(f"Error retrieving book loans: {e}")
        return jsonify({'message': 'Failed to retrieve book loans', 'error': str(e)}), 500


## Read - getDisplay Overdue Book Loans -- (get) ##  usage: http://127.0.0.1:5000/overdue_bookloans

@app.route("/overdue_bookloans", methods=["GET"])
@jwt_required()
@admin_required
def get_overdue_book_loans():
    try:
        current_date = datetime.utcnow()
        overdue_loans = db.session.query(BookLoan, User, Book) \
            .join(User, BookLoan.user_id == User.id) \
            .join(Book, BookLoan.book_id == Book.id) \
            .filter(BookLoan.return_date == None, BookLoan.due_date < current_date) \
            .all()
        
        overdue_loans_list = []
        for loan, user, book in overdue_loans:
            loan_detail = {
                'user_name': user.user_name,
                'book_name': book.book_name,
                'loan_date': loan.loan_date.isoformat(),
                'due_date': loan.due_date.isoformat(),
                'days_overdue': (current_date - loan.due_date).days
            }
            overdue_loans_list.append(loan_detail)

        return json.dumps(overdue_loans_list, ensure_ascii=False, indent=2), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        app.logger.error(f"Error retrieving overdue book loans: {e}")
        return jsonify({'message': 'Failed to retrieve overdue book loans', 'error': str(e)}), 500

# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

#### EXAMPLE FOR ME TO TEST

@app.route('/private', methods=['GET'])
@jwt_required()
def private():
    current_user = get_jwt_identity() # get the authenticated user
    return jsonify({'message': f'Hello, {current_user}! This is a private endpoint.'}), 200

@app.route('/', methods=['GET'])
def testxtx():
    return jsonify({'message': f'Hello! This is a public endpoint.'}), 200

# Error handling
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'message': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'message': 'Unauthorized access'}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'message': 'Forbidden access'}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({'message': 'Internal server error'}), 500

# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)