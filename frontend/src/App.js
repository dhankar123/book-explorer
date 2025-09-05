import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

// ⭐ Small star rating display
function StarRating({ value }) {
  return (
    <div style={{ color: "#f4c150", fontSize: "14px" }}>
      {"★".repeat(value)}{"☆".repeat(5 - value)}
    </div>
  );
}

// 📖 Book Card
function BookCard({ book, onOpen }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        background: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <img
        src={"https://books.toscrape.com" + book.thumbnail_image_url.substring(2)}
        alt={book.title}
        style={{
          height: "160px",
          objectFit: "cover",
          borderRadius: "6px",
          marginBottom: "12px",
        }}
        onError={(e) => {
          e.target.src = "/placeholder-book.png";
        }}
      />
      <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>{book.title}</h3>
      <p style={{ fontWeight: "bold", marginBottom: "4px" }}>₹{book.price}</p>
      <StarRating value={book.rating} />
      <p
        style={{
          fontSize: "14px",
          color: book.stock_availability ? "green" : "red",
        }}
      >
        {book.stock_availability ? "✅ In Stock" : "❌ Out of Stock"}
      </p>
      <button
        onClick={() => onOpen(book.id)}
        style={{
          marginTop: "10px",
          padding: "8px",
          borderRadius: "4px",
          border: "none",
          background: "#4f46e5",
          color: "white",
          cursor: "pointer",
        }}
      >
        View Details
      </button>
    </div>
  );
}

// 📑 Pagination
function Pagination({ page, totalPages, setPage }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "25px",
      }}
    >
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
        ⬅ Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
      >
        Next ➡
      </button>
    </div>
  );
}

// Filters
function Filters({ filters, setFilters }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "8px",
        background: "#fff",
        marginBottom: "20px",
      }}
    >
      <h3>Filters</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* Rating */}
      <select
        value={filters.rating}
        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      >
        <option value="">Any Rating</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="5">5</option>
      </select>

      {/* Availability */}
      <select
        value={filters.inStock}
        onChange={(e) => setFilters({ ...filters, inStock: e.target.value })}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      >
        <option value="">Any Stock</option>
        <option value="true">In Stock</option>
        <option value="false">Out of Stock</option>
      </select>

      {/* Price Range */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="number"
          placeholder="Min ₹"
          value={filters.priceMin}
          onChange={(e) =>
            setFilters({ ...filters, priceMin: e.target.value })
          }
          style={{ flex: 1, padding: "8px" }}
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={filters.priceMax}
          onChange={(e) =>
            setFilters({ ...filters, priceMax: e.target.value })
          }
          style={{ flex: 1, padding: "8px" }}
        />
      </div>
    </div>
  );
}

// 📖 Details Modal
function BookDetailsModal({ id, onClose }) {
  const [book, setBook] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE}/${id}`).then((res) => setBook(res.data));
  }, [id]);

  if (!id) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "500px",
          maxWidth: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {book ? (
          <>
            <h2>{book.title}</h2>
            <img
              src={
                "https://books.toscrape.com" +
                book.thumbnail_image_url.substring(2)
              }
              alt={book.title}
              style={{
                width: "50%",
                height: "200px",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            />
            <p>
              <strong>Price:</strong> ₹{book.price}
            </p>
            <p>
              <strong>Rating:</strong> <StarRating value={book.rating} />
            </p>
            <p>
              <strong>Availability:</strong>{" "}
              {book.stock_availability ? "✅ In Stock" : "❌ Out of Stock"}
            </p>
            <p>
              <a href={book.book_detail_url} target="_blank" rel="noreferrer">
                🔗 More Info
              </a>
            </p>
            <button onClick={onClose} style={{ marginTop: "10px" }}>
              Close
            </button>
          </>
        ) : (
          <p>Loading details...</p>
        )}
      </div>
    </div>
  );
}

// 🚀 Main App
export default function App() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    rating: "",
    inStock: "",
    priceMin: "",
    priceMax: "",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(8); 
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBookId, setSelectedBookId] = useState(null);

  useEffect(() => {
    const params = { page, limit };

    if (filters.search) params.search = filters.search;
    if (filters.rating) params.rating = filters.rating;
    if (filters.inStock !== "") {
      params.stock = filters.inStock === "true" ? "in" : "out";
    }
    if (filters.priceMin !== "") params.minPrice = Number(filters.priceMin);
    if (filters.priceMax !== "") params.maxPrice = Number(filters.priceMax);

    axios.get(API_BASE, { params }).then((res) => {
      setBooks(res.data.books);
      setTotalPages(Math.ceil(res.data.total / limit));
    });
  }, [page, limit, filters]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        📚 Book Explorer
      </h1>

      {/* Filters */}
      <Filters filters={filters} setFilters={setFilters} />

      {/* Book Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} onOpen={setSelectedBookId} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Details Modal */}
      <BookDetailsModal
        id={selectedBookId}
        onClose={() => setSelectedBookId(null)}
      />
    </div>
  );
}
