-- ============================================================
-- Série "Nômades Digitais" — 8 posts prontos, no estilo do site
-- (verde floresta + acento âmbar pra contraste e leitura).
-- Cole este arquivo INTEIRO no SQL Editor do Supabase e RUN.
-- Idempotente: se o slug já existir, o post não é duplicado.
-- ============================================================

-- 1) Panorama global: o mapa dos vistos ----------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'O Mapa dos Vistos de Nômade Digital: 60+ Países Já Abriram as Portas',
  'paises-com-visto-de-nomade-digital',
  'O panorama global dos vistos pra quem trabalha de qualquer lugar — e como escolher o seu primeiro destino.',
  $p1$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 1 de 8</span>
<h1>🗺️ O Mapa dos Vistos de Nômade Digital</h1>
<p>Mais de 60 países já criaram vistos pra quem trabalha remoto. O mundo abriu as portas — a pergunta agora é: por qual delas você entra?</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>5 minutos</p></div>
<div class="card"><h3>🌍 Tema</h3><p>Panorama global</p></div>
<div class="card"><h3>📌 Nível</h3><p>Começando do zero</p></div>
</div>
<p>Até pouco tempo atrás, morar fora trabalhando pela internet era uma zona cinzenta: a maioria dos nômades viajava com visto de turista, sem poder ficar muito tempo em lugar nenhum. Isso mudou. Hoje, <strong>mais de 60 países</strong> oferecem algum tipo de visto pensado exatamente pra quem trabalha remoto.</p>
<div class="highlight"><strong>O que é um visto de nômade digital?</strong> É uma autorização de residência temporária pra quem trabalha pela internet pra empresas ou clientes de FORA do país. Você mora ali legalmente, mas sua renda vem de outro lugar.</div>
<h2>Onde o movimento é mais forte</h2>
<ul>
<li><strong>Europa</strong> — a líder disparada: Portugal, Espanha, Estônia, Croácia, Grécia, Itália e mais de uma dúzia de outros.</li>
<li><strong>Caribe</strong> — os pioneiros: Barbados e Bermudas criaram os primeiros programas em 2020, no auge do trabalho remoto.</li>
<li><strong>América Latina</strong> — México, Colômbia, Costa Rica e Brasil (sim, nós também temos um) atraem quem quer custo menor e fuso amigável.</li>
<li><strong>Ásia e Oriente Médio</strong> — Dubai, Malásia, Japão e Indonésia entraram no jogo com propostas bem diferentes entre si.</li>
</ul>
<h2>O que quase todos pedem</h2>
<p>Os detalhes variam, mas o pacote básico se repete em quase todo programa:</p>
<ul>
<li>Comprovação de <strong>renda remota</strong> (contrato de trabalho, clientes ou faturamento da sua empresa).</li>
<li><strong>Seguro saúde</strong> válido no país.</li>
<li>Antecedentes criminais limpos.</li>
<li>Renda mínima mensal — varia de menos de US$ 1.000 (Colômbia) a mais de US$ 5.000 (alguns países europeus).</li>
</ul>
<h2>Como escolher o seu destino</h2>
<p>Não existe "melhor país" — existe o melhor pra <strong>sua fase</strong>. Os critérios que realmente importam: custo de vida, fuso horário em relação aos seus clientes, idioma, tributação e se o visto abre (ou não) caminho pra residência permanente.</p>
<p>Nos próximos posts desta série eu vou destrinchar os destinos mais interessantes, um por um: Portugal, Espanha, Estônia, Dubai, América Latina, os novos entrantes — e o assunto que ninguém gosta de falar: impostos.</p>
<p style="text-align:center"><a class="fonte" href="https://www.mappr.co/digital-nomad-visa-countries/" target="_blank" rel="noopener">Ver o mapa completo dos países →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>O mundo virou escritório — e agora virou também endereço legal. Escolher bem a primeira porta faz toda a diferença na jornada. Segue a série que a gente abre cada uma delas.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p1$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 2) Portugal (D8) -------------------------------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'Visto D8: Portugal É a Porta de Entrada de Quem Fala Português',
  'visto-d8-portugal',
  'O visto de nômade digital mais popular entre brasileiros — com caminho real pra residência e cidadania europeia.',
  $p2$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post ol{margin:16px 0 22px 22px}
