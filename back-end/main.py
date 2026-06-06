from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI()

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
        password="joao0708",
        database="porquinho"
    )
class UserSenha(BaseModel):
    usuario: str
    senha: str

@app.post("/cadastro")
def cadastro(user: UserSenha):
    conexao = conectar()
    cursor = conexao.cursor()
    sql = """INSERT INTO usuarios(usuario, senha) VALUES(%s,%s)"""
    try:
        cursor.execute(sql,(user.usuario, user.senha))
        conexao.commit()
        return {"sucesso": True}
    except:
        return {"sucesso": False,"mensagem": "Usuário já existe"}
    finally:
            cursor.close()
            conexao.close()

@app.post("/login")
def login(user: UserSenha):
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)
    sql = """SELECT *FROM usuarios WHERE usuario=%s AND senha=%s"""
    cursor.execute(
        sql,
        (user.usuario, user.senha)
    )
    resultado = cursor.fetchone()
    cursor.close()
    conexao.close()
    if resultado:
        return {"sucesso": True}
    return {"sucesso": False}