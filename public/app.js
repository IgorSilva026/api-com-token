const URL_TECNOLOGIAS = '/tecnologias';
let token = localStorage.getItem('token');

const el = (id) => document.getElementById(id);


function mostrarMensagem(texto, ehErro = false) {
    const mensagem = el('mensagem');
    mensagem.textContent = texto;
    mensagem.className = ehErro ? 'erro' : 'sucesso';
}

function atualizarTela() {
    const logado = Boolean(token);
    el('tela-login').hidden = logado;
    el('tela-app').hidden = !logado;

    if (logado) carregarTecnologias();
}

function sair() {
    token = null;
    localStorage.removeItem('token');
    atualizarTela();
}

async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, {
        ...opcoes,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });


    if (resposta.status === 401) {
        sair();
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(dados?.mensagem || 'Erro na requisição.');
    }

    return dados;
}


let modoCadastro = false;

function alternarModo() {
    modoCadastro = !modoCadastro;
    el('titulo-acesso').textContent = modoCadastro ? 'Criar usuário' : 'Entrar';
    el('btn-acesso').textContent = modoCadastro ? 'Criar usuário' : 'Entrar';
    el('texto-alternar').textContent = modoCadastro ? 'Já tem conta?' : 'Não tem conta?';
    el('btn-alternar').textContent = modoCadastro ? 'Entrar' : 'Criar usuário';
    el('senha').autocomplete = modoCadastro ? 'new-password' : 'current-password';
    mostrarMensagem('');
}

async function chamarAuth(rota, usuario, senha) {
    const resposta = await fetch(`/auth/${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
    });

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        throw new Error(dados?.mensagem || 'Erro na requisição.');
    }

    return dados;
}

el('btn-alternar').addEventListener('click', alternarModo);

el('form-login').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const usuario = el('usuario').value;
    const senha = el('senha').value;

    try {
        if (modoCadastro) await chamarAuth('registrar', usuario, senha);
        const dados = await chamarAuth('login', usuario, senha);

        token = dados.token;
        localStorage.setItem('token', token);
        el('form-login').reset();
        if (modoCadastro) alternarModo();
        mostrarMensagem('');
        atualizarTela();
    } catch (error) {
        mostrarMensagem(error.message, true);
    }
});

el('btn-sair').addEventListener('click', sair);


function criarBotao(texto, aoClicar, classe = '') {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = texto;
    botao.className = classe;
    botao.addEventListener('click', aoClicar);
    return botao;
}

function renderizarTabela(tecnologias) {
    const corpo = el('tabela-corpo');
    corpo.innerHTML = '';

    if (tecnologias.length === 0) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');
        celula.colSpan = 4;
        celula.textContent = 'Nenhuma tecnologia cadastrada.';
        linha.appendChild(celula);
        corpo.appendChild(linha);
        return;
    }

    tecnologias.forEach((tecnologia) => {
        const linha = document.createElement('tr');
        const meses = tecnologia.curvaAprendizado;
        const textos = [tecnologia.nome, tecnologia.base, `${meses} ${meses === 1 ? 'mês' : 'meses'}`];

        // textContent evita injeção de HTML vindo do banco
        textos.forEach((texto) => {
            const celula = document.createElement('td');
            celula.textContent = texto;
            linha.appendChild(celula);
        });

        const acoes = document.createElement('td');
        acoes.appendChild(criarBotao('Editar', () => iniciarEdicao(tecnologia)));
        acoes.appendChild(criarBotao('Excluir', () => excluir(tecnologia), 'perigo'));
        linha.appendChild(acoes);

        corpo.appendChild(linha);
    });
}


async function carregarTecnologias() {
    try {
        const tecnologias = await requisicao(URL_TECNOLOGIAS);
        renderizarTabela(tecnologias);
    } catch (error) {
        mostrarMensagem(error.message, true);
    }
}

function limparFormulario() {
    el('form-tecnologia').reset();
    el('id').value = '';
    el('btn-salvar').textContent = 'Cadastrar';
    el('btn-cancelar').hidden = true;
}

function iniciarEdicao(tecnologia) {
    el('id').value = tecnologia._id;
    el('nome').value = tecnologia.nome;
    el('base').value = tecnologia.base;
    el('curva').value = tecnologia.curvaAprendizado;
    el('btn-salvar').textContent = 'Salvar alterações';
    el('btn-cancelar').hidden = false;
    el('nome').focus();
}

el('btn-cancelar').addEventListener('click', limparFormulario);


el('form-tecnologia').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = el('id').value;
    const dados = {
        nome: el('nome').value,
        base: el('base').value,
        curvaAprendizado: Number(el('curva').value),
    };

    try {
        await requisicao(id ? `${URL_TECNOLOGIAS}/${id}` : URL_TECNOLOGIAS, {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(dados),
        });

        mostrarMensagem(id ? 'Tecnologia atualizada.' : 'Tecnologia cadastrada.');
        limparFormulario();
        carregarTecnologias();
    } catch (error) {
        mostrarMensagem(error.message, true);
    }
});

async function excluir(tecnologia) {
    if (!confirm(`Excluir "${tecnologia.nome}"?`)) return;

    try {
        await requisicao(`${URL_TECNOLOGIAS}/${tecnologia._id}`, { method: 'DELETE' });
        mostrarMensagem('Tecnologia removida.');
        carregarTecnologias();
    } catch (error) {
        mostrarMensagem(error.message, true);
    }
}



atualizarTela();
