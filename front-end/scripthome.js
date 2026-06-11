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
        }
    });

let saldo = 0;
function ganhos() {
    const janelaGanhos = document.getElementById('janelaGanhos').showModal()
}
function xganhos(){
    const xganhos = document.getElementById('janelaGanhos').close()
}

function gastos() {
    const janelaGanhos = document.getElementById('janelaGastos').showModal()
}
function xgastos(){
    const xganhos = document.getElementById('janelaGastos').close()
}

function ganhosADC() {
    const valor = document.getElementById("ganho").value;
    const descricao = document.getElementById("descricaoG").value;
    if (isNaN(valor)) {
        return;
    }
    saldo += parseFloat(valor);
    attsaldo();

    const lista = document.getElementById("listaganhogasto");

    const item = document.createElement("div");

    item.classList.add("movimentacao", "ganho");

    item.innerHTML = `
        <div>
            ${descricao}
            +R$ ${valor}   
        </div>
        <div class="acoes">
            <button id="editar">✏️</button>
            <button id="deletar">🗑️</button>
        </div>
    `;

    lista.appendChild(item);

    document.getElementById("ganho").value = "";
    document.getElementById("descricaoG").value = "";

    xganhos();
}

function gastosADC() {
    const valor = document.getElementById("gasto").value;
    const descricao = document.getElementById("descricaoP").value;
    if (isNaN(valor)){
        return;
    }
    saldo-=parseFloat(valor);
    attsaldo();

    const lista = document.getElementById("listaganhogasto");

    const item = document.createElement("div");

    item.classList.add("movimentacao", "gasto");

    item.innerHTML = `
        <div>
            ${descricao}
            -R$ ${valor}
        </div>
        <div class="acoes">
            <button id="editar">✏️</button>
            <button id="deletar">🗑️</button>
        </div>
    `;

    lista.appendChild(item);

    document.getElementById("gasto").value = "";
    document.getElementById("descricaoP").value = "";

    xgastos();
}

function attsaldo() {
    document.getElementById("saldo").textContent =
        `R$ ${saldo.toFixed(2)}`;
}