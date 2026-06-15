from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
import mysql.connector

app = FastAPI()

SECRET_KEY = "controlefinanceiro123"
ALGORITHM = "HS256"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="senha",
        database="porquinho"
    )

def criar_token(usuario):
    payload = {
        "sub": usuario,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def verificar_token(token):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except ExpiredSignatureError:
        return None

    except JWTError:
        return None
    
def obter_usuario(token):
    payload = verificar_token(token)

    if not payload:
        return None

    return payload["sub"]
    
class UserSenha(BaseModel):
    usuario: str
    senha: str

class AlterarSenha(BaseModel):
    senha_atual: str
    senha_nova: str

class Movimentacao(BaseModel):
    descricao: str
    valor: float
    tipo: str

class AlterarUsuario(BaseModel):
    usuario_novo: str
    senha_atual: str

@app.post("/cadastro")
def cadastro(user: UserSenha):
    conexao = conectar()
    cursor = conexao.cursor()

    sql = """
    INSERT INTO usuarios(usuario, senha)
    VALUES(%s, %s)
    """

    try:
        cursor.execute(sql, (user.usuario, user.senha))
        conexao.commit()

        return {
            "sucesso": True
        }

    except:
        return {
            "sucesso": False,
            "mensagem": "Usuário já existe"
        }

    finally:
        cursor.close()
        conexao.close()

@app.post("/login")
def login(user: UserSenha):
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    sql = """
    SELECT *
    FROM usuarios
    WHERE usuario=%s AND senha=%s
    """

    cursor.execute(
        sql,
        (user.usuario, user.senha)
    )

    resultado = cursor.fetchone()

    cursor.close()
    conexao.close()

    if resultado:
        token = criar_token(user.usuario)

        return {
            "sucesso": True,
            "token": token
        }

    return {
        "sucesso": False,
        "mensagem": "Usuário ou senha inválidos"
    }

@app.get("/validar")
def validar(token: str):
    try:
        jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return {"valido": True}

    except ExpiredSignatureError:
        return {"valido": False}

    except JWTError:
        return {"valido": False}
    
@app.post("/alterar-usuario")
def alterar_usuario(token: str, dados: AlterarUsuario):

    usuario = obter_usuario(token)

    if not usuario:
        return {
            "sucesso": False,
            "mensagem": "Token inválido"
        }

    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM usuarios
        WHERE usuario=%s AND senha=%s
        """,
        (usuario, dados.senha_atual)
    )

    resultado = cursor.fetchone()

    if not resultado:
        cursor.close()
        conexao.close()

        return {
            "sucesso": False,
            "mensagem": "Senha atual incorreta"
        }

    cursor.execute(
        """
        UPDATE usuarios
        SET usuario=%s
        WHERE usuario=%s
        """,
        (dados.usuario_novo, usuario)
    )

    cursor.execute(
        """
        UPDATE movimentacoes
        SET usuario=%s
        WHERE usuario=%s
        """,
        (dados.usuario_novo, usuario)
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    return {
        "sucesso": True
    }
    
@app.post("/alterar-senha")
def alterar_senha(token: str, dados: AlterarSenha):

    usuario = obter_usuario(token)

    if not usuario:
        return {
            "sucesso": False,
            "mensagem": "Token inválido"
        }

    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM usuarios
        WHERE usuario=%s AND senha=%s
        """,
        (usuario, dados.senha_atual)
    )

    resultado = cursor.fetchone()

    if not resultado:

        cursor.close()
        conexao.close()

        return {
            "sucesso": False,
            "mensagem": "Senha atual incorreta"
        }

    cursor.execute(
        """
        UPDATE usuarios
        SET senha=%s
        WHERE usuario=%s
        """,
        (dados.senha_nova, usuario)
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    return {
        "sucesso": True
    }

@app.post("/movimentacao")
def salvar_movimentacao(token: str, dados: Movimentacao):

    usuario = obter_usuario(token)

    if not usuario:
        return {"sucesso": False, "mensagem": "Token inválido"}

    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        """
        INSERT INTO movimentacoes(usuario, descricao, valor, tipo)
        VALUES (%s, %s, %s, %s)
        """,
        (usuario, dados.descricao, dados.valor, dados.tipo)
    )

    conexao.commit()

    id_mov = cursor.lastrowid

    cursor.close()
    conexao.close()

    return {
        "sucesso": True,
        "id": id_mov
    }


@app.get("/movimentacoes")
def listar_movimentacoes(token: str):

    usuario = obter_usuario(token)

    if not usuario:
        return []

    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM movimentacoes
        WHERE usuario=%s
        """,
        (usuario,)
    )

    resultado = cursor.fetchall()

    cursor.close()
    conexao.close()

    return resultado


@app.put("/movimentacao/{id}")
def atualizar_movimentacao(id: int, token: str, dados: Movimentacao):

    usuario = obter_usuario(token)

    if not usuario:
        return {"sucesso": False, "mensagem": "Token inválido"}

    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        """
        UPDATE movimentacoes
        SET descricao=%s, valor=%s, tipo=%s
        WHERE id=%s AND usuario=%s
        """,
        (dados.descricao, dados.valor, dados.tipo, id, usuario)
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    return {"sucesso": True}


@app.delete("/movimentacao/{id}")
def deletar_movimentacao(id: int, token: str):

    usuario = obter_usuario(token)

    if not usuario:
        return {"sucesso": False, "mensagem": "Token inválido"}

    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        """
        DELETE FROM movimentacoes
        WHERE id=%s AND usuario=%s
        """,
        (id, usuario)
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    return {"sucesso": True}
