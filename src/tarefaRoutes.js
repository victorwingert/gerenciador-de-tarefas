import express from 'express'
import { createTarefa, getTarefas, updateTarefa, deleteTarefa } from './tarefaController.js'

const router = express.Router()

router.post('/tarefas', createTarefa)
router.get('/tarefas', getTarefas)
router.put('/tarefas/:id', updateTarefa)
router.delete('/tarefas/:id', deleteTarefa)

export default router
