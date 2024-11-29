import axios from "axios"

export const api = axios.create({
    baseURL: 'https://gerenciador-de-tarefas-ajp1.onrender.com'
})
