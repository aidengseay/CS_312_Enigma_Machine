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

// validation functions ////////////////////////////////////////////////////////

/**
 * Validates username format and length
 * @param {string} username - The username to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { isValid: false, error: "Username is required and must be a string" };
    }
    
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
        return { isValid: false, error: "Username cannot be empty" };
    }
    
    if (trimmedUsername.length > 50) {
        return { isValid: false, error: "Username must be 50 characters or less" };
    }
    
    // Allow alphanumeric characters, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
        return { isValid: false, error: "Username can only contain letters, numbers, underscores, and hyphens" };
    }
    
    return { isValid: true, username: trimmedUsername };
}

/**
 * Validates password strength and format
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: "Password is required and must be a string" };
    }
    
    if (password.length < 6) {
        return { isValid: false, error: "Password must be at least 6 characters long" };
    }
    
    if (password.length > 255) {
        return { isValid: false, error: "Password must be 255 characters or less" };
    }
    
    return { isValid: true };
}

/**
 * Validates user_id format
 * @param {any} user_id - The user_id to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validateUserId(user_id) {
    if (!user_id) {
        return { isValid: false, error: "User ID is required" };
    }
    
    const userIdNum = parseInt(user_id);
    if (isNaN(userIdNum) || userIdNum <= 0) {
        return { isValid: false, error: "User ID must be a positive integer" };
    }
    
    return { isValid: true, userId: userIdNum };
}

/**
 * Validates rotor configuration
 * @param {Array} rotors - Array of rotor objects
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validateRotors(rotors) {
    if (!Array.isArray(rotors) || rotors.length !== 3) {
        return { isValid: false, error: "Exactly 3 rotors are required" };
    }
    
    const validRotorSpecs = ['I', 'II', 'III', 'IV', 'V'];
    
    for (let i = 0; i < rotors.length; i++) {
        const rotor = rotors[i];
        
        if (!rotor || typeof rotor !== 'object') {
            return { isValid: false, error: `Rotor ${i + 1} must be an object` };
        }
        
        if (!validRotorSpecs.includes(rotor.spec)) {
            return { isValid: false, error: `Rotor ${i + 1} spec must be one of: ${validRotorSpecs.join(', ')}` };
        }
        
        if (typeof rotor.ringSetting !== 'number' || rotor.ringSetting < 0 || rotor.ringSetting > 25) {
            return { isValid: false, error: `Rotor ${i + 1} ring setting must be a number between 0 and 25` };
        }
        
        if (typeof rotor.startPosition !== 'number' || rotor.startPosition < 0 || rotor.startPosition > 25) {
            return { isValid: false, error: `Rotor ${i + 1} start position must be a number between 0 and 25` };
        }
    }
    
    return { isValid: true };
}

/**
 * Validates reflector configuration
 * @param {string} reflector - The reflector specification
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validateReflector(reflector) {
    const validReflectors = ['UKW_B', 'UKW_C'];
    
    if (!reflector || !validReflectors.includes(reflector)) {
        return { isValid: false, error: `Reflector must be one of: ${validReflectors.join(', ')}` };
    }
    
    return { isValid: true };
}

/**
 * Validates plugboard pairs
 * @param {Array} plugboardPairs - Array of letter pairs
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validatePlugboardPairs(plugboardPairs) {
    if (!Array.isArray(plugboardPairs)) {
        return { isValid: false, error: "Plugboard pairs must be an array" };
    }
    
    if (plugboardPairs.length > 13) {
        return { isValid: false, error: "Maximum 13 plugboard pairs allowed" };
    }
    
    const usedLetters = new Set();
    
    for (let i = 0; i < plugboardPairs.length; i++) {
        const pair = plugboardPairs[i];
        
        if (!Array.isArray(pair) || pair.length !== 2) {
            return { isValid: false, error: `Plugboard pair ${i + 1} must be an array with exactly 2 letters` };
        }
        
        const [letter1, letter2] = pair;
        
        if (typeof letter1 !== 'string' || typeof letter2 !== 'string') {
            return { isValid: false, error: `Plugboard pair ${i + 1} must contain string letters` };
        }
        
        const upperLetter1 = letter1.toUpperCase();
        const upperLetter2 = letter2.toUpperCase();
        
        if (!/^[A-Z]$/.test(upperLetter1) || !/^[A-Z]$/.test(upperLetter2)) {
            return { isValid: false, error: `Plugboard pair ${i + 1} must contain single letters A-Z` };
        }
        
        if (upperLetter1 === upperLetter2) {
            return { isValid: false, error: `Plugboard pair ${i + 1} cannot connect a letter to itself` };
        }
        
        if (usedLetters.has(upperLetter1) || usedLetters.has(upperLetter2)) {
            return { isValid: false, error: `Letter in plugboard pair ${i + 1} is already used in another pair` };
        }
        
        usedLetters.add(upperLetter1);
        usedLetters.add(upperLetter2);
    }
    
    return { isValid: true };
}

/**
 * Validates message text
 * @param {string} message_text - The message text to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validateMessageText(message_text) {
    if (!message_text || typeof message_text !== 'string') {
        return { isValid: false, error: "Message text is required and must be a string" };
    }
    
    const trimmedMessage = message_text.trim();
    if (trimmedMessage.length === 0) {
        return { isValid: false, error: "Message text cannot be empty" };
    }
    
    if (trimmedMessage.length > 10000) {
        return { isValid: false, error: "Message text must be 10,000 characters or less" };
    }
    
    return { isValid: true, messageText: trimmedMessage };
}

/**
 * Validates config name
 * @param {string} name - The config name to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
function validateConfigName(name) {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: "Configuration name is required and must be a string" };
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        return { isValid: false, error: "Configuration name cannot be empty" };
    }
    
    if (trimmedName.length > 100) {
        return { isValid: false, error: "Configuration name must be 100 characters or less" };
    }
    
    return { isValid: true, name: trimmedName };
}

// error handling middleware //////////////////////////////////////////////////

/**
 * Global error handler middleware
 */
