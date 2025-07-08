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
});

// middleware //////////////////////////////////////////////////////////////////

    app.use(express.json());

// routes //////////////////////////////////////////////////////////////////////

app.get("/server/test", (req, res) => {
    res.send("Server is working!");
});

// listening log ///////////////////////////////////////////////////////////////

app.listen(port, () => {

    console.log(`Hosting server on http://localhost:${port}`);

});

////////////////////////////////////////////////////////////////////////////////