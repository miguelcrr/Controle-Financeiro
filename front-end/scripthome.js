const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "Login.html";
}

fetch(`http://127.0.0.1:8000/validar?token=${token}`)
    .then(res => res.json())
    .then(dados => {
        if (!dados.valido) {
            localStorage.removeItem("token");
            window.location.href = "Login.html";
        } else {
            carregarMovimentacoes();
        }
    });

let saldo = 0;
let itemEditando = null;

function attsaldo() {

    const saldoElemento =
        document.getElementById("saldo");

    saldoElemento.textContent =
        `R$ ${saldo.toFixed(2)}`;

    if (saldo < 0) {
    saldoElemento.style.color = "#ff4d4d"; // vermelho
    }
    else if (saldo > 0) {
        saldoElemento.style.color = "#66ff99"; // verde
    }
    else {
        saldoElemento.style.color = "#ffffff"; // branco
    }
}

async function salvarMovimentacao(descricao, valor, tipo) {
    const token = localStorage.getItem("token");

    const resposta = await fetch(
        `http://127.0.0.1:8000/movimentacao?token=${token}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                descricao: descricao,
                valor: valor,
                tipo: tipo
            })
        }
    );

    const dados = await resposta.json();

    return dados.id;
}

function ganhos() {
    document.getElementById("janelaGanhos").showModal();
}

function xganhos() {
    document.getElementById("janelaGanhos").close();
}

function gastos() {
    document.getElementById("janelaGastos").showModal();
}

function xgastos() {
    document.getElementById("janelaGastos").close();
}

function xedicaoganho() {
    document.getElementById("erro3").textContent = "";
    document.getElementById("janelaedicaoganho").close();
}

function xedicaogasto() {
    document.getElementById("erro4").textContent = "";
    document.getElementById("janelaedicaogastos").close();
}

async function ganhosADC() {
    const valor = document.getElementById("ganho").value;
    const descricao = document.getElementById("descricaoG").value;
    const erro = document.getElementById("erro");

    if (valor === "" || descricao === "" || isNaN(valor)) {
        erro.textContent = "Preencha todos os campos";
        return;
    }

    erro.textContent = "";

    await salvarMovimentacao(descricao, parseFloat(valor), "ganho");

    document.getElementById("ganho").value = "";
    document.getElementById("descricaoG").value = "";

    xganhos();
    carregarMovimentacoes();
}

async function gastosADC() {
    const valor = document.getElementById("gasto").value;
    const descricao = document.getElementById("descricaoP").value;
    const erro2 = document.getElementById("erro2");

    if (valor === "" || descricao === "" || isNaN(valor)) {
        erro2.textContent = "Preencha todos os campos";
        return;
    }

    erro2.textContent = "";

    await salvarMovimentacao(descricao, parseFloat(valor), "gasto");

    document.getElementById("gasto").value = "";
    document.getElementById("descricaoP").value = "";

    xgastos();
    carregarMovimentacoes();
}

function edicaoG(botao) {
    itemEditando = botao.closest(".movimentacao");

    const conteudo = itemEditando.querySelector(".conteudo").innerText;
    const partes = conteudo.split("+R$");

    document.getElementById("descricaoeditarG").value = partes[0].trim();
    document.getElementById("ganhoeditar").value = partes[1].trim();

    document.getElementById("janelaedicaoganho").showModal();
}

async function salvaredicaoG() {
    const novoValor = document.getElementById("ganhoeditar").value;
    const novaDescricao = document.getElementById("descricaoeditarG").value;
    const erro = document.getElementById("erro3");

    if (novoValor === "" || novaDescricao === "" || isNaN(novoValor)) {
        erro.textContent = "Preencha todos os campos";
        return;
    }

    erro.textContent = "";

    const id = itemEditando.dataset.id;
    const token = localStorage.getItem("token");

    const resposta = await fetch(
        `http://127.0.0.1:8000/movimentacao/${id}?token=${token}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                descricao: novaDescricao,
                valor: parseFloat(novoValor),
                tipo: "ganho"
            })
        }
    );

    const dados = await resposta.json();

    if (!dados.sucesso) {
        alert(dados.mensagem);
        return;
    }

    document.getElementById("janelaedicaoganho").close();
    carregarMovimentacoes();
}

function edicaoP(botao) {
    itemEditando = botao.closest(".movimentacao");

    const conteudo = itemEditando.querySelector(".conteudo").innerText;
    const partes = conteudo.split("-R$");

    document.getElementById("descricaoeditarP").value = partes[0].trim();
    document.getElementById("gastoeditar").value = partes[1].trim();

    document.getElementById("janelaedicaogastos").showModal();
}

