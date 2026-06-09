const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "Login.html";
}

const API_URL = "http://127.0.0.1:8000";

function mostrarsenha(){
    const senha = document.getElementById("senha");
    if(senha.type === "password"){
        senha.type = "text";
    }
    else{
        senha.type = "password";
    }
}

function mostrarconfsenha(){
    const confsenha = document.getElementById("confsenha");
    if(confsenha.type === "password"){
        confsenha.type = "text";
    }
    else{
        confsenha.type = "password";
    }
};

const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
    formCadastro.addEventListener("submit", async function(event) {
        event.preventDefault();
        const usuario = document.getElementById("usuario").value;
        const senha = document.getElementById("senha").value;
        const confsenha = document.getElementById("confsenha");
        const errosenha = document.getElementById("errosenha");
        if (senha !== confsenha.value) {
            event.preventDefault();
            errosenha.textContent = "Senhas não coincidem";
            confsenha.value = "";
            confsenha.focus();
        } else {
            errosenha.textContent = "";
            const resposta = await fetch("http://127.0.0.1:8000/cadastro",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario,
                    senha
                })
            }
        );
        const dados = await resposta.json();
        if(dados.sucesso){
            alert("Cadastro realizado!");
            window.location.href = "Login.html";
        }
        else {
            errosenha.textContent= dados.mensagem;
        }

        }
    })
};

const formLogin = document.getElementById("formLogin");
if (formLogin) {
    formLogin.addEventListener("submit", async function(event) {
        event.preventDefault();
        const usuario = document.getElementById("usuario").value;
        const senha = document.getElementById("senha");
        const erro = document.getElementById("errologin");
        const resposta = await fetch("http://127.0.0.1:8000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: usuario,
                    senha: senha.value
                })
            }
        );
        const dados = await resposta.json();
        console.log(dados);
        if (dados.sucesso) {
            localStorage.setItem("token", dados.token);
            window.location.href = "index.html";
}
        else {
            erro.textContent = "Usuário ou senha incorretos";
            senha.value = "";
            senha.focus();
        }
    })
};  
console.log(token)