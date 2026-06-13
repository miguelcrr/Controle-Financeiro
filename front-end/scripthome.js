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
    document.getElementById('janelaGanhos').showModal();
}
function xganhos(){
    document.getElementById('janelaGanhos').close();
}
function gastos() {
    document.getElementById('janelaGastos').showModal();
}
function xgastos(){
    document.getElementById('janelaGastos').close();
}
function xedicaoganho(){
    const erro= document.getElementById("erro3");
    erro.textContent=""
    document.getElementById("janelaedicaoganho").close();
}
function xedicaogasto(){
    const erro= document.getElementById("erro4");
    erro.textContent=""
    document.getElementById("janelaedicaogastos").close();
}

function ganhosADC() {
    const valor = document.getElementById("ganho").value;
    const descricao = document.getElementById("descricaoG").value;
    const erro = document.getElementById("erro");
        if(valor === "" ||descricao === "" ||isNaN(valor)){
            erro.textContent="Preencha todos os campos";
            return;
        }
        else{
            erro.textContent="";
        }
        saldo += parseFloat(valor);
        attsaldo();

    const lista = document.getElementById("listaganhogasto");
    const item = document.createElement("div");
    item.classList.add("movimentacao", "ganho");

    item.innerHTML = `
        <div class="conteudo">
            ${descricao}
            +R$ ${valor}   
        </div>
        <div class="acoes">
            <button id="editar" onclick= "edicaoG(this)">✏️</button>
            <button id="deletar" onclick="deletarMovimentacao(this)">🗑️</button>
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
    const erro2 = document.getElementById("erro2");
    if(valor === "" ||descricao === "" ||isNaN(valor)){
            erro2.textContent="Preencha todos os campos";
            return;
        }
        else{
            erro2.textContent="";
        }
    saldo-=parseFloat(valor);
    attsaldo();

    const lista = document.getElementById("listaganhogasto");
    const item = document.createElement("div");
    item.classList.add("movimentacao", "gasto");

    item.innerHTML = `
        <div class="conteudo">
            ${descricao}
            -R$ ${valor}
        </div>
        <div class="acoes">
            <button id="editar" onclick="edicaoP(this)">✏️</button>
            <button id="deletar" onclick="deletarMovimentacao(this)">🗑️</button>
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

document
.getElementById("janelaGanhos")
.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        ganhosADC();
    }

});

document
.getElementById("janelaGastos")
.addEventListener("keydown", function(event){

    if(event.key === "Enter"){
        event.preventDefault();
        gastosADC();
    }

});

document
.getElementById("janelaedicaoganho")
.addEventListener("keydown", function(event){

    if(event.key === "Enter"){

        event.preventDefault();
        salvaredicaoG();
    }

});

document
.getElementById("janelaedicaogastos")
.addEventListener("keydown", function(event){

    if(event.key === "Enter"){
        event.preventDefault();
        salvaredicaoP();
    }

});

let itemEditando = null;

function edicaoG(botao){

    itemEditando = botao.closest(".movimentacao");

    const conteudo = itemEditando.querySelector(".conteudo").innerText;

    const partes = conteudo.split("+R$");

    document.getElementById("descricaoeditarG").value =partes[0].trim();
    document.getElementById("ganhoeditar").value =partes[1].trim();
    document.getElementById("janelaedicaoganho").showModal();
}

function salvaredicaoG(){
    const novoValor = document.getElementById("ganhoeditar").value;
    const novaDescricao = document.getElementById("descricaoeditarG").value;
    const erro = document.getElementById("erro3");
        if(novoValor === "" ||novaDescricao === "" ||isNaN(novoValor)){
            erro.textContent="Preencha todos os campos";
            return;
        }
        else{
            erro.textContent="";
            const valorAntigo = pegarValor(itemEditando);
            saldo-=parseFloat(valorAntigo)
            saldo+= parseFloat(novoValor)
            attsaldo()
            itemEditando.querySelector(".conteudo").innerHTML =
        `${novaDescricao} +R$ ${novoValor}`;

        document.getElementById("janelaedicaoganho").close();
        }

}
    
function edicaoP(botao){

    itemEditando =botao.closest(".movimentacao");

    const conteudo =itemEditando.querySelector(".conteudo").innerText;
    const partes = conteudo.split("-R$");
    document.getElementById("descricaoeditarP").value =partes[0].trim();
    document.getElementById("gastoeditar").value =partes[1].trim();
    document.getElementById("janelaedicaogastos").showModal();
}

function salvaredicaoP(){
    const novoValor =document.getElementById("gastoeditar").value;
    const novaDescricao =document.getElementById("descricaoeditarP").value;
    const erro = document.getElementById("erro4");
    if(novoValor === "" ||novaDescricao === "" ||isNaN(novoValor)){
            erro.textContent="Preencha todos os campos";
            return;
        }
        else{
            erro.textContent=""
            const valorAntigo = pegarValor(itemEditando);
            saldo+=parseFloat(valorAntigo);
            saldo-=parseFloat(novoValor);
            attsaldo();
        itemEditando.querySelector(".conteudo").innerHTML =
            `${novaDescricao} -R$ ${novoValor}`;

        document.getElementById("janelaedicaogastos").close();
            }
}

function pegarValor(item){
    const texto = item.querySelector(".conteudo").innerText;

    const numero =texto.match(/[+-]?R\$\s*(\d+(\.\d+)?)/);

    return numero
    ? parseFloat(numero[1]): 0;

}

function deletarMovimentacao(botao){

    const item =botao.closest(".movimentacao");

    const valor =pegarValor(item);

    if(item.classList.contains("ganho")){
        saldo -= valor;
    }
    else{
        saldo += valor;
    }
    attsaldo();
    item.remove();
}