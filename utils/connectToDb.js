const mongoose = require("mongoose");

function connectToDb() {
    mongoose
        .connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => {
            console.error("Failed to connect to MongoDB:", err.message);
            process.exit(1); // Exit the process if the DB connection fails
        });
}

module.exports = connectToDb;
