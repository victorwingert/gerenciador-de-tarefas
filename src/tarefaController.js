import db from './database/initializeDB.js'

export const createTarefa = (req, res) => {
    const maxOrderQuery = db.prepare('SELECT MAX(ordem) AS max_ordem FROM tarefas')
    const result = maxOrderQuery.get()
    const ordem = result.max_ordem ? result.max_ordem + 1 : 1

    const query = db.prepare(`
        INSERT INTO tarefas(nome, custo, data, ordem)
        VALUES(?, ?, ?, ?)
    `)

    query.run(req.body.nome, req.body.custo, req.body.data, ordem)

    res.status(201).json(req.body)
}

export const getTarefas = (req, res) => {
    const query = db.prepare('SELECT * FROM tarefas').all()

    res.status(200).json(query)
}

export const updateTarefa = (req, res) => {
    const query = db.prepare(`
        UPDATE tarefas
        SET nome = ?,
            custo = ?,
            data = ?
        WHERE
            id = ?
    `)

    query.run(req.body.nome, req.body.custo, req.body.data, req.params.id)

    res.status(201).json(req.body)
}

export const deleteTarefa = (req, res) => {
    const tarefaId = req.params.id

    const ordemQuery = db.prepare(`
        SELECT ordem FROM tarefas WHERE id = ?
    `);
    const ordemTarefaDeletada = ordemQuery.get(tarefaId)

    if (!ordemTarefaDeletada) {
        return res.status(404).json({ message: "Tarefa não encontrada!" })
    }

    const delQuery = db.prepare(`
        DELETE FROM tarefas WHERE id = ?
    `);
    delQuery.run(tarefaId);

    const updateQuery = db.prepare(`
        UPDATE tarefas
        SET ordem = ordem - 1
        WHERE ordem > ?
    `);
    updateQuery.run(ordemTarefaDeletada.ordem)

    res.status(200).json({ message: "Tarefa deletada e lista reordenada com sucesso!" })
}

export const updateOrdemTarefa = (req, res) => {
    const query = db.prepare(`
        UPDATE tarefas
        SET ordem = ?
        WHERE
            id = ?
    `)

    query.run(req.body.ordem, req.params.id)

    res.status(201).json(req.body)
}
