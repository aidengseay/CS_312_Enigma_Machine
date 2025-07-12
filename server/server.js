// imports /////////////////////////////////////////////////////////////////////

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
dotenv.config({ path: "./secrets.env" });

// constants ///////////////////////////////////////////////////////////////////

const app = express();
const port = 8000;
const saltRounds = 10;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

// middleware //////////////////////////////////////////////////////////////////

app.use(express.json());
db.connect();

// routes //////////////////////////////////////////////////////////////////////

app.get("/", async (req, res) => {
  try {
    const dbRes = await db.query("SELECT * FROM users");
    console.log(dbRes.rows);
    res.json(dbRes.rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Database error");
  }
});


app.get("/server/test", (req, res) => {
    res.send("Server is working!");
});

// User registration
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // Check if username already exists
        const existingUser = await db.query("SELECT username FROM users WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING user_id, username",
            [username, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Server error during registration" });
    }
});

// User login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Find user
        const result = await db.query("SELECT user_id, username, password FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = result.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Return user info (without password)
        res.json({
            message: "Login successful",
            user: {
                user_id: user.user_id,
                username: user.username
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Save a message
app.post("/messages", async (req, res) => {
    try {
        const { user_id, config_id, message_text } = req.body;
        if (!user_id || !config_id || !message_text) {
            return res.status(400).json({ error: "user_id, config_id, and message_text are required" });
        }
        const result = await db.query(
            "INSERT INTO messages (user_id, config_id, message_text) VALUES ($1, $2, $3) RETURNING message_id, user_id, config_id, message_text",
            [user_id, config_id, message_text]
        );
        res.status(201).json({ message: "Message saved successfully", messageData: result.rows[0] });
    } catch (err) {
        console.error("Error saving message:", err);
        res.status(500).json({ error: "Server error while saving message" });
    }
});

// listening log ///////////////////////////////////////////////////////////////

app.listen(port, () => {

    console.log(`Hosting server on http://localhost:${port}`);

});

////////////////////////////////////////////////////////////////////////////////