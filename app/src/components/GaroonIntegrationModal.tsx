import { createPortal } from 'react-dom';
import { Database, X, AlertTriangle, CircleDot } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   INTEGRAÇÃO CYBOZU GAROON — ESTADO: NÃO CONECTADA
   ---------------------------------------------------------------------------
   Este painel é informativo de propósito. A versão anterior tentava transmitir
   a candidatura direto do navegador e foi removida por quatro motivos, todos
   verificados contra a documentação da Cybozu:

   1. O endpoint não existe. Ela fazia POST em `/g/api/v1/cbp/workflow/records`;
      `cbp` não é uma aplicação válida e o módulo Workflow da REST API do Garoon
      é somente leitura — não há POST de criação.
   2. O corpo da requisição era do Kintone (`{app, record:{campo:{value}}}`),
      que é outro produto da Cybozu, com um ID de aplicação inventado (1042).
   3. A credencial ia no bundle público. `VITE_*` é embutido no JavaScript
      entregue a qualquer visitante, e `X-Cybozu-Authorization` carrega
      login:senha em base64 — ou seja, a senha da matriz ficava legível.
   4. Quando a resposta não trazia id, ela inventava `GRN-<timestamp>` e
      declarava sucesso. O operador via "sincronizado" para um registro que
      nunca existiu no Japão.

   Para conectar de verdade é preciso, do administrador de TI da FUJIARTE:
   qual produto está em uso (Garoon ou Kintone), um ambiente de teste, e os
   IDs reais do formulário. O transporte então vive no servidor — nunca aqui.
   ═════════════════════════════════════════════════════════════════════════ */

interface GaroonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PENDENCIAS = [
  'Confirmar com a TI da FUJIARTE se o sistema é o Garoon ou o Kintone — a API é diferente em cada um.',
  'Receber um ambiente de teste e os IDs reais do formulário de destino.',
  'Mover o transporte para uma função no servidor, com a credencial fora do navegador.',
  'Definir a base legal da transferência internacional de dado sensível (LGPD).',
];

export function GaroonIntegrationModal({ isOpen, onClose }: GaroonModalProps) {
  if (!isOpen) return null;

  // Portal obrigatório: o painel vive dentro do `PageTransition`, que aplica
  // `transform`. Um ancestral transformado vira bloco de contenção e faz o
  // `position: fixed` ancorar nele em vez de na tela — era isso que jogava o
  // modal 1000px abaixo da dobra no celular.
  return createPortal(
    <div className="ssj-modal-veu" onClick={onClose}>
      <div className="ssj-modal ssj-on-dark" onClick={(e) => e.stopPropagation()}>
        <header className="ssj-modal__topo">
          <div className="ssj-modal__titulo">
            <span className="ssj-modal__icone">
              <Database size={22} />
            </span>
            <div>
              <h2>Integração Cybozu Garoon</h2>
              <p>
                <CircleDot size={13} /> Não conectada
              </p>
            </div>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="ssj-modal__corpo">
          <div className="ssj-modal__aviso">
            <AlertTriangle size={20} />
            <p>
              Não existe conexão com o sistema da matriz. Nenhum dado de candidato é enviado ao
              Japão por este painel — hoje o caminho é o exportador de planilha.
            </p>
          </div>

          <div>
            <h3 className="ssj-modal__subtitulo">O que falta para conectar</h3>
            <ol className="ssj-modal__lista">
              {PENDENCIAS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
