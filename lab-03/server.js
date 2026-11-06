/**
 * Lab 03: REST API, Query Parameters, Validation and Debugging
 *
 * Student Details:
 * - Student Name: Pujari Sai Yashwanth
 * - Registration Number: 252U1R9133
 * - Section: CSE (GEN-AI) 2C
 * - Subject: Backend Development Fundamentals
 * - Year: II – Term II
 * - Faculty: Joel Prashanth D
 * - College: Aurora
 */

const express = require('express')
const path = require('path')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

// Middleware to parse JSON request bodies
app.use(express.json())

// Database connection path
const dbPath = path.join(__dirname, 'database.db')
let db = null

// Initialize SQLite Database and Express Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Auto-create table and seed data if table does not exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `)

    // Seed initial records if book table is empty
    const bookCount = await db.get(`SELECT COUNT(*) AS count FROM book;`)
    if (bookCount.count === 0) {
      await db.exec(`
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
      `)
      console.log('Database seeded with 10 sample books.')
    }

    const PORT = 3000
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`)
    })
  } catch (error) {
    console.error(`Database connection error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// Root Route
app.get('/', (request, response) => {
  response.send('Server Running at http://localhost:3000/')
})

// =============================================================================
// API 1: GET /books
// Fetch books with filtering, searching, sorting, and pagination
// Supports query parameters:
// - search_q: Partial title search using LIKE
// - order_by: Sort column (id, title, author, price, pages)
// - order: Sort direction (ASC, DESC)
// - limit: Number of records to return
// - offset: Starting offset for pagination
// - min_price: Minimum price filter
// - max_price: Maximum price filter
// =============================================================================
app.get('/books', async (request, response) => {
  try {
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = 10,
      offset = 0,
      min_price = 0,
      max_price = 1000000,
    } = request.query

    // Whitelist allowed order_by columns to prevent SQL injection
    const allowedColumns = ['id', 'title', 'author', 'price', 'pages']
    const validOrderBy = allowedColumns.includes(order_by) ? order_by : 'id'

    // Whitelist allowed sort direction
    const validOrder =
      typeof order === 'string' && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'

    // Parse and normalize numeric parameters
    const parsedLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10
    const parsedOffset = parseInt(offset, 10) >= 0 ? parseInt(offset, 10) : 0
    const parsedMinPrice = !isNaN(Number(min_price)) ? Number(min_price) : 0
    const parsedMaxPrice = !isNaN(Number(max_price)) ? Number(max_price) : 1000000

    // Parameterized SQL query for security and flexibility
    const getBooksQuery = `
      SELECT *
      FROM book
      WHERE title LIKE ? AND price >= ? AND price <= ?
      ORDER BY ${validOrderBy} ${validOrder}
      LIMIT ? OFFSET ?;
    `

    const books = await db.all(getBooksQuery, [
      `%${search_q}%`,
      parsedMinPrice,
      parsedMaxPrice,
      parsedLimit,
      parsedOffset,
    ])

    response.status(200).json(books)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// =============================================================================
// API 2: GET /books/:bookId
// Fetch a single book by ID
// - Returns 200 with the book object if found
// - Returns 404 with JSON error if not found
// =============================================================================
app.get('/books/:bookId', async (request, response) => {
  try {
    const { bookId } = request.params

    const getBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `

    const book = await db.get(getBookQuery, [bookId])

    if (!book) {
      return response.status(404).json({ error: 'Book not found' })
    }

    response.status(200).json(book)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// =============================================================================
// API 3: POST /books
// Add a new book record with body validation
// - Returns 201 with success message and book ID
// - Returns 400 if validation fails
// =============================================================================
app.post('/books', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body

    // Validation: title must not be missing or empty
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return response.status(400).json({ error: 'Title is required and must not be empty' })
    }

    // Validation: author must not be missing or empty
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return response.status(400).json({ error: 'Author is required and must not be empty' })
    }

    // Validation: price must be numeric and non-negative
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return response.status(400).json({ error: 'Price must be a valid non-negative number' })
    }

    // Validation: pages must be numeric and a positive integer
    if (
      pages === undefined ||
      pages === null ||
      isNaN(Number(pages)) ||
      !Number.isInteger(Number(pages)) ||
      Number(pages) <= 0
    ) {
      return response.status(400).json({ error: 'Pages must be a valid positive integer' })
    }

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `

    const result = await db.run(addBookQuery, [
      title.trim(),
      author.trim(),
      Number(price),
      Number(pages),
    ])

    response.status(201).json({
      message: 'Book added successfully',
      bookId: result.lastID,
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// =============================================================================
// API 4: PUT /books/:bookId
// Update an existing book's details after validating request body
// - Returns 200 if updated successfully
// - Returns 400 if validation fails
// - Returns 404 if book ID does not exist
// =============================================================================
app.put('/books/:bookId', async (request, response) => {
  try {
    const { bookId } = request.params
    const { title, author, price, pages } = request.body

    // Validation must be performed before updating
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return response.status(400).json({ error: 'Title is required and must not be empty' })
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      return response.status(400).json({ error: 'Author is required and must not be empty' })
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return response.status(400).json({ error: 'Price must be a valid non-negative number' })
    }

    if (
      pages === undefined ||
      pages === null ||
      isNaN(Number(pages)) ||
      !Number.isInteger(Number(pages)) ||
      Number(pages) <= 0
    ) {
      return response.status(400).json({ error: 'Pages must be a valid positive integer' })
    }

    // Check if the book exists
    const checkBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `
    const existingBook = await db.get(checkBookQuery, [bookId])

    if (!existingBook) {
      return response.status(404).json({ error: 'Book not found' })
    }

    // Update book details
    const updateBookQuery = `
      UPDATE book
      SET title = ?,
          author = ?,
          price = ?,
          pages = ?
      WHERE id = ?;
    `

    await db.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      Number(price),
      Number(pages),
      bookId,
    ])

    response.status(200).json({ message: 'Book updated successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// =============================================================================
// API 5: DELETE /books/:bookId
// Delete a book by ID
// - Returns 200 if deleted successfully
// - Returns 404 if book ID does not exist
// =============================================================================
app.delete('/books/:bookId', async (request, response) => {
  try {
    const { bookId } = request.params

    // Check if the book exists
    const checkBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `
    const existingBook = await db.get(checkBookQuery, [bookId])

    if (!existingBook) {
      return response.status(404).json({ error: 'Book not found' })
    }

    // Delete the book
    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `
    await db.run(deleteBookQuery, [bookId])

    response.status(200).json({ message: 'Book deleted successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = app
