# AC2RP Tecnologia — Landing Page

Landing page de posicionamento digital da **AC2RP Tecnologia**: transformação digital com dono.

> **Mensagem central:** Quanta receita a tecnologia ainda não gerou para o seu negócio?
>
> **Objetivo da página:** agendar a sessão estratégica gratuita de 30 minutos (formulário em `#aplicacao`; a URL curta `/sessao-estrategica` redireciona para lá, via `vercel.json` na Vercel ou `nginx.conf` no Docker).

Página estática, responsiva e sem dependências de build. Derivada da estrutura do site da ZoenLabs, com marca, paleta e conteúdo próprios.

## Pendências para validar antes de publicar

- [ ] **Domínio**: assumido `ac2rptecnologia.com.br` (sem DNS no momento da criação). Se for outro, trocar em `index.html`, `termos/`, `politica-de-privacidade/`, `sitemap.xml`, `robots.txt` e `vercel.json`.
- [ ] **WhatsApp**: número herdado do Edson (+55 19 99573-5894) em `index.html` e em `WHATS_NUMBER` no `assets/js/main.js`.
- [ ] **E-mail**: assumido `contato@ac2rptecnologia.com.br`.
- [ ] **Seção "Muito prazer"**: texto institucional genérico. Definir se terá fundador nomeado, foto e história.
- [ ] **Prova**: cards descrevem o método; inserir case/depoimento real quando houver (comentário reservado no HTML).
- [ ] **Redes sociais**: só WhatsApp no rodapé. Adicionar Instagram/LinkedIn quando existirem (rodapé e `sameAs` no JSON-LD).
- [ ] **Foro** nos Termos de Uso: São Paulo/SP, herdado do modelo.
- [ ] **Logo**: monograma provisório (duplo chevron azul). Substituir `assets/img/favicon.svg`, os PNGs de ícone e `og-ac2rp.jpg` quando a identidade final existir.

### Formulário de aplicação

O site é estático. O envio do formulário é controlado em `assets/js/main.js`:

- `FORM_ENDPOINT` vazio (padrão): ao enviar, abre o WhatsApp com a aplicação já preenchida e oferece e-mail como alternativa.
- `FORM_ENDPOINT` preenchido (Formspree, n8n, Make, Zapier, Apps Script…): faz `POST` JSON com os campos `nome, email, telefone, empresa, objetivo, papel, faturamento, impacto, lgpd, origem, enviadoEm`. Se o POST falhar, cai no WhatsApp/e-mail.

---

## Docker

O site é estático e roda numa imagem **nginx** enxuta.

```bash
# build
docker build -t ac2rp-site .

# rodar (site em http://localhost:8080)
docker run -d --name ac2rp-site -p 8080:80 ac2rp-site

# ou com docker compose
docker compose up -d --build
```

- A imagem usa `nginx.conf` (gzip, cache de assets, headers de segurança).
- Imagem leve: só HTML/CSS/JS + ícones (poucos MB).
- Pronto para publicar em qualquer lugar que rode container: Fly.io, Railway, Render, Cloud Run, ECS, um VPS com Docker, etc.

## Deploy na VPS (GHCR + GitHub Actions)

A cada `push` na branch `main`, o GitHub Actions (`.github/workflows/docker-publish.yml`) builda a imagem e publica no **GitHub Container Registry**:

```
ghcr.io/ac2rp/site-ac2rp:latest
```

**1. Visibilidade do pacote:** o pacote já está **público** (a VPS baixa sem login). Se um dia torná-lo privado, faça `docker login ghcr.io` na VPS com um PAT de escopo `read:packages`.

**2. Na VPS** (com Docker instalado):

```bash
mkdir -p /opt/ac2rp && cd /opt/ac2rp
curl -O https://raw.githubusercontent.com/ac2rp/site-ac2rp/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

O site fica em `http://SEU_IP` (porta 80).

**3. Atualizar** (após novos pushes) — ou use o `deploy.sh`:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f
```

### HTTPS

- **Recomendado (vocês já usam Cloudflare):** aponte `ac2rptecnologia.com.br` (e `www`) para o IP da VPS no Cloudflare com o **proxy ligado** (nuvem laranja) e SSL/TLS em *Full*. O Cloudflare emite o certificado e a VPS só serve HTTP na porta 80.
- **Alternativa:** rode um Caddy/Traefik na frente (TLS automático via Let's Encrypt) e mude a porta do site para `8080:80` no `docker-compose.prod.yml`.

## Como rodar

Como o CSS/JS são carregados por caminho relativo, use um servidor local (abrir via `file://` funciona, mas um servidor evita bloqueios de alguns navegadores):

```bash
# na pasta do projeto
python -m http.server 8777
# abra http://localhost:8777
```

Ou apenas dê duplo-clique em `index.html`.

---

