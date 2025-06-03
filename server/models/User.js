const db = require("../config/db");

const User = {
    create: (username, fullname, usn, branch, yop, email, password, callback) => {
        const query = "INSERT INTO users (username, fullname, usn, branch, yop, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(query, [username, fullname, usn, branch, yop, email, password], callback);
    },
    findByEmail: (email, callback) => {
        db.query("SELECT * FROM users WHERE email = ?", [email], callback);
    }
};

module.exports = User;