async function salvaredicaoP() {
    const novoValor = document.getElementById("gastoeditar").value;
    const novaDescricao = document.getElementById("descricaoeditarP").value;
    const erro = document.getElementById("erro4");

    if (novoValor === "" || novaDescricao === "" || isNaN(novoValor)) {
        erro.textContent = "Preencha todos os campos";
        return;
    }

    erro.textContent = "";

    const id = itemEditando.dataset.id;
    const token = localStorage.getItem("token");

    const resposta = await fetch(
        `http://127.0.0.1:8000/movimentacao/${id}?token=${token}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                descricao: novaDescricao,
                valor: parseFloat(novoValor),
                tipo: "gasto"
            })
        }
    );

    const dados = await resposta.json();

    if (!dados.sucesso) {
        alert(dados.mensagem);
        return;
    }

    document.getElementById("janelaedicaogastos").close();
    carregarMovimentacoes();
}

async function deletarMovimentacao(botao) {
    const item = botao.closest(".movimentacao");
    const id = item.dataset.id;
    const token = localStorage.getItem("token");

    const resposta = await fetch(
        `http://127.0.0.1:8000/movimentacao/${id}?token=${token}`,
        {
            method: "DELETE"
        }
    );

    const dados = await resposta.json();

    if (!dados.sucesso) {
        alert(dados.mensagem);
        return;
    }

    carregarMovimentacoes();
}

async function carregarMovimentacoes() {
    const token = localStorage.getItem("token");

    const resposta = await fetch(
        `http://127.0.0.1:8000/movimentacoes?token=${token}`
    );

    const movimentacoes = await resposta.json();

    const lista = document.getElementById("listaganhogasto");
    lista.innerHTML = "";

    saldo = 0;

    movimentacoes.forEach(mov => {
        const item = document.createElement("div");

        item.classList.add("movimentacao", mov.tipo);
        item.dataset.id = mov.id;

        if (mov.tipo === "ganho") {
            saldo += parseFloat(mov.valor);

            item.innerHTML = `
                <div class="conteudo">
                    ${mov.descricao}
                    +R$ ${mov.valor}
                </div>
                <div class="acoes">
                    <button onclick="edicaoG(this)">✏️</button>
                    <button onclick="deletarMovimentacao(this)">🗑️</button>
                </div>
            `;
        } else {
            saldo -= parseFloat(mov.valor);

            item.innerHTML = `
                <div class="conteudo">
                    ${mov.descricao}
                    -R$ ${mov.valor}
                </div>
                <div class="acoes">
                    <button onclick="edicaoP(this)">✏️</button>
                    <button onclick="deletarMovimentacao(this)">🗑️</button>
                </div>
            `;
        }

        lista.appendChild(item);
    });

    attsaldo();
}

function abrirPerfil() {
    document.getElementById("menuPerfil").classList.add("aberto");
}

function fecharPerfil() {
    document.getElementById("menuPerfil").classList.remove("aberto");
}

function sair() {
    localStorage.removeItem("token");
    window.location.href = "Login.html";
}

function abrirJanelaSenha() {
    document.getElementById("janelaSenha").showModal();
}

function fecharJanelaSenha() {
    document.getElementById("janelaSenha").close();
}

function alterarSenha() {
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem");
        return;
    }

    const token = localStorage.getItem("token");

    fetch(
        `http://127.0.0.1:8000/alterar-senha?token=${token}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senha_atual: senhaAtual,
                senha_nova: novaSenha
            })
        }
    )
    .then(res => res.json())
    .then(dados => {
        if (dados.sucesso) {
            alert("Senha alterada. Faça login novamente.");
            localStorage.removeItem("token");
            window.location.href = "Login.html";
        } else {
            alert(dados.mensagem);
        }
    });
}

document.getElementById("janelaGanhos").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        ganhosADC();
    }
});

document.getElementById("janelaGastos").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        gastosADC();
    }
});

document.getElementById("janelaedicaoganho").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        salvaredicaoG();
    }
});

document.getElementById("janelaedicaogastos").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        salvaredicaoP();
    }
});

function abrirJanelaUsuario() {
    document.getElementById("janelaUsuario").showModal();
}

function fecharJanelaUsuario() {
    document.getElementById("janelaUsuario").close();
}

function alterarUsuario() {
    const token = localStorage.getItem("token");

    fetch(
        `http://127.0.0.1:8000/alterar-usuario?token=${token}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario_novo: document.getElementById("novoUsuario").value,
                senha_atual: document.getElementById("senhaAtualUsuario").value
            })
        }
    )
    .then(res => res.json())
    .then(dados => {
        if (dados.sucesso) {
            alert("Usuário alterado. Faça login novamente.");
            localStorage.removeItem("token");
            window.location.href = "Login.html";
        } else {
            alert(dados.mensagem);
        }
    });
}