## Estrutura de arquivos

```
site-ac2rp/
├── index.html            # Marcação completa + todas as seções e copy (pt-BR)
├── assets/
│   ├── css/styles.css    # Design system (tokens) + estilos das seções
│   └── js/main.js        # Reveal on scroll, nav sticky, menu mobile, ano
└── README.md             # Este arquivo / documentação do design system
```

---

## Seções (na ordem)

1. **Hero** — reposiciona a marca na primeira dobra, com composição visual (card de produto + gráfico).
2. **Conceito** — vida, propósito e construção com sentido.
3. **Problema** — dores reais do mercado.
4. **O que construímos** — 6 cards de serviços.
5. **Como trabalhamos** — fluxo de 5 etapas (bloco escuro).
6. **Diferencial** — 6 motivos para escolher a AC2RP.
7. **Prova & autoridade** — texto institucional + espaço para cases.
8. **Momentos de entrada** — 4 pontos onde o cliente se reconhece.
9. **CTA final** — conversão (e-mail + WhatsApp).
10. **Rodapé** — logo, frase, navegação, contato, redes, direitos.

---

## Design System

Todos os tokens ficam em `:root` no topo de `assets/css/styles.css`.

### Cores

Direção: **base cinza quente** (não bege), **identidade teal** (do logotipo) e **atmosfera quente** em coral/âmbar.

| Token | Hex | Uso |
|-------|-----|-----|
| `--brand` | `#24b5a4` | Teal do logotipo — **cor de identidade** |
| `--brand-deep` | `#17897c` | Teal profundo — eyebrows, contornos |
| `--brand-soft` | `#7ad6cb` | Teal claro — acentos em fundo escuro |
| `--accent` | `#f0603a` | Coral quente — CTA principal, energia |
| `--accent-deep` | `#d9663d` | Terracota |
| `--accent-2` | `#f5a24b` | Âmbar — calor e destaques |
| `--gold` | `#eab54e` | Dourado sutil |
| `--bg` / `--bg-alt` | `#e9eaee` / `#e1e3e9` | **Fundo cinza quente** (substitui o bege) |
| `--surface` / `--card` | `#f6f7f9` / `#ffffff` | Superfícies e cartões |
| `--ink` | `#14161c` | Grafite / near-black moderno (seções escuras) |

- Gradiente **quente** (`--grad-warm`, coral → âmbar): botão primário e `.text-accent`.
- Gradiente **teal** (`--grad-teal`): marca, números do processo, checks, acentos.
- Decisão: CTA principal fica **quente** (conversão + calor) e o **teal** carrega a identidade. Para inverter, troque `background` de `.btn--primary` por `var(--grad-teal)`.

### Tipografia

