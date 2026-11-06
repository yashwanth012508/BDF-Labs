# Lab 03: REST API, Query Parameters, Validation and Debugging

## Student & Course Information

| Parameter | Details |
| :--- | :--- |
| **Lab Number** | 03 |
| **Lab Title** | REST API, Query Parameters, Validation and Debugging |
| **Student Name** | Pujari Sai Yashwanth |
| **Registration Number** | 252U1R9133 |
| **Section** | CSE (GEN-AI) 2C |
| **Subject** | Backend Development Fundamentals |
| **Academic Term** | Year II – Term II |
| **Faculty** | Joel Prashanth D |
| **College** | Aurora |

---

## 1. Project Objective

The objective of this laboratory assignment is to design and build a production-grade, secure, and robust Express.js REST API with an embedded SQLite database (`database.db`). The project demonstrates:
- Connecting to SQLite asynchronously using `sqlite` and `sqlite3` drivers.
- Advanced querying using multiple query parameters (`search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price`).
- SQL injection prevention via SQL parameterization (`?` placeholders) and column whitelisting.
- Comprehensive request body validation (type checks, empty string verification, boundary checks).
- Accurate and standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- Systematic debugging of common backend issues (`EADDRINUSE`, bad imports, missing database tables, unhandled Promises).

---

## 2. Technology Stack

- **Node.js** (v18+ / v24+) — Server runtime environment
- **Express.js** (`express`) — Fast, unopinionated minimalist web framework
- **SQLite3** (`sqlite3`) — Self-contained, serverless relational database engine
- **SQLite Wrapper** (`sqlite`) — Promise-based wrapper enabling `async/await` syntax for SQLite
- **Nodemon** (`nodemon`) — Development utility that automatically restarts the server on file modifications
- **Postman** — API client for functional and validation testing
- **VS Code** — Code editing and terminal environment

---

## 3. Project Directory Structure

```text
lab-03/
│
├── server.js            # Express application with all 5 REST API routes & DB setup
├── package.json         # Project metadata, dependencies, and execution scripts
├── package-lock.json    # Exact dependency tree lockfile
├── database.db          # Persistent SQLite database file
├── book.sql             # SQL schema (DROP, CREATE) and 10 seed records
├── README.md            # Comprehensive laboratory documentation
├── .gitignore           # Ignores node_modules, .env, and system logs
│
└── screenshots/         # Verified Postman and terminal execution screenshots
    └── (15 screenshots documented below)
```

---

## 4. Database Schema & Seed Data

### Database: `database.db`
### Table: `book`

```sql
DROP TABLE IF EXISTS book;

CREATE TABLE book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);
```

### Column Specifications

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each book record |
| `title` | `TEXT` | `NOT NULL` | Full title of the book |
| `author` | `TEXT` | `NOT NULL` | Author(s) of the book |
| `price` | `INTEGER` | `NOT NULL` | Price in USD / standard currency units |
| `pages` | `INTEGER` | `NOT NULL` | Total number of pages |

### 10 Seed Records (`book.sql`)

```sql
INSERT INTO book (title, author, price, pages) VALUES
('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 45, 352),
('Clean Code', 'Robert C. Martin', 40, 464),
('Designing Data-Intensive Applications', 'Martin Kleppmann', 50, 616),
('System Design Interview', 'Alex Xu', 38, 300),
('JavaScript: The Good Parts', 'Douglas Crockford', 30, 176),
('Node.js Design Patterns', 'Mario Casciaro & Luciano Mammino', 42, 520),
('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 85, 1312),
('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 48, 448),
('Eloquent JavaScript', 'Marijn Haverbeke', 35, 472),
('Backend Development Fundamentals', 'Pujari Sai Yashwanth', 38, 290);
```

---

## 5. Installation & Setup Instructions

### Step 1: Navigate to the `lab-03` directory
```bash
cd lab-03
```

### Step 2: Install dependencies
Install `express`, `sqlite`, `sqlite3`, and `nodemon`:
```bash
npm install
```

### Step 3: Run the server
Start the production server:
```bash
node server.js
```
*Or run in active development mode with live reload:*
```bash
npm run dev
```

