import fastify from "fastify";
import cors from '@fastify/cors';

import { supabase } from "./supabaseConnection";

const app = fastify();

const reordenarTarefas = async () => {
    try {
        const { data: tarefas, error: tarefasError } = await supabase
            .from('tarefas')
            .select('id, ordem')
            .order('ordem', { ascending: true });

        if (tarefasError) {
            console.error(tarefasError);
            throw new Error('Erro ao recuperar tarefas para reordenação');
        }

        for (let i = 0; i < tarefas.length; i++) {
            const { error } = await supabase
                .from('tarefas')
                .update({ ordem: i + 1 })
                .eq('id', tarefas[i].id);

            if (error) {
                console.error(error);
                throw new Error('Erro ao atualizar a ordem das tarefas');
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error('Erro na reordenação das tarefas');
    }
};

app.register(cors, {
    origin: true,
    methods: '*',
});

type Tarefas = {
    nome: string,
    custo: number,
    data: string,
    ordem: number
}

type id = {
    id: number
}

app.get("/tarefas", async () => {

    try {
        const { data: tarefas } = await supabase.from("tarefas").select("*");

        return { "value": tarefas };
    } catch (error) {
        console.log(error);
        throw error;
    }
});

app.post("/tarefas", async (req, res) => {

    try {
        const { nome, custo, data } = req.body as Tarefas

        const { data: existingTask, error: checkError } = await supabase
            .from("tarefas")
            .select("id")
            .eq("nome", nome)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            throw checkError;
        }

        if (existingTask) {
            return res.status(409).send({ message: "Já existe uma tarefa com esse nome." });
        }

        const { data: maxOrderData, error: maxOrderError } = await supabase
            .from("tarefas")
            .select("ordem")
            .order("ordem", { ascending: false })
            .limit(1)
            .single();

        if (maxOrderError) {
            throw maxOrderError;
        }

        const ordem = maxOrderData?.ordem ? maxOrderData.ordem + 1 : 1;

        const { data: newTarefa, error: insertError } = await supabase
            .from("tarefas")
            .insert([{ nome, custo, data, ordem }])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        return res.status(201).send(newTarefa);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Erro ao criar tarefa." });
    }
});

app.put('/tarefas/:id', async (req, res) => {
    const { nome, custo, data } = req.body as Tarefas;
    const { id } = req.params as id;

    try {
        const { data: tarefaAtualData, error: tarefaAtualError } = await supabase
            .from('tarefas')
            .select('nome, custo, data')
            .eq('id', id)
            .single();

        if (tarefaAtualError) {
            return res.status(404).send({ message: 'Tarefa não encontrada' });
        }

        let updateFields: string[] = [];
        let params: any[] = [];

        if (tarefaAtualData.nome !== nome) {
            const { data: checkData, error: checkError } = await supabase
                .from('tarefas')
                .select('id')
                .eq('nome', nome)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                return res.status(500).send({ message: 'Erro ao verificar tarefa existente', error: checkError });
            }

            if (checkData) {
                return res.status(409).send({ message: 'Já existe uma tarefa com esse nome.' });
            }

            updateFields.push('nome = ?');
            params.push(nome);
        }

        if (tarefaAtualData.custo !== custo) {
            updateFields.push('custo = ?');
            params.push(custo);
        }

        if (tarefaAtualData.data !== data) {
            updateFields.push('data = ?');
            params.push(data);
        }

        if (updateFields.length === 0) {
            return res.status(400).send({ message: 'Nenhuma alteração detectada.' });
        }

        const { data: updatedData, error: updateError } = await supabase
            .from('tarefas')
            .update({ nome, custo, data })
            .eq('id', id);

        if (updateError) {
            return res.status(500).send({ message: 'Erro ao atualizar tarefa', error: updateError });
        }

        return res.status(200).send({ message: 'Tarefa atualizada com sucesso!' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Erro interno do servidor' });
    }
});

app.delete('/tarefas/:id', async (req, res) => {
    const { id } = req.params as id;

    try {
        const { data: tarefa, error: tarefaError } = await supabase
            .from('tarefas')
            .select('id, ordem')
            .eq('id', id)
            .single();

        if (tarefaError || !tarefa) {
            return res.status(404).send({ message: 'Tarefa não encontrada!' });
        }

        const { error: deleteError } = await supabase
            .from('tarefas')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error(deleteError);
            return res.status(500).send({ message: 'Erro ao deletar a tarefa' });
        }

        await reordenarTarefas();

        return res.status(200).send({ message: 'Tarefa deletada com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Erro interno ao processar a deleção' });
    }
});

app.patch('/tarefas/:id', async (req, res) => {
    const { ordem } = req.body as Tarefas;
    const { id } = req.params as id;

    try {
        const { data, error } = await supabase
            .from('tarefas')
            .update({ ordem })
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            return res.status(500).send({ message: 'Erro ao atualizar ordem da tarefa', error });
        }

        return res.status(200).send({ message: 'Ordem da tarefa atualizada com sucesso!', data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Erro ao processar a solicitação', error });
    }
});

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
    console.log('Servidor funcionando!')
})
