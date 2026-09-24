const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`MC22 Performance running on port ${PORT}`);
});

server.on("error", (err) => {
    console.error("SERVER ERROR:", err);
});

server.on("close", () => {
    console.log("SERVER CLOSED");
});
