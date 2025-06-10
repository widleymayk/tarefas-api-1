document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tarefaForm');
    const tarefasList = document.getElementById('tarefasList');
    const API_URL = 'http://localhost:3000/tarefas';

    carregarTarefas();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tarefa = document.getElementById('tarefa').value.trim();
        const descricao = document.getElementById('descricao').value.trim();

        if (!tarefa || !descricao) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        try {
            await adicionarTarefa({ tarefa, descricao });
            form.reset();
        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao adicionar a tarefa');
        }
    });

    async function adicionarTarefa(tarefa) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tarefa)
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar tarefa');
        }

        carregarTarefas();
    }

    async function carregarTarefas() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Erro ao carregar tarefas');
            }
            const tarefas = await response.json();
            exibirTarefas(tarefas);
        } catch (error) {
            console.error('Erro:', error);
            tarefasList.innerHTML = '<p>Erro ao carregar tarefas</p>';
        }
    }

    function exibirTarefas(tarefas) {
        tarefasList.innerHTML = '';

        if (tarefas.length === 0) {
            tarefasList.innerHTML = '<p>Nenhuma tarefa encontrada</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        tarefas.forEach(tarefa => {
            const div = document.createElement('div');
            div.className = 'tarefa-item';
            div.innerHTML = `
                <h3>${tarefa.tarefa}</h3>
                <p>${tarefa.descricao}</p>
                <small>Data de criação: ${formatarData(tarefa.dataCriacao)}</small>
                <hr>
            `;
            fragment.appendChild(div);
        });

        tarefasList.appendChild(fragment);
    }

    function formatarData(dataString) {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    }
});