.post ol li{padding-left:8px;margin-bottom:10px}
.post ol li::before{content:none}
.post ol li::marker{color:#F5C97B;font-weight:700}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 2 de 8</span>
<h1>🇵🇹 Portugal e o Visto D8</h1>
<p>Mesmo idioma, comunidade brasileira gigante e um caminho concreto até a cidadania europeia. Não é à toa que é o queridinho.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>5 minutos</p></div>
<div class="card"><h3>💶 Renda pedida</h3><p>±4 salários mínimos PT</p></div>
<div class="card"><h3>🛤 Caminho</h3><p>Visto → residência → cidadania</p></div>
</div>
<p>Se você fala português e sonha em morar na Europa trabalhando remoto, Portugal é quase sempre a primeira resposta. O <strong>visto D8</strong> foi criado exatamente pra isso: receber quem trabalha pela internet pra empresas ou clientes de fora de Portugal.</p>
<h2>O que o D8 pede</h2>
<ul>
<li>Renda remota comprovada de cerca de <strong>4x o salário mínimo português</strong> — hoje na casa dos €3.500/mês (o valor sobe todo ano, confirme o vigente antes de aplicar).</li>
<li>Prova do vínculo remoto: contrato de trabalho, contratos com clientes ou faturamento da sua empresa.</li>
<li>NIF (o CPF português), comprovante de onde você vai morar e seguro saúde.</li>
<li>Antecedentes criminais limpos.</li>
</ul>
<h2>O caminho na prática</h2>
<ol>
<li>Você aplica no consulado ainda no Brasil e recebe um <strong>visto de 4 meses</strong> pra entrar em Portugal.</li>
<li>Lá dentro, agenda na AIMA e troca por uma <strong>autorização de residência de 2 anos</strong>, renovável.</li>
<li>Depois de <strong>5 anos</strong> de residência legal, pode pedir residência permanente — e a <strong>cidadania portuguesa</strong>, que abre a União Europeia inteira.</li>
</ol>
<div class="highlight"><strong>A vantagem escondida do brasileiro:</strong> além do idioma, os acordos entre Brasil e Portugal (CPLP e o estatuto de igualdade) costumam simplificar burocracias que travam nômades de outras nacionalidades.</div>
<h2>O outro lado da balança</h2>
<p>Nem tudo são pastéis de nata: o custo de moradia em Lisboa e Porto subiu muito com a própria chegada dos remotos, e a fila da imigração (AIMA) exige paciência. Muita gente resolve os dois problemas na mesma jogada: morando em cidades menores como Braga, Coimbra ou Aveiro.</p>
<p style="text-align:center"><a class="fonte" href="https://www.forbes.com/sites/meggenharris/2026/03/15/10-countries-offering-digital-nomad-visas-in-2026---and-how-they-work/" target="_blank" rel="noopener">Ler a matéria da Forbes sobre os vistos →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>O D8 não é só um visto — é um projeto de vida com data pra virar passaporte europeu. Se o plano é longo prazo, poucas portas do mundo pagam tão bem a paciência.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p2$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 3) Espanha --------------------------------------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'Espanha: o Visto de Nômade Digital Que Nasceu Dentro de Uma Lei de Startups',
  'visto-nomade-digital-espanha',
  'Qualidade de vida, cidades conectadas e até um regime de imposto especial — a aposta espanhola pra atrair talento remoto.',
  $p3$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 3 de 8</span>
