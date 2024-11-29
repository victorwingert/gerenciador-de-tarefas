import express from 'express'
import cors from 'cors'
import tarefaRoutes from './tarefaRoutes.js'

const app = express()
app.use(express.json())
app.use(cors())

app.use(tarefaRoutes)

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
