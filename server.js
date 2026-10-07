const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = 8080;
const ROOT = path.resolve(__dirname);
const CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

const server = http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405);
        response.end("Method Not Allowed");
        return;
    }

    let pathname;
    try {
        pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
        response.writeHead(400);
        response.end("Bad Request");
        return;
    }

    if (pathname === "/") {
        pathname = "/login.html";
    }

    const relativePath = path.relative(ROOT, path.resolve(ROOT, `.${pathname}`));
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }

    let filePath = path.resolve(ROOT, `.${pathname}`);
    if (!path.extname(filePath)) {
        filePath += ".html";
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(error.code === "ENOENT" ? 404 : 500);
            response.end(error.code === "ENOENT" ? "Not Found" : "Internal Server Error");
            return;
        }

        response.writeHead(200, {
            "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(request.method === "HEAD" ? undefined : content);
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`MC22 Performance running on port ${PORT}`);
});

server.on("error", (err) => {
    console.error("SERVER ERROR:", err);
});

server.on("close", () => {
    console.log("SERVER CLOSED");
});