<h1>🇪🇸 Espanha: Remoto Com Selo de Startup</h1>
<p>O visto espanhol nasceu dentro da Ley de Startups — e hoje aparece em quase toda lista de melhores destinos da Europa.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>4 minutos</p></div>
<div class="card"><h3>💶 Renda pedida</h3><p>±200% do mínimo espanhol</p></div>
<div class="card"><h3>📅 Duração</h3><p>Até 5 anos somando renovações</p></div>
</div>
<p>A Espanha demorou pra entrar no jogo, mas entrou bem: o visto de nômade digital foi criado dentro da <strong>Ley de Startups</strong>, o pacote de leis que o país lançou pra atrair tecnologia e talento. O resultado é um dos programas mais completos da Europa.</p>
<h2>Como funciona</h2>
<ul>
<li>É pra quem trabalha remoto pra <strong>empresas de fora da Espanha</strong> — e a lei ainda permite até <strong>20% da renda</strong> vinda de clientes espanhóis.</li>
<li>Renda mínima em torno de <strong>200% do salário mínimo espanhol</strong> (na casa dos €2.700/mês — confirme o valor atual).</li>
<li>Autorização inicial que, somando renovações, pode chegar a <strong>5 anos</strong> — o tempo que conta pra pedir residência de longa duração.</li>
<li>Dá pra incluir cônjuge e filhos no mesmo processo.</li>
</ul>
<div class="highlight"><strong>O bônus fiscal:</strong> quem se muda pode tentar o regime especial de tributação (o famoso "regime dos impatriados"), com alíquota fixa reduzida sobre o salário por alguns anos. É um dos motivos de a Espanha aparecer no topo das listas — mas exige requisitos próprios, então estude antes.</div>
<h2>Onde os nômades estão se instalando</h2>
<p><strong>Barcelona</strong> e <strong>Madrid</strong> são as óbvias — caras, mas com comunidade remota enorme. O movimento mais esperto está em <strong>Valência</strong> e <strong>Málaga</strong>: sol o ano todo, custo menor, internet excelente e cenas de coworking crescendo rápido.</p>
<p>Pro brasileiro, o espanhol é a barreira de idioma mais baixa possível — em poucos meses você opera no dia a dia sem sofrimento.</p>
<p style="text-align:center"><a class="fonte" href="https://citizenremote.com/blog/the-best-countries-for-digital-nomads-in-2026/" target="_blank" rel="noopener">Ver o ranking dos melhores países →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>A Espanha tratou o nômade digital como política de país, não como turista estendido. Pra quem quer Europa com sol, idioma acessível e planejamento de longo prazo, é candidata fortíssima.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p3$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 4) Estônia e o e-Residency ---------------------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'Estônia: o Pequeno País Que Inventou a Residência Digital',
  'estonia-e-residency',
  'Antes de visto de nômade virar moda, a Estônia já deixava qualquer pessoa do mundo abrir uma empresa europeia pelo computador.',
  $p4$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 4 de 8</span>
<h1>🇪🇪 Estônia: Onde Tudo Começou</h1>
<p>Um país de 1,3 milhão de habitantes que resolveu existir na internet — e criou o modelo que o mundo inteiro copiou depois.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>4 minutos</p></div>
<div class="card"><h3>💡 Conceito</h3><p>e-Residency (2014)</p></div>
<div class="card"><h3>🖥 Governo</h3><p>~99% dos serviços online</p></div>
</div>
<p>Quando se fala em nômade digital, quase ninguém começa pela Estônia — e deveria. Esse pequeno país báltico digitalizou praticamente o Estado inteiro: quase todos os serviços públicos funcionam online, de abrir empresa a assinar contrato.</p>
<h2>e-Residency: o que é (e o que NÃO é)</h2>
<p>Em 2014 a Estônia lançou o <strong>e-Residency</strong>: uma identidade digital oficial que qualquer pessoa do mundo pode solicitar. Com ela, você consegue <strong>abrir e administrar uma empresa da União Europeia 100% pela internet</strong> — emitir notas, assinar documentos, pagar impostos — sem nunca ter pisado no país.</p>
<div class="highlight"><strong>Atenção ao detalhe:</strong> o e-Residency NÃO é visto, não é residência física e não dá direito de morar na Europa. É uma ferramenta de negócios. Pra morar lá, o caminho é outro: o visto de nômade digital estoniano, criado em 2020.</div>
<h2>O visto de nômade digital da Estônia</h2>
<ul>
<li>Permite morar e trabalhar remoto da Estônia por <strong>até 1 ano</strong>.</li>
<li>Renda mínima na casa dos <strong>€3.500/mês</strong> nos meses anteriores (confirme o valor vigente).</li>
<li>Combina perfeitamente com o e-Residency: sua empresa europeia + você morando na Europa.</li>
</ul>
<h2>Pra quem faz sentido</h2>
<p>Freelancers e donos de micro-negócio digital que querem <strong>faturar em euro</strong>, com uma empresa em ambiente estável e burocracia mínima — mesmo morando em outro lugar. É menos sobre praia e coworking, e mais sobre estrutura de negócio global.</p>
<p style="text-align:center"><a class="fonte" href="https://www.e-resident.gov.ee/" target="_blank" rel="noopener">Conhecer o e-Residency oficial →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>A Estônia provou que um país pode ser uma plataforma. Antes de escolher onde morar, vale entender onde a sua empresa vai viver — às vezes são dois endereços diferentes.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p4$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 5) Dubai / Emirados ----------------------------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'Dubai: Trabalhar Remoto Com Zero Imposto de Renda Local',
  'visto-remoto-dubai',
  'O visto de trabalho remoto dos Emirados e o que significa, na prática, ganhar em dólar num lugar que não cobra imposto de renda.',
  $p5$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 5 de 8</span>
