require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./src/routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Foundit API berjalan" });
});

app.use("/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});