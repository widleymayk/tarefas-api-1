document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tarefaForm');
    const tarefasList = document.getElementById('tarefasList');
    const salvarBtn = document.getElementById('salvarBtn');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const tarefaIdInput = document.getElementById('tarefaId');
    const tarefaInput = document.getElementById('tarefa');
    const descricaoInput = document.getElementById('descricao');
    
    const API_URL = 'http://localhost:3000/tarefas';

    let editando = false;
    let tarefaAtualId = null;

    carregarTarefas();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tarefa = tarefaInput.value.trim();
        const descricao = descricaoInput.value.trim();

        if (!tarefa || !descricao) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        try {
            if (editando) {
                await atualizarTarefa(tarefaAtualId, { tarefa, descricao });
            } else {
                await adicionarTarefa({ tarefa, descricao });
            }
            limparFormulario();
        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao salvar a tarefa');
        }
    });

    cancelarBtn.addEventListener('click', limparFormulario);

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

    async function atualizarTarefa(id, tarefa) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tarefa)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar tarefa');
        }

        carregarTarefas();
    }

    async function deletarTarefa(id) {
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Erro ao deletar tarefa');
                }

                carregarTarefas();
            } catch (error) {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao deletar a tarefa');
            }
        }
    }

    function prepararEdicao(tarefa) {
        editando = true;
        tarefaAtualId = tarefa.id;
        tarefaIdInput.value = tarefa.id;
        tarefaInput.value = tarefa.tarefa;
        descricaoInput.value = tarefa.descricao;
        salvarBtn.textContent = 'Atualizar';
        cancelarBtn.style.display = 'inline-block';
        tarefaInput.focus();
    }

    function limparFormulario() {
        editando = false;
        tarefaAtualId = null;
        form.reset();
        tarefaIdInput.value = '';
        salvarBtn.textContent = 'Salvar';
        cancelarBtn.style.display = 'none';
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

        tarefas.forEach(tarefa => {
            const div = document.createElement('div');
            div.className = 'tarefa-item';
            div.innerHTML = `
                <h3>${tarefa.tarefa}</h3>
                <p>${tarefa.descricao}</p>
                <div class="tarefa-footer">
                    <small class="tarefa-data">Data de criação: ${formatarData(tarefa.dataCriacao)}</small>
                    <div class="tarefa-acoes">
                        <button class="btn-editar" data-id="${tarefa.id}">Editar</button>
                        <button class="btn-deletar" data-id="${tarefa.id}">Deletar</button>
                    </div>
                </div>
                <hr>
            `;
            tarefasList.appendChild(div);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const tarefa = tarefas.find(t => t.id === id);
                if (tarefa) prepararEdicao(tarefa);
            });
        });

        document.querySelectorAll('.btn-deletar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                deletarTarefa(id);
            });
        });
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