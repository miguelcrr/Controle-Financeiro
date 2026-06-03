const API_URL = "http://127.0.0.1:8000";

async function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
};




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
formCadastro.addEventListener("submit", function(event) {
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
    }
});
