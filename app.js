const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");

require("dotenv").config();

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");

// app
const app = express();

// MongoDB local ++++++++++++++++++++++++++++++++++++++++++++
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true
    // useFindAndModify: false
  })
  .then(() => console.log("database connected to local"))
  .catch(err => console.log("pas de connexion en local !!", err));

//  MongoDB Atlas +++++++++++++++++++++++++++++++++++++++++++
//mongoose;
// .connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useCreateIndex: true
// })
// .then(() => console.log("database connected to atlas"))
// .catch(err => console.log("pas de connexion with atlas !!", err));
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// routes first step (sans middleware)
// app.get("/", (req, res) => {
//   res.send("Yohouu!! heyyy");
// });
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// middleswares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);

const port = process.env.PORT || 8000;

app.listen(port, "127.0.0.1", () => {
  console.log(`server is running on port ${port}`);
});
