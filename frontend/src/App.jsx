import { Button } from "./components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { ArrowDown, ArrowUpIcon, DeleteIcon, Edit2Icon, Edit3Icon, PlusCircle, TrashIcon, XCircleIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "./services/api";
import { AddForm } from "./components/forms/registration-form.jsx"
import { EdtForm } from "./components/forms/edt-form";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from "@radix-ui/react-dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import React from "react";

export function App() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdt, setOpenEdt] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [tarefas, setTarefas] = useState([]);
  const [tarefaAtual, setTarefaAtual] = useState(null);

  const handleCloseDialog = () => {
    setOpenAdd(false)
    setOpenEdt(false)
  }

  const handleEditClick = (tarefa) => {
    setTarefaAtual(tarefa)
    setOpenEdt(true)
  }

  const handleEditClickDelete = (tarefa) => {
    setTarefaAtual(tarefa)
    setOpenDelete(true)
  }

  const handleMoveUp = async (tarefa) => {
    const tarefaAnterior = tarefas.find((t) => t.ordem === tarefa.ordem - 1);

    await api.patch(`/tarefas/${tarefa.id}`, { ordem: -1 });
    await api.patch(`/tarefas/${tarefaAnterior.id}`, { ordem: -2 });

    const temp = tarefa.ordem;
    tarefa.ordem = tarefaAnterior.ordem;
    tarefaAnterior.ordem = temp;

    await api.patch(`/tarefas/${tarefa.id}`, { ordem: tarefa.ordem });
    await api.patch(`/tarefas/${tarefaAnterior.id}`, { ordem: tarefaAnterior.ordem });

    setTarefas([...tarefas]);
  };

  const handleMoveDown = async (tarefa) => {
    const tarefaSeguinte = tarefas.find((t) => t.ordem === tarefa.ordem + 1);

    await api.patch(`/tarefas/${tarefa.id}`, { ordem: -1 });
    await api.patch(`/tarefas/${tarefaSeguinte.id}`, { ordem: -2 });

    const temp = tarefa.ordem;
    tarefa.ordem = tarefaSeguinte.ordem;
    tarefaSeguinte.ordem = temp;

    await api.patch(`/tarefas/${tarefa.id}`, { ordem: tarefa.ordem });
    await api.patch(`/tarefas/${tarefaSeguinte.id}`, { ordem: tarefaSeguinte.ordem });

    setTarefas([...tarefas]);
  };

  async function getTarefas() {
    const tarefasFromApi = await api.get('/tarefas')

    setTarefas(tarefasFromApi.data)
  }

  async function deleteTarefas(id) {
    await api.delete(`/tarefas/${id}`)

    getTarefas()
  }

  useEffect(() => {
    getTarefas()
  }, [])

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    let sourceOrder = result.source.index;
    let destinationOrder = result.destination.index;

    const sourceTask = tarefas.find((tarefa) => tarefa.ordem === sourceOrder);
    const destinationTask = tarefas.find((tarefa) => tarefa.ordem === destinationOrder);

    if (sourceOrder === destinationOrder) {
      return;
    }

    await api.patch(`/tarefas/${sourceTask.id}`, { ordem: -1 });
    await api.patch(`/tarefas/${destinationTask.id}`, { ordem: -2 });

    let temp = sourceOrder;
    sourceOrder = destinationOrder;
    destinationOrder = temp;

    const updatedTarefas = tarefas.map((tarefa) =>
      tarefa.id === sourceTask.id ? { ...tarefa, ordem: sourceOrder } :
        tarefa.id === destinationTask.id ? { ...tarefa, ordem: destinationOrder } :
          tarefa
    );
    setTarefas(updatedTarefas);

    await api.patch(`/tarefas/${sourceTask.id}`, { ordem: sourceOrder });
    await api.patch(`/tarefas/${destinationTask.id}`, { ordem: destinationOrder });

    await getTarefas()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Tarefas</h1>

      <div className="border-2 border-viridian rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-white bg-viridian">ID</TableHead>
              <TableHead className="text-center font-bold text-white bg-viridian">Nome</TableHead>
              <TableHead className="text-center font-bold text-white bg-viridian">Custo</TableHead>
              <TableHead className="text-center font-bold text-white bg-viridian">Data Limite</TableHead>
              <TableHead className="text-center font-bold text-white bg-viridian">Ordem</TableHead>
              <TableHead className="text-center w-10 text-white bg-viridian"></TableHead>
            </TableRow>
          </TableHeader>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks" type="list" direction="vertical">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  <div className="p-2" />
                  {tarefas
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((tarefa, index) => (
                      <React.Fragment key={tarefa.id}>
                        <Draggable draggableId={tarefa.id.toString()} index={tarefa.ordem}>
                          {(provided) => (
                            <TableRow
                              className={`shadow border-viridian text-center ${tarefa.custo >= 1000 ? 'bg-cambridge-blue hover:bg-cambridge-blue/80' : 'bg-azure-web hover:bg-azure-web/80'}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TableCell className={`text-center font-bold`}>{tarefa.id}</TableCell>
                              <TableCell className="text-center">{tarefa.nome}</TableCell>
                              <TableCell className="text-center">{tarefa.custo}</TableCell>
                              <TableCell className="text-center">{tarefa.data}</TableCell>
                              <TableCell className="text-center">{tarefa.ordem}</TableCell>
                              <TableCell className={``}>
                                <div className="flex justify-center items-center gap-3">
                                  <div className="flex justify-center items-center gap-1">
                                    <Button className="h-8 w-8 rounded-full bg-redwood hover:bg-redwood hover:bg-opacity-80" onClick={() => { handleMoveUp(tarefa) }} disabled={tarefa.ordem === 1}>
                                      <ArrowUpIcon />
                                    </Button>
                                    <Button className="h-8 w-8 rounded-full bg-redwood hover:bg-redwood hover:bg-opacity-80" onClick={() => { handleMoveDown(tarefa) }} disabled={tarefa.ordem === tarefas.length}>
                                      <ArrowDown />
                                    </Button>
                                  </div>
                                  <div className="flex justify-center items-center gap-1">
                                    <Button className="h-8 w-8 rounded-full bg-blue-gray hover:bg-blue-gray hover:bg-opacity-80" onClick={() => { setOpenEdt(true), handleEditClick(tarefa) }}>
                                      <Edit2Icon />
                                    </Button>
                                    <Button className="h-8 w-8 rounded-full bg-vermilion hover:bg-vermilion hover:bg-opacity-80" onClick={() => { setOpenDelete(true), handleEditClickDelete(tarefa) }}>
                                      <TrashIcon />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                        <div className={`${tarefa.ordem === tarefas.length ? '' : 'p-2'}`} />

                      </React.Fragment>
                    ))}

                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </div>

      <Dialog open={openEdt} onOpenChange={setOpenEdt}>
        <DialogContent>
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
          <EdtForm tarefa={tarefaAtual} onEdit={handleCloseDialog} onEditTarefa={async (name, price, date) => {
            await api.put(`/tarefas/${tarefaAtual.id}`, {
              nome: name,
              custo: price,
              data: date.includes('T') ? format(new Date(date), "dd/MM/yyyy") : date,
            });
            await getTarefas();
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-sm p-4">
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
          <div className="flex flex-col gap-3 ">
            <h1 className="text-center text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tem certeza que deseja excluir a tarefa?</h1>
            <div className="flex justify-center items-center gap-1">
              <Button onClick={() => { deleteTarefas(tarefaAtual.id), setOpenDelete(false) }} className="w-[65px] box-border px-4 py-2">Sim</Button>
              <Button onClick={() => { setOpenDelete(false) }} variant="outline" className="w-[65px] box-border px-4 py-2">Não</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <div className="flex items-center justify-between">
        <Button onClick={() => setOpenAdd(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />Incluir Registro
        </Button>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent>
            <VisuallyHidden>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </VisuallyHidden>
            <AddForm onSave={handleCloseDialog} onAddTarefa={async (name, price, date) => {
              await api.post('/tarefas', {
                nome: name,
                custo: price,
                data: date ? format(new Date(date), "dd/MM/yyyy") : null,
              });
              await getTarefas();
            }} />
          </DialogContent>
        </Dialog>
      </div>
    </div >
  );
}
