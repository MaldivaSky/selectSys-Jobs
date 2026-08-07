"""
Teste de cobertura da Ficha FUJIARTE — prova, não promessa.

Critério de aceite D1 do escopo:
    "Teste automatizado compara célula a célula com o gabarito e falha no CI
     se divergir."

O que este teste faz, nesta ordem:

  1. Lê o mapa campo → célula do schema versionado.
  2. Acusa colisão: dois campos escrevendo na MESMA célula é bug silencioso —
     um sobrescreve o outro e ninguém percebe até o Japão reclamar.
  3. Confere que as 32 perguntas da enquete (Q1..Q32) estão no schema.
  4. Preenche TODOS os campos mapeados com um marcador único.
  5. Exporta usando o template real.
  6. REABRE o .xls gerado e confere, célula a célula, se o marcador chegou.

Sai com código 1 se qualquer etapa falhar — pronto para o CI.

    python packages/exportador/verificar_cobertura.py
"""

from __future__ import annotations

import os
import re
import sys
from collections import defaultdict

import xlrd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exportar_ficha import RAIZ, SCHEMA_TS, TEMPLATE, carregar_mapa, exportar, ref_para_rc  # noqa: E402

SAIDA = os.path.join(RAIZ, "saida", "cobertura.xls")


def cor(txt: str, ok: bool) -> str:
    return f"  {'OK  ' if ok else 'FALHA'}  {txt}"


