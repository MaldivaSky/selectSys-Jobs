"""
Exportador da Ficha Cadastral FUJIARTE — Épico D1 do escopo.

    "Bloqueador de adoção — sem isso não há venda."
    "Maior risco técnico do projeto."

Estratégia obrigatória (docs/02 §Excel): preencher o `.xls` ORIGINAL como
template, célula a célula. Gerar a planilha do zero jamais reproduz mesclagens,
bordas, larguras e fontes — e o analista no Japão recebe a folha exatamente
como sempre recebeu.

O mapa campo → célula NÃO vive aqui. Ele vive no schema versionado
(packages/core/src/form/ficha-fujiarte-2024-06.ts), porque mudar uma célula é
configuração, não deploy. Este módulo só lê o mapa e escreve.

Uso:
    python packages/exportador/exportar_ficha.py \
        --dados exemplo-candidato.json \
        --saida saida/marina-tanaka.xls

Sem --dados, usa o candidato de demonstração embutido.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime

import xlrd
from xlutils.copy import copy as copiar_workbook

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATE = os.path.join(RAIZ, "白紙 FUJIARTE Ficha Cadastral Jun2024 (1).xls")
SCHEMA_TS = os.path.join(RAIZ, "packages", "core", "src", "form", "ficha-fujiarte-2024-06.ts")


# ─────────────────────────────────────────────────────────────────────────────
# Mapa de células, lido do schema TypeScript
# ─────────────────────────────────────────────────────────────────────────────

def carregar_mapa(caminho: str = SCHEMA_TS) -> dict:
    """
    Extrai `key` → `cell` (e cellSim/cellNao) do schema versionado.

    Ler o TS direto evita duplicar o mapa em dois lugares — duplicar seria
    garantir que um dia eles divergem e a planilha sai errada sem ninguém ver.
    """
    fonte = open(caminho, encoding="utf-8").read()

    mapa: dict[str, dict] = {}

    # 1. Objetos literais. Contagem de chaves em vez de regex: os campos têm
    #    objetos aninhados (visibleWhen, derivaDe, options) que quebram
    #    qualquer [^{}] — e um campo perdido é uma célula vazia na planilha
    #    que ninguém percebe até o Japão reclamar.
    for m in re.finditer(r"key:\s*'([^']+)'", fonte):
        chave = m.group(1)
        # Recua até a abertura do objeto que contém esta key
        i = fonte.rfind("{", 0, m.start())
        if i == -1:
            continue
        nivel, j = 0, i
        while j < len(fonte):
            if fonte[j] == "{":
                nivel += 1
            elif fonte[j] == "}":
                nivel -= 1
                if nivel == 0:
                    break
            j += 1
        corpo = fonte[i:j + 1]
        entrada = {}
        for attr in ("cell", "cellSim", "cellNao"):
            a = re.search(rf"\b{attr}:\s*'([A-Z]+\d+)'", corpo)
            if a:
                entrada[attr] = a.group(1)
        if entrada:
            mapa.setdefault(chave, entrada)

    # 2. Campos criados por helper — as perguntas sim/não da enquete e os
    #    detalhes condicionais. São ~40 campos que não existem como objeto.
    #    simNao(key, label, cellSim, cellNao[, ja])
    for m in re.finditer(r"simNao\(\s*'([^']+)'\s*,\s*'(?:[^']|\\')*'\s*,\s*'([A-Z]+\d+)'\s*,\s*'([A-Z]+\d+)'", fonte):
        mapa[m.group(1)] = {"cellSim": m.group(2), "cellNao": m.group(3)}

    #    detalheSe(key, campoPai, label, cell[, sensivel])
    for m in re.finditer(r"detalheSe\(\s*'([^']+)'\s*,\s*'[^']+'\s*,\s*'(?:[^']|\\')*'\s*,\s*'([A-Z]+\d+)'", fonte):
        mapa[m.group(1)] = {"cell": m.group(2)}

    # Blocos repetíveis: uma linha de células por entrada
    repetiveis: dict[str, list[dict]] = {}
    for m in re.finditer(r"key:\s*'(curriculo_japao|curriculo_brasil|familia)'[\s\S]*?cellsPorEntrada:\s*\[([\s\S]*?)\n      \],", fonte):
        nome = m.group(1)
        linhas = []
        for linha in re.finditer(r"\{([^}]*)\}", m.group(2)):
            d = {}
            for par in re.finditer(r"(\w+):\s*'([A-Z]+\d+)'", linha.group(1)):
                d[par.group(1)] = par.group(2)
            if d:
                linhas.append(d)
        repetiveis[nome] = linhas

    return {"campos": mapa, "repetiveis": repetiveis}


def ref_para_rc(ref: str) -> tuple[int, int]:
    """'AU29' → (linha 0-based, coluna 0-based)."""
    m = re.fullmatch(r"([A-Z]+)(\d+)", ref)
    if not m:
        raise ValueError(f"referência de célula inválida: {ref}")
    letras, num = m.group(1), int(m.group(2))
    col = 0
    for ch in letras:
        col = col * 26 + (ord(ch) - 64)
    return num - 1, col - 1


# ─────────────────────────────────────────────────────────────────────────────
# Formatação no padrão da ficha
# ─────────────────────────────────────────────────────────────────────────────

def data_japonesa(valor) -> str:
    """A ficha data em Ano/Mês/Dia. Guardamos ISO, escrevemos no formato dela."""
    if not valor:
        return ""
    if isinstance(valor, (date, datetime)):
        d = valor
    else:
        try:
            d = datetime.strptime(str(valor)[:10], "%Y-%m-%d")
        except ValueError:
            return str(valor)
    return f"{d.year}/{d.month:02d}/{d.day:02d}"


def idade_em(nascimento) -> str:
    """Idade sempre derivada — a regra dos 55 anos depende disso."""
    if not nascimento:
        return ""
    try:
        n = datetime.strptime(str(nascimento)[:10], "%Y-%m-%d").date()
    except ValueError:
        return ""
    h = date.today()
    return str(h.year - n.year - ((h.month, h.day) < (n.month, n.day)))


def texto(valor) -> str:
    if valor is None:
        return ""
    if isinstance(valor, bool):
        return "SIM" if valor else "NÃO"
    if isinstance(valor, (list, tuple)):
        return " / ".join(str(v) for v in valor)
    return str(valor)


# ─────────────────────────────────────────────────────────────────────────────
# Exportação
# ─────────────────────────────────────────────────────────────────────────────

CAMPOS_DATA = {
    "data_nascimento", "foto_data", "passaporte_validade", "visto_validade",
    "koseki_validade", "reentry_validade", "q12_embarque", "data_preenchimento",
    "inicio", "fim",
}


def exportar(dados: dict, saida: str, template: str = TEMPLATE) -> dict:
    if not os.path.exists(template):
        raise FileNotFoundError(f"template não encontrado: {template}")

    mapa = carregar_mapa()
    livro_leitura = xlrd.open_workbook(template, formatting_info=True)
    livro = copiar_workbook(livro_leitura)
    aba = livro.get_sheet(0)

    escritas, ignorados = 0, []

    def escrever(ref: str, valor: str):
        nonlocal escritas
        if valor == "":
            return
        r, c = ref_para_rc(ref)
        aba.write(r, c, valor)
        escritas += 1

    # ── Campos simples ──────────────────────────────────────────────────────
    for chave, refs in mapa["campos"].items():
        if chave in ("idade",):
            continue
        valor = dados.get(chave)
        if valor is None or valor == "":
            continue

        # Sim/Não marcam a célula correspondente com ○, como no papel
        if "cellSim" in refs and "cellNao" in refs:
            marca = str(valor).lower() in ("sim", "true", "1", "yes")
            escrever(refs["cellSim"] if marca else refs["cellNao"], "○")
            continue

        if "cell" not in refs:
            continue
        v = data_japonesa(valor) if chave in CAMPOS_DATA else texto(valor)
        escrever(refs["cell"], v)

    # Idade é calculada, nunca copiada do que o candidato digitou
    if "idade" in mapa["campos"] and dados.get("data_nascimento"):
        escrever(mapa["campos"]["idade"]["cell"], idade_em(dados["data_nascimento"]))

    # ── Blocos 1:N — o sistema guarda tudo, a folha trunca ─────────────────
    for nome, linhas in mapa["repetiveis"].items():
        entradas = dados.get(nome) or []
        if len(entradas) > len(linhas):
            ignorados.append(f"{nome}: {len(entradas)} entradas, a folha comporta {len(linhas)}")
        for entrada, celulas in zip(entradas, linhas):
            for campo, ref in celulas.items():
                valor = entrada.get(campo)
                if valor in (None, ""):
                    continue
                v = data_japonesa(valor) if campo in CAMPOS_DATA else texto(valor)
                escrever(ref, v)

    os.makedirs(os.path.dirname(os.path.abspath(saida)) or ".", exist_ok=True)
    livro.save(saida)

    return {
        "saida": saida,
        "celulas_escritas": escritas,
        "campos_mapeados": len(mapa["campos"]),
        "blocos_repetiveis": {k: len(v) for k, v in mapa["repetiveis"].items()},
        "truncados": ignorados,
    }


CANDIDATO_DEMO = {
    "nome_completo": "MARINA TANAKA OLIVEIRA",
    "data_nascimento": "1996-11-14",
    "sexo": "Feminino",
    "estado_civil": "Solteira",
    "nacionalidade": "BRAS",
    "geracao": "Sansei",
    "como_soube": "Agência",
    "indicou_nome": "AGÊNCIA NIKKEI TOUR SP",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "rg_emissor": "SSP/SP",
    "passaporte": "FT654321",
    "passaporte_validade": "2031-03-18",
    "koseki": "戸籍謄本 2024",
    "koseki_validade": "2027-01-30",
    "cep": "07020-010",
    "endereco": "Rua das Acácias",
    "numero": "412",
    "bairro": "Vila Augusta",
    "cidade": "Guarulhos",
    "estado": "SP",
    "email": "marina.tanaka@example.com",
    "celular": "(11) 98765-4321",
    "altura_cm": "162",
    "peso_kg": "56",
    "cintura_cm": "70",
    "pe_cm": "23,5",
    "nivel_japones": "Intermediário",
    "ensino_medio": "completo",
    "ja_esteve_japao": "nao",
    "q1_setores": ["ELETRÔNICA", "ALIMENTÍCIO"],
    "q3_horas_extras": "sim",
    "q3_horas": "3",
    "q4_turnos": ["Diurno", "Alternado"],
    "q13_tempo_japao": "3",
    "q15_tatuagem": "sim",
    "q15_regioes": ["Braços", "Costas"],
    "q32_motivo": "Poupança",
    "curriculo_japao": [
        {"fabrica": "DENSO 刈谷工場", "empreiteira": "FUJIARTE", "tipo_servico": "Inspeção",
         "provincia": "愛知県", "cidade": "Kariya", "inicio": "2019-04-01", "fim": "2022-03-31",
         "motivo_saida": "Fim de contrato", "tipo_contrato": "派遣"},
    ],
    "curriculo_brasil": [
        {"empresa": "Eletro Sato Ltda", "cargo": "Auxiliar de produção", "uf": "SP",
         "cidade": "Guarulhos", "inicio": "2022-06-01", "fim": "2025-12-20",
         "motivo_saida": "Pedido de demissão", "tipo_contrato": "CLT"},
    ],
    "familia": [
        {"parentesco": "PAI", "nome": "HIROSHI TANAKA", "idade": "62", "telefone": "(11) 3333-1111"},
        {"parentesco": "MÃE", "nome": "ROSA OLIVEIRA TANAKA", "idade": "58", "telefone": "(11) 3333-2222"},
    ],
    "agencia": "NIKKEI TOUR SP",
    "entrevistador": "K. YAMADA",
    "data_preenchimento": "2026-08-10",
}


def main():
    ap = argparse.ArgumentParser(description="Exporta a Ficha Cadastral FUJIARTE em .xls")
    ap.add_argument("--dados", help="JSON com as respostas do candidato")
    ap.add_argument("--saida", default=os.path.join(RAIZ, "saida", "ficha-fujiarte.xls"))
    ap.add_argument("--template", default=TEMPLATE)
    args = ap.parse_args()

    dados = json.load(open(args.dados, encoding="utf-8")) if args.dados else CANDIDATO_DEMO
    r = exportar(dados, args.saida, args.template)

    print(f"  planilha        {r['saida']}")
    print(f"  celulas escritas {r['celulas_escritas']}")
    print(f"  campos no mapa   {r['campos_mapeados']}")
    print(f"  blocos 1:N       {r['blocos_repetiveis']}")
    for t in r["truncados"]:
        print(f"  truncado na folha: {t}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
