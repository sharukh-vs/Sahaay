const express = require('express');
const app = express();
const mongoose = require('mongoose')

const dotenv = require("dotenv")
dotenv.config();

const cors = require('cors')

app.use(express.json());
app.use(cors());

//ROUTES
app.use("/api/auth", require("./routes/authRoutes"))

mongoose.connect(process.env.DATABASE, {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false
})
.then(() => console.log("Database Connection successfull"));

const PORT = process.env.PORT || 5000
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, ()=>console.log(`Server running on ${PORT}`));
