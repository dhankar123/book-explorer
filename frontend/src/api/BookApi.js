import axios from "axios";

const API_URL = "http://localhost:5000/api/books";

// Get all books with pagination, search & filters
export const getBooks = async (params) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

// Get book by ID
export const getBookById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};