app.use((err, req, res, next) => {
    // Log error for debugging (but don't expose details to client)
    console.error('Server error:', err);
    
    // Send generic error response
    res.status(500).json({ 
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later."
    });
});

// middleware //////////////////////////////////////////////////////////////////

app.use(express.json());
db.connect();

// routes //////////////////////////////////////////////////////////////////////

// User registration
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input using validation functions
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            return res.status(400).json({ error: usernameValidation.error });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Check if username already exists
        const existingUser = await db.query("SELECT username FROM users WHERE username = $1", [usernameValidation.username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING user_id, username",
            [usernameValidation.username, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (err) {
        // Pass error to global error handler
        next(err);
    }
});

// User login
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            return res.status(400).json({ error: usernameValidation.error });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Find user
        const result = await db.query("SELECT user_id, username, password FROM users WHERE username = $1", [usernameValidation.username]);
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
        next(err);
    }
});

// Save a message
app.post("/messages", async (req, res) => {
    try {
        const { user_id, config_id, message_text } = req.body;
        
        // Validate all required fields
        const userIdValidation = validateUserId(user_id);
        if (!userIdValidation.isValid) {
            return res.status(400).json({ error: userIdValidation.error });
        }

        const configIdValidation = validateUserId(config_id); // Reuse user_id validation for config_id
        if (!configIdValidation.isValid) {
            return res.status(400).json({ error: "Valid config_id is required" });
        }

        const messageValidation = validateMessageText(message_text);
        if (!messageValidation.isValid) {
            return res.status(400).json({ error: messageValidation.error });
        }

        // Verify user exists
        const userCheck = await db.query("SELECT user_id FROM users WHERE user_id = $1", [userIdValidation.userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify config exists and belongs to user
        const configCheck = await db.query("SELECT config_id FROM configs WHERE config_id = $1 AND user_id = $2", [configIdValidation.userId, userIdValidation.userId]);
        if (configCheck.rows.length === 0) {
            return res.status(404).json({ error: "Configuration not found or does not belong to user" });
        }

        const result = await db.query(
            "INSERT INTO messages (user_id, config_id, message_text) VALUES ($1, $2, $3) RETURNING message_id, user_id, config_id, message_text",
            [userIdValidation.userId, configIdValidation.userId, messageValidation.messageText]
        );
        res.status(201).json({ message: "Message saved successfully", messageData: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

// Get all saved messages for a user
app.get("/messages", async (req, res) => {
    try {
        const { user_id } = req.query;
        
        const userIdValidation = validateUserId(user_id);
        if (!userIdValidation.isValid) {
            return res.status(400).json({ error: userIdValidation.error });
        }

        const result = await db.query(
            `SELECT message_id, config_id, message_text, user_id
             FROM messages
             WHERE user_id = $1
             ORDER BY message_id DESC`,
            [userIdValidation.userId]
        );
        res.json({ messages: result.rows });
    } catch (err) {
        next(err);
    }
});

// Delete a message by message_id
app.delete("/messages/:message_id", async (req, res) => {
    try {
        const { message_id } = req.params;
        
        const messageIdValidation = validateUserId(message_id); // Reuse user_id validation
        if (!messageIdValidation.isValid) {
            return res.status(400).json({ error: "Valid message_id is required" });
        }

        const result = await db.query(
            "DELETE FROM messages WHERE message_id = $1 RETURNING *",
            [messageIdValidation.userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Message not found" });
        }
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        next(err);
    }
});

// Change password
app.post("/change-password", async (req, res) => {
    try {
        const { user_id, current_password, new_password } = req.body;
        
        const userIdValidation = validateUserId(user_id);
        if (!userIdValidation.isValid) {
            return res.status(400).json({ error: userIdValidation.error });
        }

        const currentPasswordValidation = validatePassword(current_password);
        if (!currentPasswordValidation.isValid) {
            return res.status(400).json({ error: currentPasswordValidation.error });
        }

        const newPasswordValidation = validatePassword(new_password);
        if (!newPasswordValidation.isValid) {
            return res.status(400).json({ error: newPasswordValidation.error });
        }

        // Get user
        const result = await db.query("SELECT password FROM users WHERE user_id = $1", [userIdValidation.userId]);
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
        await db.query("UPDATE users SET password = $1 WHERE user_id = $2", [hashedPassword, userIdValidation.userId]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
});

// Delete account
app.post("/delete-account", async (req, res) => {
    try {
        const { user_id, password } = req.body;
        
        const userIdValidation = validateUserId(user_id);
        if (!userIdValidation.isValid) {
            return res.status(400).json({ error: userIdValidation.error });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Get user
        const result = await db.query("SELECT password FROM users WHERE user_id = $1", [userIdValidation.userId]);
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
        await db.query("DELETE FROM users WHERE user_id = $1", [userIdValidation.userId]);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        next(err);
    }
});

// Save new config
app.post("/configs", async (req, res) => {
    try {
        // Extract fields from the request body
        let { user_id, name, rotors, reflector, plugboardPairs } = req.body;
        
        // Validate all required fields
        const userIdValidation = validateUserId(user_id);
        if (!userIdValidation.isValid) {
            return res.status(400).json({ error: userIdValidation.error });
        }

        const nameValidation = validateConfigName(name);
        if (!nameValidation.isValid) {
            return res.status(400).json({ error: nameValidation.error });
        }

        const rotorsValidation = validateRotors(rotors);
        if (!rotorsValidation.isValid) {
            return res.status(400).json({ error: rotorsValidation.error });
        }

        const reflectorValidation = validateReflector(reflector);
        if (!reflectorValidation.isValid) {
            return res.status(400).json({ error: reflectorValidation.error });
        }

        const plugboardValidation = validatePlugboardPairs(plugboardPairs || []);
        if (!plugboardValidation.isValid) {
            return res.status(400).json({ error: plugboardValidation.error });
        }

        // Verify user exists
        const userCheck = await db.query("SELECT user_id FROM users WHERE user_id = $1", [userIdValidation.userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prepare rotor and plugboard data for insertion
        const [r1, r2, r3] = rotors;
        const plugboard = plugboardPairs.map(pair => pair.join("-")).join(",");
        
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
            [userIdValidation.userId, nameValidation.name,
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
        next(err);
    }
});

// Get saved configs
app.get("/configs", async (req, res) => {
    try {
        const { user_id } = req.query;
        
        const userIdValidation = validateUserId(user_id);
        if (!userIdValidation.isValid) {
            return res.status(400).json({ error: userIdValidation.error });
        }

        const result = await db.query(
            `SELECT config_id, user_id, name, 
                rotator_one, rotator_two, rotator_three,
                rotator_one_ring_setting, rotator_two_ring_setting, rotator_three_ring_setting,
                rotator_one_ring_pos, rotator_two_ring_pos, rotator_three_ring_pos,
                reflector, plugboard
             FROM configs
             WHERE user_id = $1
             ORDER BY config_id DESC`,
            [userIdValidation.userId]
        );

        const configs = result.rows.map(config => ({
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
        }));

        res.json({ configs });
    } catch (err) {
        next(err);
    }
});

// Delete saved configs
app.delete("/configs/:config_id", async (req, res) => {
    try {
        const { config_id } = req.params;
        
        const configIdValidation = validateUserId(config_id); // Reuse user_id validation
        if (!configIdValidation.isValid) {
            return res.status(400).json({ error: "Valid config_id is required" });
        }

        const result = await db.query(
            "DELETE FROM configs WHERE config_id = $1 RETURNING *",
            [configIdValidation.userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Configuration not found" });
        }
        res.json({ message: "Configuration deleted" });
    } catch (err) {
        next(err);
    }
});

// listening log ///////////////////////////////////////////////////////////////

app.listen(port, () => {
    console.log(`Hosting server on http://localhost:${port}`);
});

////////////////////////////////////////////////////////////////////////////////