<h1>🇦🇪 Dubai: Renda Global, Imposto Zero</h1>
<p>O programa de trabalho remoto dos Emirados é a aposta mais agressiva do mundo pra atrair quem ganha em moeda forte.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>4 minutos</p></div>
<div class="card"><h3>💵 Renda pedida</h3><p>±US$ 3.500/mês</p></div>
<div class="card"><h3>🧾 IR local</h3><p>0%</p></div>
</div>
<p>Dubai virou sinônimo de uma tese simples: <strong>vender pro mundo, ganhar em dólar ou euro, e não pagar imposto de renda local</strong>. O visto de trabalho remoto dos Emirados (o "virtual working programme") existe pra isso.</p>
<h2>Como funciona</h2>
<ul>
<li>Válido por <strong>1 ano, renovável</strong>, morando em Dubai ou em outro emirado.</li>
<li>Renda remota comprovada em torno de <strong>US$ 3.500/mês</strong> (confirme o valor vigente), com contrato ou empresa própria.</li>
<li>Seguro saúde com cobertura nos Emirados e passaporte válido.</li>
<li>Com o visto, você tira o Emirates ID e consegue alugar, abrir conta e viver normalmente.</li>
</ul>
<h2>Por que tanta gente de vendas olha pra lá</h2>
<p>Pra quem trabalha com <strong>vendas internacionais</strong> — SDR, closer, consultor — a conta é sedutora: comissões em moeda forte, hub aéreo que alcança meio mundo em poucas horas, segurança, e a cidade inteira desenhada pra negócios. O nível de energia é o oposto de uma vila de surf: Dubai é pra fase de ganhar, não de desacelerar.</p>
<div class="highlight"><strong>⚠️ O alerta que vale ouro:</strong> imposto zero EM DUBAI não significa imposto zero NA SUA VIDA. Se você continuar residente fiscal no Brasil, a Receita continua te esperando. Esse assunto é tão importante que ganhou um post só dele — o último da série.</div>
<h2>O outro lado</h2>
<p>Custo de vida alto (moradia principalmente), verão de 45°C que te tranca no ar-condicionado, e uma cultura de regras que merece respeito e estudo antes da mudança.</p>
<p style="text-align:center"><a class="fonte" href="https://u.ae/en/information-and-services/visa-and-emirates-id/types-of-visa/remote-work-visas" target="_blank" rel="noopener">Ver o programa oficial dos Emirados →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>Dubai é ferramenta de aceleração: maximizar ganho em moeda forte por alguns anos. Só não esqueça de resolver o lado brasileiro do imposto — senão a economia vira dívida.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p5$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 6) América Latina ------------------------------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'América Latina: Nomadizar Perto de Casa (México, Colômbia e Costa Rica)',
  'nomade-digital-america-latina',
  'Custo menor, fuso igual ao seu e espanhol que se aprende rápido — o jeito mais inteligente de começar a vida nômade.',
  $p6$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 6 de 8</span>