- **Títulos:** [Poppins](https://fonts.google.com/specimen/Poppins) — geométrica, moderna e alinhada ao logotipo da AC2RP (pesos 500–800).
- **Textos:** [Inter](https://fonts.google.com/specimen/Inter) — sans-serif moderna e muito legível.
- Escala fluida via `clamp()` (`--fs-hero`, `--fs-h2`, `--fs-lead`, etc.).

### Vídeo institucional

- Hospedado no **Cloudflare R2**: `https://pub-3c0c7295cc89480287b4f5bda8455d27.r2.dev/AC2RP.mp4`. Para trocar o vídeo, suba o novo arquivo no bucket e ajuste o `src` no `index.html`.
- **Reprodução:** no **desktop** o vídeo dá autoplay mudo em loop ao entrar; no **mobile** toca ao passar/tocar sobre o vídeo. Um botão de som permite ativar o áudio (`assets/js/main.js`).
- **Peso:** o arquivo tem ~36 MB. Como agora há autoplay no desktop, recomenda-se **comprimir** (ex.: reexportar em H.264/H.265 ~1080p, alvo de 4–8 MB) para acelerar o carregamento e economizar dados.
- O frame usa `object-fit: contain` sobre fundo escuro, então funciona com vídeo horizontal ou vertical sem cortar conteúdo.

### Logotipo

O símbolo (raio dentro de um quadrado teal arredondado) e o texto `AC2RP` são recriados em **SVG inline** no `index.html` (nav e rodapé) — escaláveis e nítidos. Para usar o PNG original, substitua o `<span class="brand__mark">…</span>` por `<img src="assets/img/logo.png" alt="AC2RP">`.

### Componentes principais

- **Botões:** `.btn` + variação `--primary` (gradiente quente), `--ghost` (contorno oliva), `--whats` (verde WhatsApp). Tamanhos: `--sm`, `--lg`.
- **Eyebrow:** rótulo de seção com ponto gradiente (`.eyebrow`, variante `.eyebrow--dark` para fundos escuros).
- **Cards:** `.card` (serviços), `.moment` (momentos de entrada), `.step` (processo), `.stat` (autoridade).
- **Texto de destaque:** `.text-accent` aplica o gradiente quente ao texto.

### Movimento

- **Reveal on scroll** via `IntersectionObserver` (classe `.reveal`, delays com `data-reveal-delay="1..5"`).
- Microinterações de hover em cards, botões e links.
- Elementos flutuantes no hero (`@keyframes float`) e gráfico animado (`@keyframes draw`).
- Respeita `prefers-reduced-motion` (desativa animações).

### Responsividade

Breakpoints principais: **1024px** (tablet — grids reduzem colunas, hero empilha) e **720px** (mobile — menu vira hambúrguer, grids em 1 coluna, botões full-width).

---

## Personalização rápida (o que trocar)

Antes de publicar, substitua os placeholders:

| O quê | Onde | Valor atual (placeholder) |
|-------|------|---------------------------|
| **Número do WhatsApp** | `index.html` (links `wa.me/...`) e `.whats-float` | `5500000000000` |
| **E-mail de contato** | `index.html` (`mailto:` e rodapé) | `contato@ac2rptecnologia.com.br` |
| **Redes sociais** | Rodapé (`.footer__social`) | `href="#"` (Instagram/LinkedIn) |
| **Cases reais** | Seção *Autoridade* | Área "em construção" |
| **Logo (opcional)** | `.brand__mark` no `index.html` | SVG recriado do raio + `AC2RP` |
| **Domínio** | `index.html` (canonical/OG/JSON-LD), `robots.txt`, `sitemap.xml` | `https://ac2rptecnologia.com.br` |
| **Redes (JSON-LD)** | `sameAs` no JSON-LD do `index.html` | Instagram/LinkedIn placeholder |

> **Importante:** o domínio `https://ac2rptecnologia.com.br` é um **placeholder** e aparece em vários lugares (canonical, `og:url`, `og:image`, Twitter, JSON-LD, `robots.txt`, `sitemap.xml`). Troque por Localizar/Substituir quando o domínio final estiver definido. As URLs de imagem no Open Graph **precisam ser absolutas** (com o domínio real) para o WhatsApp exibir o preview.

Dica: os números de WhatsApp aparecem em 4 lugares — use "localizar e substituir" por `5500000000000`.

---

## SEO, GEO, compartilhamento e favicon

A página vem preparada para ser **indexada no Google** e **citada por motores de IA** (GEO — Generative Engine Optimization).

- **Meta tags:** `title` e `description` otimizados, `keywords`, `robots` (`index, follow, max-image-preview:large`), `canonical`, idioma e geo (`pt-BR`, `BR`).
- **Open Graph + Twitter Card:** preview rico no WhatsApp, Facebook, LinkedIn e X, usando a imagem `assets/img/og-ac2rp.jpg` (1200×630).
- **Dados estruturados (JSON-LD):** `Organization`/`ProfessionalService` (com catálogo de serviços), `WebSite` e `FAQPage` — ajudam o Google e as IAs a entenderem e citarem a AC2RP.
- **`robots.txt`:** libera buscadores tradicionais **e** bots de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.), apontando o `sitemap.xml`.
- **`sitemap.xml`** e **`site.webmanifest`** (PWA / ícones).

### Favicon e imagem de compartilhamento

| Arquivo | Uso |
|---|---|
| `favicon.ico` (raiz) + `assets/img/favicon-*.png`, `favicon.svg` | Ícone na aba do navegador (raio no círculo teal) |
| `assets/img/apple-touch-icon.png` | Ícone no iOS |
| `assets/img/icon-maskable-512.png` | Ícone PWA (maskable) |
| `assets/img/og-ac2rp.jpg` / `.png` | Imagem exibida ao compartilhar o link (WhatsApp etc.) |

**Regerar as imagens** (precisa de Python + Pillow; as fontes Poppins são baixadas em tempo de execução): os scripts usados estão descritos abaixo e podem ser reexecutados se você mudar cores, textos ou o logo.

- Favicon: círculo teal `#24b5a4` + raio branco, gerado em 16/32/48/180/192/512 px, `.ico` e versão *maskable*.
- OG image: reproduz o hero (logo, headline com destaque coral, subtítulo e card de vídeo) em 1200×630.

> **Dica:** depois de publicar, valide o preview em [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e os dados estruturados em [Rich Results Test](https://search.google.com/test/rich-results). Cadastre o site no **Google Search Console** e envie o `sitemap.xml` para acelerar a indexação.

## Acessibilidade & SEO técnico

- HTML semântico, `lang="pt-BR"`, landmarks (`header`, `main`, `footer`, `nav`).
- `aria-label` em ícones/links e no toggle do menu; `Esc` fecha o menu mobile.
- Meta description e Open Graph preenchidos.
- Contraste de texto pensado para fundos claros e escuros.
