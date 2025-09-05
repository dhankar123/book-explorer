const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors());

const bookRoutes = require("./src/routes/BookRoutes");

app.use("/api/books", bookRoutes);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