def main() -> int:
    falhas: list[str] = []
    mapa = carregar_mapa()
    campos = mapa["campos"]
    repetiveis = mapa["repetiveis"]

    print("\n=== 1. MAPA DE CELULAS ===")
    print(f"  campos com celula      {len(campos)}")
    print(f"  blocos 1:N             { {k: len(v) for k, v in repetiveis.items()} }")
    celulas_1n = sum(len(linhas) * len(linhas[0]) for linhas in repetiveis.values() if linhas)
    print(f"  celulas dos blocos 1:N {celulas_1n}")

    # ── 2. Colisao de celulas ───────────────────────────────────────────────
    print("\n=== 2. COLISAO DE CELULAS ===")
    dono: dict[str, list[str]] = defaultdict(list)
    for chave, refs in campos.items():
        for attr, ref in refs.items():
            dono[ref].append(f"{chave}.{attr}")
    for linhas in repetiveis.values():
        for i, linha in enumerate(linhas):
            for campo, ref in linha.items():
                dono[ref].append(f"[{i}].{campo}")

    colisoes = {ref: ds for ref, ds in dono.items() if len(ds) > 1}
    if colisoes:
        for ref, ds in sorted(colisoes.items()):
            print(f"  {ref}: {', '.join(ds)}")
        falhas.append(f"{len(colisoes)} celulas com mais de um dono")
    print(cor(f"{len(dono)} celulas distintas, {len(colisoes)} colisoes", not colisoes))

    # ── 3. As 32 perguntas da enquete ───────────────────────────────────────
    print("\n=== 3. ENQUETE Q1..Q32 ===")
    fonte = open(SCHEMA_TS, encoding="utf-8").read()
    faltando = []
    for q in range(1, 33):
        if not re.search(rf"key:\s*'q{q}_", fonte) and not re.search(rf"'q{q}_\w+'", fonte):
            faltando.append(f"Q{q}")
    if faltando:
        print(f"  ausentes: {', '.join(faltando)}")
        falhas.append(f"perguntas ausentes: {', '.join(faltando)}")
    print(cor(f"{32 - len(faltando)} de 32 perguntas presentes", not faltando))

    # ── 4. Blocos obrigatorios da pagina 1 ──────────────────────────────────
    print("\n=== 4. BLOCOS DA FICHA ===")
    esperados = {
        "identificacao": ["nome_completo", "data_nascimento", "sexo", "estado_civil", "nacionalidade", "geracao", "foto"],
        "documentos": ["cpf", "rg", "passaporte", "koseki", "reentry", "visto"],
        "endereco": ["cep", "endereco", "numero", "bairro", "cidade", "estado", "email", "celular"],
        "biometria_epi": ["altura_cm", "peso_kg", "cintura_cm", "pe_cm"],
        "escolaridade": ["ensino_fundamental", "ensino_medio", "tecnico", "faculdade", "curso", "instituicao"],
        "emergencia_japao": ["emergencia_nome", "emergencia_relacao", "emergencia_provincia", "emergencia_telefone"],
        "agencia": ["agencia", "entrevistador", "promotor"],
    }
    for bloco, chaves in esperados.items():
        ausentes = [k for k in chaves if k not in campos]
        print(cor(f"{bloco:18} {len(chaves) - len(ausentes)}/{len(chaves)}" + (f"  faltam: {ausentes}" if ausentes else ""), not ausentes))
        if ausentes:
            falhas.append(f"{bloco}: {ausentes}")

    # ── 5. Preenche tudo e exporta ──────────────────────────────────────────
    print("\n=== 5. EXPORTACAO COM TODOS OS CAMPOS ===")
    dados: dict = {}
    esperado_por_celula: dict[str, str] = {}
    n = 0
    for chave, refs in campos.items():
        if "cellSim" in refs:
            dados[chave] = "sim"
            esperado_por_celula[refs["cellSim"]] = "○"
            continue
        if "cell" not in refs:
            continue
        n += 1
        marca = f"X{n:03d}"
        dados[chave] = marca
        esperado_por_celula[refs["cell"]] = marca

    # Datas precisam de valor valido para nao virarem texto cru
    for c in ("data_nascimento", "foto_data", "passaporte_validade", "visto_validade",
              "koseki_validade", "reentry_validade", "q12_embarque", "data_preenchimento"):
        if c in dados:
            dados[c] = "1996-11-14"
            esperado_por_celula[campos[c]["cell"]] = "1996/11/14"
    dados.pop("idade", None)
    # Idade e DERIVADA da data de nascimento, nunca copiada — a regra dos 55
    # anos depende disso. O esperado e a idade calculada, nao um marcador.
    if "idade" in campos and "cell" in campos["idade"]:
        from exportar_ficha import idade_em
        esperado_por_celula[campos["idade"]["cell"]] = idade_em(dados["data_nascimento"])

    for nome, linhas in repetiveis.items():
        dados[nome] = []
        for i, linha in enumerate(linhas):
            entrada = {}
            for campo, ref in linha.items():
                n += 1
                marca = f"R{n:03d}"
                entrada[campo] = marca
                esperado_por_celula[ref] = marca
            dados[nome].append(entrada)

    r = exportar(dados, SAIDA, TEMPLATE)
    print(f"  celulas escritas       {r['celulas_escritas']}")
    print(f"  celulas esperadas      {len(esperado_por_celula)}")

    # ── 6. Reabre e confere ─────────────────────────────────────────────────
    print("\n=== 6. CONFERENCIA CELULA A CELULA NO ARQUIVO GERADO ===")
    livro = xlrd.open_workbook(SAIDA)
    aba = livro.sheet_by_index(0)
    ok, divergentes = 0, []
    for ref, esperado in esperado_por_celula.items():
        lin, col = ref_para_rc(ref)
        if lin >= aba.nrows or col >= aba.ncols:
            divergentes.append(f"{ref}: fora da area da planilha")
            continue
        obtido = str(aba.cell_value(lin, col)).strip()
        if obtido == esperado:
            ok += 1
        else:
            divergentes.append(f"{ref}: esperado {esperado!r}, obtido {obtido!r}")

    for d in divergentes[:15]:
        print(f"  {d}")
    if len(divergentes) > 15:
        print(f"  ... e mais {len(divergentes) - 15}")
    print(cor(f"{ok} de {len(esperado_por_celula)} celulas conferem", not divergentes))
    if divergentes:
        falhas.append(f"{len(divergentes)} celulas divergentes")

    # ── Resultado ───────────────────────────────────────────────────────────
    print("\n" + "=" * 66)
    if falhas:
        print("  RESULTADO: FALHOU")
        for f in falhas:
            print(f"    - {f}")
        return 1
    print(f"  RESULTADO: PASSOU — {ok} celulas da ficha FUJIARTE preenchidas e conferidas")
    print(f"  arquivo: {SAIDA}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