### Expected Startup Output
```text
Server Running at http://localhost:3000/
```

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/books` | Retrieve books with filtering, searching, sorting & pagination | `200 OK`, `500 Internal Error` |
| **GET** | `/books/:bookId` | Retrieve a single book by ID | `200 OK`, `404 Not Found`, `500 Internal Error` |
| **POST** | `/books` | Create a new book record (with payload validation) | `201 Created`, `400 Bad Request`, `500 Internal Error` |
| **PUT** | `/books/:bookId` | Update an existing book's details (with payload validation) | `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Error` |
| **DELETE** | `/books/:bookId` | Remove a book record by ID | `200 OK`, `404 Not Found`, `500 Internal Error` |

---

## 7. Deep-Dive API Reference & Query Parameters

### API 1: `GET /books`
Retrieves a list of books matching the specified query criteria. All parameters are optional and have built-in default values.

#### Supported Query Parameters

| Parameter | Type | Default | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search_q` | String | `""` | Partial search on book `title` using SQL `LIKE` | `?search_q=JavaScript` |
| `order_by` | String | `"id"` | Column to sort by (`id`, `title`, `author`, `price`, `pages`) | `?order_by=price` |
| `order` | String | `"ASC"` | Sort direction (`ASC` or `DESC`) | `?order=DESC` |
| `limit` | Integer | `10` | Maximum number of records to return | `?limit=5` |
| `offset` | Integer | `0` | Number of records to skip from the beginning | `?offset=5` |
| `min_price`| Number | `0` | Minimum book price filter (`price >= min_price`) | `?min_price=30` |
| `max_price`| Number | `1000000` | Maximum book price filter (`price <= max_price`) | `?max_price=45` |

#### Security Best Practices Implemented
1. **Column Whitelisting:** SQLite parameter placeholders (`?`) cannot be used for SQL identifiers such as column names or keywords (`ORDER BY ? ?`). Therefore, an allowed whitelist array `['id', 'title', 'author', 'price', 'pages']` strictly validates `order_by` and fallback defaults to `id` if unrecognized input is received.
2. **Parameterized Values:** The `search_q`, `min_price`, `max_price`, `limit`, and `offset` values are strictly passed as parameterized query arguments to eliminate SQL injection attacks completely.

---

### API 2: `GET /books/:bookId`
Retrieves a single book object by its numeric primary key.
- **Success (200 OK):** Returns the matching book JSON object.
- **Not Found (404 Not Found):** Returns `{"error": "Book not found"}`.

---

### API 3: `POST /books`
Creates a new book record in the database.

#### Required Request Body (JSON)
```json
{
  "title": "Learning Express.js",
  "author": "Pujari Sai Yashwanth",
  "price": 55,
  "pages": 350
}
```

#### Validation Rules
1. `title`: Must be present, of string type, and not empty or whitespace-only.
2. `author`: Must be present, of string type, and not empty or whitespace-only.
3. `price`: Must be a valid non-negative number (`>= 0`).
4. `pages`: Must be a valid positive integer (`> 0`).

- **Success (201 Created):**
  ```json
  {
    "message": "Book added successfully",
    "bookId": 11
  }
  ```
- **Validation Failure (400 Bad Request):**
  ```json
  {
    "error": "Title is required and must not be empty"
  }
  ```

---

### API 4: `PUT /books/:bookId`
Updates all details for an existing book record.

#### Processing Sequence
1. **Validation First:** Validates `title`, `author`, `price`, and `pages`. If any field is invalid, immediately halts and responds with `400 Bad Request`.
2. **Existence Verification:** Queries the database for `bookId`. If no matching row exists, responds with `404 Not Found`.
3. **Update Execution:** Runs parameterized SQL update statement.
4. **Success (200 OK):**
   ```json
   {
     "message": "Book updated successfully"
   }
   ```

---

### API 5: `DELETE /books/:bookId`
Deletes a book record identified by `bookId`.

#### Processing Sequence
1. Verifies if the book exists using `SELECT * FROM book WHERE id = ?`.
2. If absent, responds with `404 Not Found`:
   ```json
   {
     "error": "Book not found"
   }
   ```
3. If present, executes `DELETE FROM book WHERE id = ?` and responds with `200 OK`:
   ```json
   {
     "message": "Book deleted successfully"
   }
   ```

---

## 8. HTTP Status Codes Reference

