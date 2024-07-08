# Libary_frontend & backend

## About the program: 

    Here is a library.
    There are two separate libraries for frontend and backend.
    Additionally, I have divided all HTML pages into separate directories to keep 
    everything organized and easy to operate and maintain.
    Moreover, there are external CSS and JS files linked to the index page.
    I designed it in shades of brown, but you can always add more styling according to 
    your taste. In this program, all CRUD operations are implemented.
    The information is stored in JSON format, and the data is located within library.db.
    The program includes installations and uses of Flask, CORS, and Flask-SQLAlchemy.
    The passwords stored are encrypted, and there are certain actions that only an 
    admin can perform or only a user can perform.
    The program is easy to operate.
    The theme is a library, but you can use it and adapt it according to your needs 
    for other projects.

# To Do List:
    env - done

# Data base
    data.json

# Data structure
    Libary:

    1. MODEL 1: User - id, user_name, city, age, email, password_hash, 
    created_at, updated_at, last_login_at, is_admin, is_deleted  = DONE

    2. MODEL 2: Book - id, book_name, author, year_published, 
    type_1_2_3, is_available, is_deleted, loan_period, image_src = DONE

    3. MODEL 3: BookLoan - id, user_id, book_id, loan_date, return_date, due_date = DONE

# Technologies

    - Backend : HTML, CSS, JS(JAVA SCRIPT), AXIOS

    - Frontend : PYTHON WHIT FLASK, FLASK SQL_ALCHEMY, CORS

# Status - CRUD
    ** not started \  in process \ done

    backend - DONE

    frontend - DONE

    - backend:
    
    User - 
    Create (post) - done == > register
    Read all users (get)  - done
    Read whit id (get)  - done
    Update (put) - done
    Delete (del) - done 

    Book -  
    Create (post) - done
    Read (get)  - done
    Read whit id (get)  - done
    Update (put) - done
    Delete (del) - done

    Loans - 
    Create (post)  - done
    Read (get)   - done
    Update (put)  - done
    Delete (del)  - done

    endpoint = register - done
    endpoint = login - done

    - frontend:

    User - 
    Create (post) - done
    Read (get)  - done
    Update (put) - done
    Delete (del) - done

    Book - 
    Create (post) - done
    Read (get)  - done
    Update (put) - done
    Delete (del) - done

    Loans - 
    Create (post) - done
    Read (get)  - done
    Update (put) - done
    Delete (del) - done

    endpoint = register - done
    endpoint = login  - done
    

# Permissions
    * for admin: register,login, Add a new customer, Add a new book,
    Loan a book, Return a book, Display all books, Display all 
    customers, Display all loans, Display late loans, Find book by 
    name, Find customer by name, Update a book, Update a customer, 
    Remove book, Remover custome.
    
    * for user: register, login, Add a new customer, Loan a book, 
    Return a book, Display all books, Find book by name.
    
# Logic actions:
    • Add a new customer - DONE
    • Add a new book - DONE
    • Loan a book - DONE
    • Return a book - DONE
    • Display all books - DONE
    • Display all customers - DONE
    • Display all loans - DONE
    • Display late loans - DONE
    • Find book by name - DONE
    • Find customer by name - DONE
    • Update a book - DONE
    • Update a customer- DONE
    • Remove book - DONE
    • Remover custome - DONE

# Begin: 

    1. You need to activate the virtual environment.

    2. Install the requirements.
    for example to Mac : pip3 install -r Requirements.txt 
    To other computers: pip install -r Requirements.txt

    3. After that, run the program. for example to Mac : python3 app.py.
    To other computers: py app.py.

    4. You can delete the data in the db file and 
    write your own data from scratch. It will work.


`For improvements, suggestions, and constructive feedback,
I am always happy to hear from you. 
Enjoy and good luck!`