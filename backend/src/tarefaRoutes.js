import express from 'express'
import { createTarefa, getTarefas, updateTarefa, deleteTarefa, updateOrdemTarefa } from './tarefaController.js'

const router = express.Router()

router.post('/tarefas', createTarefa)
router.get('/tarefas', getTarefas)
router.put('/tarefas/:id', updateTarefa)
router.delete('/tarefas/:id', deleteTarefa)
router.patch('/tarefas/:id', updateOrdemTarefa)

export default router
