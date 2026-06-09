from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
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
        password="Cbmcs745",
        database="porquinho"
    )

def criar_token(usuario):
    payload = {
        "sub": usuario,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

class UserSenha(BaseModel):
    usuario: str
    senha: str

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