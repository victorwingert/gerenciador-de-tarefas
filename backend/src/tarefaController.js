import db from './database/initializeDB.js'

export const createTarefa = (req, res) => {
    const { nome, custo, data } = req.body

    const checkQuery = db.prepare('SELECT COUNT(*) AS count FROM tarefas WHERE nome = ?');
    const checkResult = checkQuery.get(nome);

    if (checkResult.count > 0) {
        return res.status(409).json({ message: 'Já existe uma tarefa com esse nome.' });
    }

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
    const { nome, custo, data } = req.body
    const tarefaId = req.params.id

    const tarefaAtualQuery = db.prepare('SELECT nome FROM tarefas WHERE id = ?')
    const tarefaAtual = tarefaAtualQuery.get(tarefaId)

    let updateFields = []
    let params = []

    if (tarefaAtual.nome !== nome) {
        const checkQuery = db.prepare('SELECT COUNT(*) AS count FROM tarefas WHERE nome = ?');
        const checkResult = checkQuery.get(nome);
    
        if (checkResult.count > 0) {
            return res.status(409).json({ message: 'Já existe uma tarefa com esse nome.' });
        }
        updateFields.push('nome = ?');
        params.push(nome);
    }

    if (tarefaAtual.custo !== custo) {
        updateFields.push('custo = ?');
        params.push(custo);
    }

    if (tarefaAtual.data !== data) {
        updateFields.push('data = ?');
        params.push(data);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: "Nenhuma alteração detectada." });
    }

    const sql = `
        UPDATE tarefas
        SET ${updateFields.join(', ')}
        WHERE id = ?
    `;

    params.push(tarefaId);

    const updateQuery = db.prepare(sql);
    updateQuery.run(...params);
    res.status(200).json({ message: "Tarefa atualizada com sucesso!" });
}

export const deleteTarefa = (req, res) => {
    const tarefaId = req.params.id

    const ordemQuery = db.prepare(`
        SELECT ordem FROM tarefas WHERE id = ?
    `);
    const ordemTarefaDeletada = ordemQuery.get(tarefaId)
    console.log(ordemTarefaDeletada)

    if (!ordemTarefaDeletada) {
        return res.status(404).json({ message: "Tarefa não encontrada!" })
    }

    const delQuery = db.prepare(`
        DELETE FROM tarefas WHERE id = ?
    `);
    delQuery.run(tarefaId);

    reordenarTarefas()

    res.status(200).json({ message: "Tarefa deletada com sucesso!" })
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

export const reordenarTarefas = () => {
    const tarefasQuery = db.prepare(`
        SELECT * FROM tarefas ORDER BY ordem ASC
    `);

    const tarefas = tarefasQuery.all();

    tarefas.forEach((tarefa, index) => {
        const updateQuery = db.prepare(`
            UPDATE tarefas SET ordem = ? WHERE id = ?
        `);
        updateQuery.run(index + 1, tarefa.id);
    });
}