| Status Code | Meaning | When Used in Lab 3 |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Successful `GET` requests, successful `PUT` update, successful `DELETE` |
| **`201 Created`** | Resource successfully created | Successful `POST /books` call |
| **`400 Bad Request`** | Client sent invalid data | Missing title/author, invalid price, non-numeric pages |
| **`404 Not Found`** | Resource does not exist | `GET`, `PUT`, or `DELETE` called with non-existent `bookId` (e.g. `100`) |
| **`500 Internal Server Error`** | Unhandled server/database error | Caught in route `try/catch` blocks |

---

## 9. Debugging Exercises & Real-World Solutions

### Exercise 1: `EADDRINUSE` — Port Already in Use

#### Symptom & Error Log
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (net.js:1317:16)
    at listenInCluster (net.js:1365:12)
    at Server.listen (net.js:1451:7)
```

#### Cause
Another instance of `node`, `nodemon`, or a different server process is already running and bound to port `3000`.

#### Diagnosis & Solution
- **On Windows (PowerShell / Command Prompt):**
  1. Find the Process ID (PID) occupying port 3000:
     ```powershell
     netstat -ano | findstr :3000
     ```
  2. Terminate the process using its PID (e.g., PID `14320`):
     ```powershell
     taskkill /PID 14320 /F
     ```
- **Dynamic Port Alternative:**
  Use an environment variable fallback in `server.js`:
  ```javascript
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server Running at http://localhost:${PORT}/`));
  ```

---

### Exercise 2: Wrong Import Path (`MODULE_NOT_FOUND`)

#### Symptom & Error Log
```text
Error: Cannot find module './routes/books'
Require stack:
- C:\Users\sanja\Downloads\BDF-Labs-main\lab-03\server.js
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:880:15)
```

#### Cause
Using an incorrect relative path, misspelled file name, or missing directory separator when invoking `require(...)`.

#### Diagnosis & Solution
- Double-check the exact file structure.
- Always use `path.join(__dirname, 'filename')` for resolving filesystem paths (such as `database.db`) rather than bare relative strings:
  ```javascript
  const dbPath = path.join(__dirname, 'database.db');
  ```
- Ensure file extensions and casing match the target operating system.

---

### Exercise 3: `SQLITE_ERROR: no such table: book`

#### Symptom & Error Log
```text
Database error: SQLITE_ERROR: no such table: book
```

#### Cause
The SQL query was executed before the table was created, or the table name in the SQL statement is misspelled (e.g., `books` instead of `book`), or the database was initialized with an empty file without executing the DDL schema.

#### Diagnosis & Solution
- Verify table names against `book.sql`.
- In `server.js`, execute table initialization automatically inside `initializeDBAndServer`:
  ```javascript
  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER NOT NULL,
      pages INTEGER NOT NULL
    );
  `);
  ```
- Use `PRAGMA table_info(book);` to inspect existing tables and columns.

---

### Exercise 4: Missing `await` in Asynchronous Database Calls

#### Symptom & Bug Behavior
```javascript
// BUGGY CODE:
app.get('/books/:bookId', (request, response) => {
  const { bookId } = request.params;
  const book = db.get(`SELECT * FROM book WHERE id = ?;`, [bookId]); // MISSING await!
  response.send(book); // Sends {} or undefined or Promise object!
});
```
The client receives an empty JSON `{}` or `[object Promise]`, or the route handler finishes before the query completes.

#### Cause
Database operations in `sqlite` return Promises. Without the `await` keyword (or `.then()`), the variable `book` holds a pending Promise object instead of the actual resolved row data.

#### Diagnosis & Solution
- Always declare the Express handler as `async (request, response) => { ... }`.
- Always prefix asynchronous database calls (`db.all()`, `db.get()`, `db.run()`, `db.exec()`) with `await`.
- Wrap asynchronous logic in `try / catch` blocks to capture and handle any rejection.

---

## 10. Postman Testing Guide & Verification Suite

### Complete Test Execution Table

