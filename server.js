import Database from 'better-sqlite3'
import express from 'express'

const db = new Database('./system.db')
const app = express()

app.get('/', (req, res) => {
    const tarefas = db.prepare('SELECT * FROM tarefas').all()
    res.status(200).json({ tarefas: tarefas })
})

app.listen(3000)
