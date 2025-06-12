const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Configurações
app.use(bodyParser.json());
app.use(cors()); // Corrigido: agora está invocando a função
app.use(express.static(path.join(__dirname, '../frontend')));

// Verificar se o arquivo de tarefas existe
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ tarefas: [] }));
}

// Rotas
app.get('/tarefas', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data.tarefas);
});

app.post('/tarefas', (req, res) => {
    const { tarefa, descricao } = req.body;

    if (!tarefa || !descricao) {
        return res.status(400).json({ message: 'Tarefa e descrição são obrigatórios' });
    }

    const data = JSON.parse(fs.readFileSync(DB_FILE));

    const novaTarefa = {
        id: Date.now(),
        tarefa,
        descricao,
        dataCriacao: new Date().toISOString()
    };

    data.tarefas.push(novaTarefa);
    
    
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    
    res.status(201).json(novaTarefa);
});

app.listen(PORT, () => {
    console.log('Servidor rodando na porta 3000');
});

// Adicionar estas rotas após as rotas existentes

// Rota para deletar uma tarefa
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    
    const index = data.tarefas.findIndex(t => t.id == id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    data.tarefas.splice(index, 1);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    
    res.json({ message: 'Tarefa removida com sucesso' });
});

// Rota para atualizar uma tarefa
app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { tarefa, descricao } = req.body;
    
    if (!tarefa || !descricao) {
        return res.status(400).json({ message: 'Tarefa e descrição são obrigatórios' });
    }
    
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const index = data.tarefas.findIndex(t => t.id == id);
    
    if (index === -1) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    data.tarefas[index] = {
        ...data.tarefas[index],
        tarefa,
        descricao
    };
    
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    
    res.json(data.tarefas[index]);
});