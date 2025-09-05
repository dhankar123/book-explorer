const pool = require("../db/index.js");

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    let { page, limit, search, rating, minPrice, maxPrice, stock } = req.query;

    // Defaults
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Base query
    let query = "SELECT * FROM books WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM books WHERE 1=1";
    let values = [];
    let whereClauses = [];

    // Search filter
    if (search) {
      values.push(`%${search}%`);
      whereClauses.push(`(title ILIKE $${values.length})`);
    }

    // Rating filter
    if (rating) {
      values.push(rating);
      whereClauses.push(`rating = $${values.length}`);
    }

    // Price range filter
    if (minPrice) {
      values.push(minPrice);
      whereClauses.push(`price >= $${values.length}`);
    }
    if (maxPrice) {
      values.push(maxPrice);
      whereClauses.push(`price <= $${values.length}`);
    }

    // Stock filter
    if (stock === "in") {
      whereClauses.push("stock_availability = true");
    } else if (stock === "out") {
      whereClauses.push("stock_availability = false");
    }

    // Append filters
    if (whereClauses.length > 0) {
      query += " AND " + whereClauses.join(" AND ");
      countQuery += " AND " + whereClauses.join(" AND ");
    }

    // Add pagination
    query += ` ORDER BY id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // Run queries
    const result = await pool.query(query, values);
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));

    res.json({
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      books: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
