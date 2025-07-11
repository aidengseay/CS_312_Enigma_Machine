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

// test function for database access
app.get("/db-test", async (req, res) => {
    try {
      const dbRes = await db.query("SELECT * FROM users");
      console.log("DB is connected!")
      res.send("DB is connected!");
    } catch (err) {
      console.log("DB error");
      res.send("DB error");
    }
});

// test function for backend server access
app.get("/server-test", (req, res) => {
    console.log("Server is working!");
    res.send("Server is working!");
});

// listening log ///////////////////////////////////////////////////////////////

app.listen(port, () => {

    console.log(`Hosting server on http://localhost:${port}`);

});

////////////////////////////////////////////////////////////////////////////////