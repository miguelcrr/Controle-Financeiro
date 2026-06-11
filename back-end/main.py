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