import type { Page } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   OBSERVADORES DE PÁGINA
   ---------------------------------------------------------------------------
   Dois sensores que o critério de aceite pede em quase todo teste:

   - `observarRede`: guarda toda resposta 5xx e toda requisição que morreu no
     transporte. O critério "garantir que não retornou erro 500" vale para a
     jornada inteira, não só para a chamada que o teste clicou — um 500 numa
     chamada paralela quebra a tela do mesmo jeito.

   - `observarDialogos`: o wizard usa `alert()` para reprovar campo obrigatório.
     O Playwright dispensa diálogo automaticamente, então uma validação que
     falha some sem deixar rastro e o teste quebra três linhas depois, com uma
     mensagem que não explica nada. Capturando o texto, a falha diz qual campo
     o formulário recusou.
   ═════════════════════════════════════════════════════════════════════════ */

export interface RespostaComProblema {
  status: number;
  url: string;
}

export interface VigiaDeRede {
  erros: RespostaComProblema[];
  falhas: string[];
  /** Resumo pronto para entrar na mensagem do `expect`. */
  resumo(): string;
}

export function observarRede(page: Page): VigiaDeRede {
  const erros: RespostaComProblema[] = [];
  const falhas: string[] = [];

  page.on('response', (resposta) => {
    if (resposta.status() >= 500) {
      erros.push({ status: resposta.status(), url: resposta.url() });
    }
  });

  page.on('requestfailed', (requisicao) => {
    const motivo = requisicao.failure()?.errorText ?? 'motivo desconhecido';
    // Cancelamento é rotina (navegação, preload abortado), não é falha real.
    if (motivo.includes('ERR_ABORTED')) return;
    falhas.push(`${requisicao.url()} — ${motivo}`);
  });

  return {
    erros,
    falhas,
    resumo() {
      const linhas = [
        ...erros.map((e) => `HTTP ${e.status} em ${e.url}`),
        ...falhas.map((f) => `requisição falhou: ${f}`),
      ];
      return linhas.length ? linhas.join('\n') : 'nenhum';
    },
  };
}

export function observarDialogos(page: Page): string[] {
  const mensagens: string[] = [];
  page.on('dialog', (dialogo) => {
    mensagens.push(dialogo.message());
    void dialogo.dismiss();
  });
  return mensagens;
}
