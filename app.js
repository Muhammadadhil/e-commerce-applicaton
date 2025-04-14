const createError = require("http-errors");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();
const session = require("express-session");
const nocache = require("nocache");
const flash = require("express-flash");

const app = express();
connectToDb();

app.use(nocache());

//configuring express-session
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(flash());
app.use(morgan("dev"));

const adminRouter = require("./routes/adminRoute");
const usersRouter = require("./routes/usersRoute");
const connectToDb = require("./utils/connectToDb");

// view engine setup
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRouter);
app.use("/", usersRouter);

app.use("/*", (req, res) => {
    res.status(404).render("user/error-404");
});

const port = process.env.PORT;
app.listen(port, () => console.log(`server running on the port http://localhost:${port}`));

module.exports = app;
