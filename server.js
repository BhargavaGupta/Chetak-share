const cors = require("cors");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// ✅ Ensure the uploads directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ✅ Fix CORS issue  
app.use(cors({
    origin: "*",  // Allows requests from any origin
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));

// Serve static files (if needed)
app.use(express.static("public"));

// ✅ Configure storage settings for uploaded files
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ✅ File upload route
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    res.json({
        message: "File uploaded successfully!",
        filename: req.file.filename,
        downloadURL: `http://localhost:${PORT}/download/${req.file.filename}`
    });
});

// ✅ File download route
app.get("/download/:fileId", (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.fileId);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found." });
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            res.status(500).json({ error: "Error downloading file." });
        }
    });
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
});
