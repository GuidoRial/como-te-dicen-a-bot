const express = require("express");
const app = express();

const PORT = 3000;

const quotes = require("./frases.json");

app.get("/quotes", (req, res) => {
    const index = Math.floor(Math.random() * quotes.length - 1);
    res.json({ quote: quotes[index] });
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