| Test # | Request Type | Endpoint & Parameters | Request Body | Expected Status |
| :---: | :--- | :--- | :--- | :---: |
| **01** | `GET` | `http://localhost:3000/books` | None | `200 OK` (10 books) |
| **02** | `GET` | `http://localhost:3000/books?search_q=JavaScript` | None | `200 OK` (2 books) |
| **03** | `GET` | `http://localhost:3000/books?order_by=price&order=DESC` | None | `200 OK` (sorted desc) |
| **04** | `GET` | `http://localhost:3000/books?min_price=30&max_price=45` | None | `200 OK` (7 books) |
| **05** | `GET` | `http://localhost:3000/books?limit=5&offset=0` | None | `200 OK` (first 5 books) |
| **06** | `GET` | `http://localhost:3000/books/1` | None | `200 OK` (book 1) |
| **07** | `GET` | `http://localhost:3000/books/100` | None | `404 Not Found` |
| **08** | `POST` | `http://localhost:3000/books` | Valid JSON (see below) | `201 Created` |
| **09** | `POST` | `http://localhost:3000/books` | Missing `title` | `400 Bad Request` |
| **10** | `POST` | `http://localhost:3000/books` | Invalid `price`: `"invalid"` | `400 Bad Request` |
| **11** | `PUT` | `http://localhost:3000/books/1` | Valid update JSON | `200 OK` |
| **12** | `PUT` | `http://localhost:3000/books/100` | Valid JSON | `404 Not Found` |
| **13** | `DELETE` | `http://localhost:3000/books/1` | None | `200 OK` |
| **14** | `DELETE` | `http://localhost:3000/books/100` | None | `404 Not Found` |

---

## 11. Screenshots Section

Below are the 15 verified execution screenshots referenced for laboratory submission:

### 1. Server Startup
![Server Running](screenshots/01_server_running.png)

### 2. Database Verification
![Database Records](screenshots/02_database_records.png)

### 3. API 1: Get All Books
![Get All Books](screenshots/03_get_all_books.png)

### 4. API 1: Title Search (`search_q=JavaScript`)
![Search Books](screenshots/04_search_books.png)

### 5. API 1: Sorting (`order_by=price&order=DESC`)
![Sort Books](screenshots/05_sort_books.png)

### 6. API 1: Price Filtering (`min_price=30&max_price=45`)
![Price Filter](screenshots/06_filter_price.png)

### 7. API 1: Pagination (`limit=5&offset=0`)
![Pagination](screenshots/07_pagination.png)

### 8. API 2: Get Single Book (`/books/1`)
![Get Single Book](screenshots/08_get_single_book.png)

### 9. API 2: Book Not Found (`/books/100` - 404)
![Book Not Found](screenshots/09_book_not_found.png)

### 10. API 3: Add Book Success (`POST /books` - 201)
![Add Book Success](screenshots/10_add_book_success.png)

### 11. API 3: Validation Error (`POST /books` - 400)
![Add Book Validation](screenshots/11_add_book_validation.png)

### 12. API 4: Update Book Success (`PUT /books/1` - 200)
![Update Book Success](screenshots/12_update_book_success.png)

### 13. API 4: Update Book Not Found (`PUT /books/100` - 404)
![Update Book Not Found](screenshots/13_update_book_not_found.png)

### 14. API 5: Delete Book Success (`DELETE /books/1` - 200)
![Delete Book Success](screenshots/14_delete_book_success.png)

### 15. API 5: Delete Book Not Found (`DELETE /books/100` - 404)
![Delete Book Not Found](screenshots/15_delete_book_not_found.png)

---

## 12. Git & GitHub Submission Guide

### Step 1: Initialize Git Repository (if not already done)
```bash
git init
```

### Step 2: Check Status & Ensure Ignored Files
```bash
git status
```
*Verify that `node_modules/` is not tracked.*

### Step 3: Stage All Project Files
```bash
git add .
```

### Step 4: Commit with Meaningful Messages
```bash
git commit -m "feat(lab-03): implement REST API with query parameters, validation, and SQLite"
```

### Recommended Commit Message History
- `feat(db): create SQLite schema and insert 10 sample books`
- `feat(api): implement GET /books with search, sorting, filtering, and pagination`
- `feat(api): implement GET /books/:bookId with 404 handling`
- `feat(api): implement POST /books with strict input validation and 201 status`
- `feat(api): implement PUT /books/:bookId with validation and 404 handling`
- `feat(api): implement DELETE /books/:bookId with existence check`
- `docs: add comprehensive README with debugging exercises and Postman test guide`

### Step 5: Push to GitHub
```bash
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```
