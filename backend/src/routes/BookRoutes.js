const express = require("express");
const router = express.Router();
const BookController = require("../controllers/BookController");

// Routes
router.get("/", BookController.getAllBooks);
router.get("/:id", BookController.getBookById);

module.exports = router;
