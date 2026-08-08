import { defineConfig, devices } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   PLAYWRIGHT — JORNADAS CRÍTICAS DO SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Os testes de `tests/` cobrem regra de negócio pura (triagem, sitemap,
   gerador de Excel). Eles não veem a tela: um erro de tipagem que desliga o
   botão "Enviar Candidatura" passa por todos eles e só aparece quando o
   candidato liga para a agência. É esse buraco que esta suíte fecha.

   DECISÕES DE AMBIENTE
   ---------------------------------------------------------------------------
   1. Build + `vite preview`, não `vite dev`. O dev server transforma módulo
      sob demanda e reotimiza dependência no meio da navegação — com pdfjs,
      tesseract e exceljs no grafo, isso vira recarga de página no meio do
      teste, que é flake puro. O preview serve `dist/` estático: determinístico.
      O build roda com `npx vite build` DENTRO de `app/` (`cwd` abaixo), que é
      a forma que não mexe no `node_modules` da raiz.

   2. `VITE_SUPABASE_URL` aponta para um caminho da própria origem do preview.
      Duas consequências boas: as chamadas do supabase-js são same-origin (sem
      CORS nem preflight para o stub emular) e nada escapa para a internet — se
      alguma rota deixar de ser interceptada, ela bate no preview local, não em
      um projeto Supabase de verdade.

      Essas variáveis são injetadas via `process.env` do processo do webServer.
      O `loadEnv` do Vite aplica `process.env` DEPOIS dos arquivos `.env`, então
      elas vencem o `.env` local da máquina do desenvolvedor — o teste roda
      igual aqui e no runner, com ou sem credencial real no disco.

   3. A chave publicável é um literal de fachada. O stub não valida nada e
      nenhum dado sai da máquina; não há segredo envolvido, e por isso a suíte
      roda também em PR de fork, onde não existe `secrets`.
   ═════════════════════════════════════════════════════════════════════════ */

const PORTA = Number(process.env.E2E_PORT ?? 4174);
const ORIGEM = `http://localhost:${PORTA}`;

export const URL_BASE = ORIGEM;
export const PREFIXO_SUPABASE = '/__supabase';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',

  /* Jornada completa de 7 etapas com geração de .xlsx no browser: 60s dá
     folga confortável sem deixar um teste travado segurar o runner. */
  timeout: 60_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  /* `test.only` esquecido num commit faz a suíte passar verde escondendo o
     resto. Na CI isso é erro de build, não aviso. */
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: ORIGEM,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    /* Rastro só do que falhou e reexecutou: artefato pequeno, e o `trace.zip`
       do retry é exatamente o que se abre para entender a quebra. */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    command: `npx vite build && npx vite preview --port ${PORTA} --strictPort --host localhost`,
    cwd: 'app',
    url: ORIGEM,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      VITE_SUPABASE_URL: `${ORIGEM}${PREFIXO_SUPABASE}`,
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_stub_e2e_sem_segredo',
    },
  },
});
