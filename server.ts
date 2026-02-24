import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("notes.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    is_pinned INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/signup", (req, res) => {
    const { username, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
      res.json({ id: info.lastInsertRowid, username });
    } catch (e) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ id: user.id, username: user.username });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Note Routes
  app.get("/api/notes", (req, res) => {
    const userId = req.query.userId;
    const notes = db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC").all(userId);
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { userId, title, content } = req.body;
    const info = db.prepare("INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)").run(userId, title, content);
    const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(info.lastInsertRowid);
    res.json(note);
  });

  app.put("/api/notes/:id", (req, res) => {
    const { title, content } = req.body;
    db.prepare("UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(title, content, req.params.id);
    res.json({ success: true });
  });

  app.patch("/api/notes/:id/pin", (req, res) => {
    const { is_pinned } = req.body;
    db.prepare("UPDATE notes SET is_pinned = ? WHERE id = ?").run(is_pinned ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/notes/:id", (req, res) => {
    db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
