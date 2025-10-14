const express = require('express');
const app = express();

const dotenv = require("dotenv")
dotenv.config();

const cors = require('cors')

app.use(express.json());
app.use(cors());
app.use("/api/auth", require("./routes/authRoutes"))

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