<h1>🌎 América Latina: o Começo Inteligente</h1>
<p>Você não precisa atravessar o Atlântico pra nomadizar. Do lado de cá tem visto acessível, custo baixo e o mesmo fuso dos seus clientes.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>5 minutos</p></div>
<div class="card"><h3>🕐 Fuso</h3><p>Colado no do Brasil</p></div>
<div class="card"><h3>💰 Custo</h3><p>O menor da lista</p></div>
</div>
<p>Todo mundo sonha com Lisboa e Barcelona, mas o movimento mais esperto pra quem está <strong>começando</strong> costuma ser pro lado de cá do mapa: reuniões no mesmo horário dos clientes, passagem barata pra voltar quando precisar, e um custo de vida que deixa a renda remota render de verdade.</p>
<h2>🇲🇽 México — a capital nômade das Américas</h2>
<p>Cidade do México, Playa del Carmen e Tulum têm comunidades remotas gigantes. O caminho mais comum é a <strong>residência temporária</strong> com comprovação de renda, que pode durar até 4 anos. Infra boa, comida absurda e voos pra tudo que é lado.</p>
<h2>🇨🇴 Colômbia — o visto mais acessível</h2>
<p>O <strong>visto V de nômade digital</strong> colombiano pede uma das rendas mais baixas do mundo — na faixa de 3 salários mínimos locais (menos de US$ 1.000/mês, confirme o vigente) — e permite ficar até 2 anos. Medellín virou queridinha por clima, custo e cena de coworking.</p>
<h2>🇨🇷 Costa Rica — natureza em modo "pura vida"</h2>
<p>Visto de 1 ano renovável, renda em torno de <strong>US$ 3.000/mês</strong>, e o pacote inclui o que o país tem de melhor: praia, floresta, vulcão e uma cultura inteira desenhada pra desacelerar sem parar de produzir.</p>
<div class="highlight"><strong>A conta que ninguém faz:</strong> ficar 3 fusos perto dos seus clientes vale dinheiro. Reunião às 9h de lá é 9h daqui — na Europa seria começo de tarde, na Ásia seria madrugada. Pra quem vive de call e vendas, isso é produtividade pura.</div>
<p style="text-align:center"><a class="fonte" href="https://www.globalcitizensolutions.com/digital-nomad-visa/" target="_blank" rel="noopener">Comparar os vistos da região →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>A primeira experiência nômade não precisa ser um salto no escuro do outro lado do oceano. Começar perto reduz o risco, o custo e a saudade — e prepara pro voo maior.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p6$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 7) Novos entrantes: Itália e Indonésia ---------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'Os Novos Entrantes: Itália e a Indonésia Que Vai Além de Bali',
  'novos-vistos-italia-indonesia',
  'Os programas mais recentes do mapa nômade — e por que vale acompanhar quem está chegando agora no jogo.',
  $p7$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 7 de 8</span>
