-- =============================================================================
-- Database Schema and Seed Data for Lab 03
-- Student Name: Pujari Sai Yashwanth
-- Registration Number: 252U1R9133
-- Section: CSE (GEN-AI) 2C
-- Subject: Backend Development Fundamentals
-- Faculty: Joel Prashanth D
-- College: Aurora
-- =============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS book;

-- Create the book table
CREATE TABLE book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);

-- Insert 10 sample records
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
