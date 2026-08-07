# SelectSys Jobs — Design System

> Regra única: **toda página, atual ou futura, monta a tela com o que está aqui.**
> Se um componente não existe, ele é criado aqui — nunca resolvido com `style` solto.

---

## 1. Onde mora cada coisa

| Arquivo | Responsabilidade |
|---|---|
| `app/src/index.css` | Entrada única: fontes, Tailwind, imports na ordem certa |
| `app/src/styles/tokens.css` | Cor, tipografia, espaço, raio, sombra, movimento (claro e escuro) |
| `app/src/styles/base.css` | Reset e elementos nativos (`h1`, `a`, `input`, foco, scrollbar) |
| `app/src/styles/animations.css` | Todo `@keyframes` do produto, sempre prefixado `ssj-` |
| `app/src/styles/components.css` | Vocabulário de interface: `.ssj-card`, `.ssj-btn`, `.ssj-pill`… |
| `app/src/brand/` | Marca: logo, carimbo, missão, cores em TS |
| `app/src/theme/theme.tsx` | Tema claro/escuro — **fonte única**, nenhuma página declara o seu |

O Tailwind foi **reescrito** para a paleta da marca (`@theme` no `index.css`): usar
`bg-slate-50` ou `text-rose-600` já sai na identidade SelectSys. Não existe azul
genérico no produto.

---

## 2. A marca

A logo conta a operação: **um ponto sai do Brasil (verde), cruza a ponte e chega
no sol vermelho (Japão)**. Ela nunca é redesenhada à mão.

```tsx
import { BrandMark, BrandLockup } from '../brand/BrandMark';
import { Hanko } from '../brand/Hanko';
import { BRAND } from '../brand/brand';

<BrandLockup size={34} withTagline />   {/* cabeçalho, rodapé            */}
<BrandMark size={26} />                 {/* símbolo isolado              */}
<BrandMark animated tone="light" />     {/* abertura / carregamento      */}
<Hanko estado="aprovado" texto="済" />  {/* etapa vencida                */}
```

- `tone="auto"` (padrão) faz o traço **acompanhar o tema** — no escuro ele clareia.
  Traço fixo escuro sobre fundo escuro faz a logo sumir; já aconteceu, não repetir.
- Nome, missão e assinatura saem de `BRAND`, nunca digitados na página.

**Carimbo (hanko).** No Japão nada é aprovado sem carimbo — é o gesto que a marca
empresta à interface. Etapa concluída recebe selo vermelho batido (`ssj-stampIn`),
etapa em curso recebe anel índigo pulsando, etapa futura fica em contorno apagado.

---

## 3. Cor

Sempre `var(--ssj-*)`. Nunca hexadecimal cru num componente.

| Papel | Token |
|---|---|
| Tinta / títulos | `--ssj-text`, `--ssj-text-2` |
| Legenda / metadado | `--ssj-muted`, `--ssj-faint` |
| Ação primária | `--ssj-indigo` |
| Destaque, marca, alerta | `--ssj-shu` (vermelho japonês) |
| Origem, sucesso | `--ssj-verde` |
| Trânsito, atenção | `--ssj-ambar` |
| Superfícies | `--ssj-paper`, `--ssj-surface`, `--ssj-surface-2` |

### Preenchimento e rótulo andam em par

Destaque e fundo de botão são trabalhos **diferentes**. No tema escuro o destaque
clareia — se o rótulo continuar branco, o texto some dentro do botão.

```css
background: var(--ssj-fill-pri);
color: var(--ssj-on-fill-pri);   /* escurece junto no tema escuro */
```

O `:hover` muda o **fundo**, nunca a cor do texto.

---

## 4. Tipografia

**IBM Plex Sans** para tudo, com **IBM Plex Sans JP** na mesma pilha — o produto
exibe japonês (`試作版`, `代理店リンク`) e a irmã oficial evita cair num fallback
feio. **IBM Plex Mono** para números, rótulos e dados.

```css
font-family: var(--ssj-font-sans);     /* corpo e títulos */
font-family: var(--ssj-font-mono);     /* rótulo, número, código */
```

### Pisos de acessibilidade — não negociáveis

| Uso | Token | Valor |
|---|---|---|
| Corpo | `--ssj-t-body` | **16px** |
| Apoio, botão, navegação | `--ssj-t-sm` | 14–15px |
| Metadado | `--ssj-t-xs` | **12.5px — piso absoluto** |
| Rótulo mono | `--ssj-t-label` | 12px |

- **Peso máximo 700.** A IBM Plex não tem 800/900: pedir isso faz o navegador
  engordar o traço artificialmente e o texto sai borrado.
- Alvo de toque mínimo **44px** (`.ssj-btn`, `.ssj-icon-btn`).
- Campo de formulário em **16px** — abaixo disso o iOS dá zoom sozinho ao focar.
- Todo tom de texto passa contraste AA (≥4.5:1). Cinza claro decorativo não
  carrega informação.

---

## 5. Escrever para o usuário

- **Sem sigla crua.** "Painel de gestão", não "ATS". Se o termo do nicho é
  obrigatório, ele vem explicado: *"COE · autorização de visto"*.
- O público é o candidato dekassegui e o analista japonês — frase curta, direta,
  sem jargão de tecnologia.
- Japonês acompanha o português onde a tela é operada no Japão.

---

## 6. Layout e componentes

```tsx
<section className="ssj-section">
  <div className="ssj-container">
    <span className="ssj-label">Etapa atual</span>
    <h2>Processo de visto</h2>
    <div className="ssj-grid">
      <article className="ssj-card">…</article>
    </div>
    <button className="ssj-btn ssj-btn--pri">Próxima etapa</button>
  </div>
</section>
```

`.ssj-grid` já é responsivo por `auto-fit` — **uma coluna no celular, N no
desktop, sem media query**. A escala tipográfica usa `clamp()` pelo mesmo motivo:
o componente serve os dois tamanhos sem duplicação.

Componentes prontos: `ssj-card` (+`--ink --seal --ok --info --link`), `ssj-btn`
(+`--pri --seal --ghost --sm --lg --block`), `ssj-chip`, `ssj-pill`
(+`--ok --info --seal --warn`), `ssj-input`, `ssj-track`, `ssj-timeline`/`ssj-step`,
`ssj-nav`, `ssj-footer`, `ssj-device`, `ssj-loader`, `ssj-pagehead`.

---

## 7. Cabeçalho, tema e carregamento

- **Existe UM cabeçalho**, o `<Navbar>` do shell. Página nenhuma desenha outro.
  Contexto de página vai em `.ssj-pagehead`, **dentro** do conteúdo.
- **Existe UM controle de tema**, no cabeçalho, via `useTheme()`. Página nenhuma
  guarda estado de tema próprio — isso fazia navegar entre telas virar o app do
  claro para o escuro.
- A abertura da marca (`<BootSplash>`) roda **uma vez por sessão**, pula no clique
  ou no Esc, e respeita `prefers-reduced-motion`.
- Troca de rota anima por `<PageTransition>`: barra fina verde → âmbar → vermelho
  (a travessia) e conteúdo entrando de baixo. Para dados em trânsito dentro da
  página, use `<Loader />` ou `<LoaderBloco />`.

---

## 8. Movimento

Keyframes disponíveis, todos com prefixo `ssj-`: `fadeUp`, `fadeIn`, `appIn`,
`stampIn`, `pop`, `draw`, `travel`, `barload`, `ring66`, `pulse`, `shimmer`.
Atalhos: `.ssj-in` + `.d1…d6` escalonam a entrada de uma lista.

Todo movimento é cancelado sob `prefers-reduced-motion: reduce`.
