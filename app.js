const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const quotes = require("./frases.json");

app.get("/quotes", (req, res) => {
    const index = Math.floor(Math.random() * quotes.length - 1);
    res.json({ quote: quotes[index] });
});

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
