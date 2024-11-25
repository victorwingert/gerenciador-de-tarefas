import Database from 'better-sqlite3'

function initializeDatabase() {
    const db = new Database('./system.db')

    db.prepare(`
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            custo REAL NOT NULL,
            data TEXT NOT NULL,
            ordem INTEGER NOT NULL UNIQUE
        );
    `).run();

    return db;
}

const db = initializeDatabase()

export default db
