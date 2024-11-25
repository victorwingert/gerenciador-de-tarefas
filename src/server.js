import db from './database/initializeDB.js'
import express from 'express'

const app = express()

app.get('/', (req, res) => {
    const tarefas = db.prepare('SELECT * FROM tarefas').all()
    res.status(200).json({
        tarefas: tarefas
    })
})

app.listen(3000)
