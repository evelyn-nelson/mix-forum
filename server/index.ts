import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";

const app = express();
const PORT = 3001;

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = "/data/db.sqlite"
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime'))
    )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Posts table is ready or already exists.");
        }
      }
    );
  }
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/posts", (_: Request, res: Response) => {
  const sql =
    "SELECT id, author, content, created_at FROM posts ORDER BY created_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching posts:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post("/posts", async (req: Request, res: Response) => {
  const { author, content } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    res
      .status(400)
      .json({ error: "Content is required and must be a non-empty string." });
    return;
  }

  const finalAuthor =
    author && typeof author === "string" && author.trim() !== ""
      ? author.trim()
      : "Anonymous";

  const sql = "INSERT INTO posts (author, content) VALUES (?, ?)";
  db.run(sql, [finalAuthor, content.trim()], function (err) {
    if (err) {
      console.error("Error inserting post:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    db.get(
      "SELECT id, author, content, created_at FROM posts WHERE id = ?",
      [this.lastID],
      (err, row) => {
        if (err) {
          console.error("Error fetching newly created post:", err.message);
          return res
            .status(500)
            .json({ error: "Post created, but failed to retrieve it." });
        }
        res.status(201).json(row);
        return;
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});
