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

}