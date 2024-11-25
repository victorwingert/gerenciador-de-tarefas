import express from 'express'
import tarefaRoutes from './tarefaRoutes.js'

const app = express()
app.use(express.json())

app.use(tarefaRoutes)

app.listen(3000, () => {
    console.log("Server running on port 3000")
})
