require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./src/routes/reportRoutes");
const corsOptions = require("./src/config/corsOptions");
const notFound = require("./src/middleware/notFound");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Foundit API berjalan" });
});

app.use("/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});