<h1>🆕 Itália e Indonésia: os Novos do Mapa</h1>
<p>O jogo dos vistos muda todo ano. Estes são os dois programas recentes que mais mexeram com a comunidade nômade.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>4 minutos</p></div>
<div class="card"><h3>🇮🇹 Itália</h3><p>Visto ativo desde 2024</p></div>
<div class="card"><h3>🇮🇩 Indonésia</h3><p>Remoto legalizado em Bali</p></div>
</div>
<p>Quando um país lança um visto novo, existe uma janela interessante: os requisitos ainda estão sendo lapidados, a demanda ainda não explodiu e as cidades ainda não precificaram a chegada dos remotos. Ficar de olho nos <strong>novos entrantes</strong> é estratégia, não curiosidade.</p>
<h2>🇮🇹 Itália: o clássico que finalmente chegou</h2>
<p>Depois de anos prometendo, a Itália ativou seu visto pra trabalhadores remotos <strong>altamente qualificados</strong>. Os pontos principais:</p>
<ul>
<li>Renda anual na casa dos <strong>€28 mil</strong> (confirme o valor vigente).</li>
<li>Exigência de qualificação ou experiência comprovada na área.</li>
<li>Seguro saúde, acomodação e antecedentes limpos.</li>
<li>Renovável — e a Itália tem regimes fiscais especiais pra quem se muda pro sul do país.</li>
</ul>
<p>Pra quem tem cidadania italiana em processo (metade do Brasil, praticamente), o visto pode ser a ponte pra já ir vivendo o país enquanto o reconhecimento anda.</p>
<h2>🇮🇩 Indonésia: Bali sem gambiarra</h2>
<p>Bali sempre foi a capital espiritual dos nômades — mas quase todo mundo ficava lá em visto de turista, na base do improviso. Isso mudou: a Indonésia criou um <strong>visto próprio pra trabalhador remoto</strong> (o KITAS remoto, de 1 ano) e o programa <strong>Second Home</strong> pra estadias longas de quem tem mais patrimônio.</p>
<div class="highlight"><strong>Por que isso importa:</strong> a legalização transforma Bali de "escala de mochileiro" em base de verdade — contrato de aluguel anual, comunidade estável e a ilha inteira operando em modo coworking, com custo asiático.</div>
<p style="text-align:center"><a class="fonte" href="https://immigrantinvest.com/reports/digital-nomad-visa-index-2026/" target="_blank" rel="noopener">Ver o índice 2026 dos vistos →</a></p>
<div class="cta">
<h2>🚀 O recado</h2>
<p>O mapa nômade não é estático — todo ano abre porta nova. Quem acompanha os lançamentos escolhe destino com informação de hoje, não com o hype de três anos atrás.</p>
</div>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p7$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- 8) Impostos e dupla tributação -----------------------------
insert into public.posts (title, slug, excerpt, content, category, content_format, published)
values (
  'O Lado Que Ninguém Fala: Impostos, Saída Fiscal e Dupla Tributação',
  'impostos-do-nomade-digital',
  'Morar fora não te livra da Receita automaticamente. O guia honesto do assunto mais evitado da vida nômade.',
  $p8$<style>
.post{max-width:860px;margin:0 auto;line-height:1.85;color:#c2ddcc;font-size:1.02rem}
.post *{margin:0;padding:0;box-sizing:border-box}
.post .hero{position:relative;overflow:hidden;background:linear-gradient(150deg,#163832,#0B2B26 55%,#051F20);border:1px solid #235347;border-radius:18px;text-align:center;padding:54px 26px 48px;margin-bottom:26px}
.post .hero::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,#DAF1DE,transparent)}
.post .tag{display:inline-block;margin-bottom:14px;padding:6px 14px;border:1px solid rgba(245,201,123,.4);border-radius:999px;color:#F5C97B;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}
.post .hero h1{color:#DAF1DE;font-size:2.2rem;line-height:1.2;letter-spacing:-.02em;margin-bottom:14px}
.post .hero p{color:#9dc2ab;max-width:640px;margin:0 auto}
.post .info{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.post .card{flex:1;min-width:150px;background:#163832;border:1px solid #235347;border-radius:14px;padding:16px 12px;text-align:center}
.post .card h3{color:#F5C97B;font-size:.74rem;text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
.post .card p{color:#c2ddcc;font-size:.95rem}
.post h2{color:#DAF1DE;font-size:1.4rem;margin:36px 0 6px}
.post h2::after{content:"";display:block;width:52px;height:2px;margin-top:9px;border-radius:2px;background:linear-gradient(90deg,#F5C97B,transparent)}
.post p{margin:15px 0}
.post strong{color:#DAF1DE}
.post .highlight{background:#163832;border-left:4px solid #F5C97B;border-radius:10px;padding:17px 20px;margin:24px 0;color:#d6ecdc}
.post ul{list-style:none;margin:16px 0 22px}
.post li{position:relative;padding-left:26px;margin-bottom:10px}
.post li::before{content:"✔";position:absolute;left:0;color:#F5C97B}
.post .fonte{display:inline-block;margin:8px 0 0;background:linear-gradient(100deg,#F5C97B,#DAF1DE);color:#051F20;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none}
.post .aviso{margin-top:22px;font-size:.85rem;color:#8fae9a;background:#0B2B26;border:1px dashed #235347;border-radius:10px;padding:12px 16px}
.post .cta{position:relative;overflow:hidden;background:#031514;border:1px solid #235347;border-radius:16px;padding:32px 26px;margin-top:40px;text-align:center}
.post .cta::before{content:"";position:absolute;top:0;left:18%;right:18%;height:1px;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta h2{margin:0 0 12px}
.post .cta h2::after{margin:9px auto 0;background:linear-gradient(90deg,transparent,#F5C97B,transparent)}
.post .cta p{margin:0;color:#c2ddcc}
.post .fim{display:flex;align-items:center;gap:14px;margin-top:36px;color:#5C8574;font-size:.85rem}
.post .fim::before,.post .fim::after{content:"";flex:1;height:1px;background:#235347}
@media(max-width:768px){.post .hero h1{font-size:1.6rem}.post .info{flex-direction:column}}
</style>
<div class="post">
<header class="hero">
<span class="tag">Série Nômades Digitais · 8 de 8</span>
<h1>🧾 Impostos: a Parte Adulta da Aventura</h1>
<p>Comprar a passagem é fácil. Sair do radar da Receita do jeito certo — sem virar problema depois — é onde a jornada fica séria.</p>
</header>
<div class="info">
<div class="card"><h3>⏱ Leitura</h3><p>6 minutos</p></div>
<div class="card"><h3>⚖️ Tema</h3><p>Residência fiscal</p></div>
<div class="card"><h3>🎯 Nível</h3><p>Quem vai de verdade</p></div>
</div>
<p>Aqui vai a verdade que os vídeos de "vida dos sonhos em Bali" não contam: <strong>mudar de país não muda automaticamente onde você paga imposto</strong>. Quem embarca sem entender isso costuma descobrir da pior forma — com pendência acumulada no Brasil ou cobrança dupla.</p>
<h2>Residência fiscal ≠ endereço</h2>
<p>Você pode estar fisicamente em Dubai, na Colômbia ou em Lisboa e, mesmo assim, continuar sendo <strong>residente fiscal no Brasil</strong> — obrigado a declarar e recolher sobre a renda mundial. A Receita não olha onde está o seu corpo; olha o seu status fiscal.</p>
<h2>A Saída Definitiva: o botão que quase ninguém aperta</h2>
<p>Pra deixar de ser residente fiscal brasileiro do jeito certo, existem dois passos formais: a <strong>Comunicação de Saída Definitiva</strong> e a <strong>Declaração de Saída Definitiva</strong>. Sem eles, você segue no sistema como residente — não importa há quantos anos viva fora.</p>
<div class="highlight"><strong>O erro clássico:</strong> "fui embora e simplesmente parei de declarar". Isso não te tira do sistema — te deixa irregular nele. Anos depois, na hora de trazer patrimônio de volta ou regularizar qualquer coisa, a conta aparece com juros.</div>
<h2>Do outro lado: quando o novo país começa a te cobrar</h2>
<ul>
<li>Na maioria dos países, ficar mais de <strong>183 dias no ano</strong> te torna residente fiscal local — com direito de tributar sua renda global.</li>
<li>Alguns vistos de nômade dão isenção ou regime especial nos primeiros anos; outros não dão nada. Isso muda TUDO na escolha do destino.</li>
<li>O Brasil tem <strong>acordos contra dupla tributação</strong> com dezenas de países (Portugal e Espanha incluídos) — eles evitam pagar duas vezes sobre a mesma renda, mas só protegem quem se organiza.</li>
</ul>
<h2>O plano mínimo de quem faz certo</h2>
<ul>
<li>Decidir <strong>antes de embarcar</strong> se a mudança é de verdade (saída fiscal) ou temporada (mantém residência e declara normal).</li>
<li>Mapear as regras de residência fiscal do país de destino ANTES de completar 183 dias lá.</li>
<li>Estruturar como a renda entra: PJ no Brasil, empresa fora, ou contrato direto — cada formato tem um efeito fiscal diferente.</li>
<li>Ter um <strong>contador especializado em internacional</strong>. Não é gasto; é o seguro da operação inteira.</li>
</ul>
<p style="text-align:center"><a class="fonte" href="https://www.taxesforexpats.com/articles/immigration/digital-nomad-visa-countries.html" target="_blank" rel="noopener">Aprofundar no tema (em inglês) →</a></p>
<div class="cta">
<h2>🚀 O recado final da série</h2>
<p>Liberdade geográfica de verdade se constrói com papelada em dia. O nômade que dura não é o que foge dos impostos — é o que os resolve antes de fazer a mala. GO FAR, mas vá certo.</p>
</div>
<p class="aviso">⚠️ Este post é conteúdo educativo e não substitui aconselhamento fiscal ou jurídico. Antes de qualquer decisão, fale com um contador especializado em tributação internacional.</p>
<div class="fim">GO FAR · Kauã Artx</div>
</div>$p8$,
  'Nômades Digitais', 'html', true
)
on conflict (slug) do nothing;

-- Confere o resultado: deve listar os 8 slugs novos
select slug, title, published from public.posts order by created_at desc;
