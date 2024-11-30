
# Lista de Tarefas - Sistema Web  

## Descrição  
Este é um sistema web desenvolvido como parte de um processo seletivo da Fatto. Ele permite o gerenciamento de tarefas, incluindo as funcionalidades de cadastro, edição, exclusão e reordenação. O sistema utiliza um banco de dados para armazenar as informações das tarefas e foi projetado para oferecer uma interface intuitiva e funcional.  

## Funcionalidades  

### Página Principal - Lista de Tarefas  
- Lista todas as tarefas cadastradas, ordenadas pelo campo "Ordem de Apresentação".  
- Exibe todos os campos, exceto "Ordem de Apresentação".  
- Destaca tarefas com custo maior ou igual a R$1.000,00 (fundo amarelo).  
- Possui botões para **Editar** e **Excluir** ao lado de cada tarefa.  
- Botão "Incluir" para adicionar novas tarefas.  

### Incluir Tarefa  
- Permite cadastrar uma nova tarefa com os campos:  
  - Nome da tarefa (único).  
  - Custo.  
  - Data limite.  
- O sistema gera automaticamente o identificador e define a ordem de apresentação como última.  

### Editar Tarefa  
- Permite editar o nome, custo e data limite de uma tarefa.  
- Valida se o novo nome já existe no banco de dados (não permite duplicação).  
- Implementado via **popup modal** para edição.  

### Excluir Tarefa  
- Exclui uma tarefa após confirmação do usuário (Sim/Não).  

### Reordenar Tarefas  
- Implementado com botões para "subir" ou "descer" a posição de uma tarefa na ordem de apresentação.
- Também existe a opção de mover os itens no estilo "drag and drop".

## Tecnologias Utilizadas  
- **Frontend**: React, Shadcn/ui, Vite
- **Backend**: Node.js
- **Banco de Dados**: PostgreSQL
- **Hospedagem**: Render, Supabase 

## Demonstração  
- Acesse a aplicação publicada: https://victorwingert.github.io/lista-de-tarefas/ 
- Repositório no GitHub: https://github.com/victorwingert/gerenciador-de-tarefas 

## Contato  
- **Nome**: Victor Wingert de Almeida 
- **Email**: victor.wingert@gmail.com
