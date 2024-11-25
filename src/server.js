import db from './database/initializeDB.js'
import express from 'express'

const app = express()
app.use(express.json());

app.post('/tarefas', (req, res) => {
    const maxOrderQuery = db.prepare('SELECT MAX(ordem) AS max_ordem FROM tarefas');
    const result = maxOrderQuery.get();
    const ordem = result.max_ordem ? result.max_ordem + 1 : 1;

    const query = db.prepare(`
        INSERT INTO tarefas(nome, custo, data, ordem)
        VALUES(?, ?, ?, ?)
    `)

    query.run(req.body.nome, req.body.custo, req.body.data, ordem)
    res.status(201).json(req.body)
})

app.get('/tarefas', (req, res) => {
    const query = db.prepare('SELECT * FROM tarefas').all()
    res.status(200).json(query)
})



app.listen(3000)
