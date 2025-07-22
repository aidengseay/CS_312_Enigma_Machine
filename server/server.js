// imports /////////////////////////////////////////////////////////////////////

import express from "express";
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

// Get all saved messages for a user
app.get("/messages", async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }
        const result = await db.query(
            `SELECT message_id, config_id, message_text, user_id
             FROM messages
             WHERE user_id = $1
             ORDER BY message_id DESC`,
            [user_id]
        );
        res.json({ messages: result.rows });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Server error while fetching messages" });
    }
});

// Delete a message by message_id
app.delete("/messages/:message_id", async (req, res) => {
    try {
        const { message_id } = req.params;
        if (!message_id) {
            return res.status(400).json({ error: "message_id is required" });
        }
        const result = await db.query(
            "DELETE FROM messages WHERE message_id = $1 RETURNING *",
            [message_id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Message not found" });
        }
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ error: "Server error while deleting message" });
    }
});

// Change password
app.post("/change-password", async (req, res) => {
    try {
        const { user_id, current_password, new_password } = req.body;
        if (!user_id || !current_password || !new_password) {
            return res.status(400).json({ error: "user_id, current_password, and new_password are required" });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ error: "New password must be at least 6 characters" });
        }
        // Get user
        const result = await db.query("SELECT password FROM users WHERE user_id = $1", [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = result.rows[0];
        // Verify current password
        const passwordMatch = await bcrypt.compare(current_password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);
        await db.query("UPDATE users SET password = $1 WHERE user_id = $2", [hashedPassword, user_id]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: "Server error during password change" });
    }
});

// Delete account
app.post("/delete-account", async (req, res) => {
    try {
        const { user_id, password } = req.body;
        if (!user_id || !password) {
            return res.status(400).json({ error: "user_id and password are required" });
        }
        // Get user
        const result = await db.query("SELECT password FROM users WHERE user_id = $1", [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = result.rows[0];
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Password is incorrect" });
        }
        // Delete user (cascades to messages and configs)
        await db.query("DELETE FROM users WHERE user_id = $1", [user_id]);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ error: "Server error during account deletion" });
    }
});
//Save new config
// Endpoint to save a new configuration
app.post("/configs", async (req, res) => {
    // Extract fields from the request body
    let { user_id, name, rotors, reflector, plugboardPairs } = req.body;
    // Ensure a name is always saved; default to 'Unnamed Config' if blank
    const nameToSave = name && name.trim() ? name : "Unnamed Config";
    // Validate required fields
    if (!user_id || !rotors || rotors.length !== 3 || !reflector ) {
        return res.status(400).json({ error: "Missing required fields." });
    }
    // Prepare rotor and plugboard data for insertion
    const [r1, r2, r3] = rotors;
    const plugboard = plugboardPairs.map(pair => pair.join("-")).join(",");
    try {
        // Insert the new config into the database
        const result = await db.query(
            `INSERT INTO configs (
                user_id, name, 
                rotator_one, rotator_two, rotator_three,
                rotator_one_ring_setting, rotator_two_ring_setting, rotator_three_ring_setting,
                rotator_one_ring_pos, rotator_two_ring_pos, rotator_three_ring_pos,
                reflector, plugboard
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            ) RETURNING config_id`,
            [user_id, nameToSave,
                r1.spec, r2.spec, r3.spec,
                r1.ringSetting, r2.ringSetting, r3.ringSetting,
                r1.startPosition, r2.startPosition, r3.startPosition,
                reflector, plugboard]
        );
        // Format the config object to match what the frontend expects
        const config = result.rows[0];
        const formattedConfig = {
            config_id: config.config_id,
            user_id: config.user_id,
            name: config.name,
            reflector: config.reflector,
            rotors: [
                {
                    spec: config.rotator_one,
                    ringSetting: config.rotator_one_ring_setting,
                    startPosition: config.rotator_one_ring_pos
                },
                {
                    spec: config.rotator_two,
                    ringSetting: config.rotator_two_ring_setting,
                    startPosition: config.rotator_two_ring_pos
                },
                {
                    spec: config.rotator_three,
                    ringSetting: config.rotator_three_ring_setting,
                    startPosition: config.rotator_three_ring_pos
                }
            ],
            plugboardPairs: config.plugboard 
                ? config.plugboard.split(",").map(pair => pair.split("-"))
                : []
        };
        // Return the formatted config to the frontend
        res.status(201).json({ config: formattedConfig });
    } catch (err) {
        // Log and return any errors
        console.error("Error saving config:", err);
        res.status(500).json({ error: "Failed to save configuration." });
    }
});
//Get saved configs
app.get("/configs", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }
    try {
        const result = await db.query(
            `SELECT config_id, user_id, name, 
                rotator_one, rotator_two, rotator_three,
                rotator_one_ring_setting, rotator_two_ring_setting, rotator_three_ring_setting,
                rotator_one_ring_pos, rotator_two_ring_pos, rotator_three_ring_pos,
                reflector, plugboard
             FROM configs
             WHERE user_id = $1
             ORDER BY config_id DESC`,
            [user_id]
        );

        const configs = result.rows.map(config => ({
            config_id: config.config_id,
            user_id: config.user_id,
            name:config.name,
            reflector: config.reflector,
            rotors: [
                {
                    spec: config.rotator_one,
                    ringSetting: config.rotator_one_ring_setting,
                    startPosition: config.rotator_one_ring_pos
                },
                {
                    spec: config.rotator_two,
                    ringSetting: config.rotator_two_ring_setting,
                    startPosition: config.rotator_two_ring_pos
                },
                {
                    spec: config.rotator_three,
                    ringSetting: config.rotator_three_ring_setting,
                    startPosition: config.rotator_three_ring_pos
                }
            ],
            plugboardPairs: config.plugboard 
                ? config.plugboard.split(",").map(pair => pair.split("-"))
                : []
        }));

        res.json({ configs });
    } catch (err) {
        console.error("Error fetching configs:", err);
        res.status(500).json({ error: "Failed to fetch configurations." });
    }
});
//delete saved configs
app.delete("/configs/:config_id", async (req, res) => {
    const { config_id } = req.params;
    try {
        const result = await db.query(
            "DELETE FROM configs WHERE config_id = $1 RETURNING *",
            [config_id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Configuration not found" });
        }
        res.json({ message: "Configuration deleted" });
    } catch (err) {
        console.error("Error deleting config:", err);
        res.status(500).json({ error: "Failed to delete configuration" });
    }
});


// listening log ///////////////////////////////////////////////////////////////

app.listen(port, () => {

    console.log(`Hosting server on http://localhost:${port}`);

});

////////////////////////////////////////////////////////////////////////////////