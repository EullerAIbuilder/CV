/* ==========================================================
   Currículo – Euller Augusto | Interações
   ========================================================== */

(function () {
  "use strict";

  const raiz = document.documentElement;

  /* ---------- Tema claro/escuro ---------- */
  function lerTema() {
    try { return localStorage.getItem("tema"); } catch (e) { return null; }
  }

  function salvarTema(tema) {
    try { localStorage.setItem("tema", tema); } catch (e) { /* sem armazenamento */ }
  }

  const temaSalvo = lerTema();
  if (temaSalvo) raiz.setAttribute("data-theme", temaSalvo);

  const iconeSol = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const iconeLua = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  // Escuro quando escolhido no botão ou, sem escolha, quando o sistema está no modo escuro
  function temaEscuro() {
    const tema = raiz.getAttribute("data-theme");
    if (tema) return tema === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function atualizarIconeTema(botao) {
    const escuro = temaEscuro();
    botao.innerHTML = escuro ? iconeSol : iconeLua;
    botao.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const botaoTema = document.querySelector("[data-tema]");
    if (botaoTema) {
      atualizarIconeTema(botaoTema);
      botaoTema.addEventListener("click", function () {
        const novo = temaEscuro() ? "light" : "dark";
        raiz.setAttribute("data-theme", novo);
        salvarTema(novo);
        atualizarIconeTema(botaoTema);
      });
    }

    /* ---------- Menu mobile ---------- */
    const menuBotao = document.querySelector(".menu-toggle");
    const menuLinks = document.querySelector(".nav__links");
    if (menuBotao && menuLinks) {
      menuBotao.addEventListener("click", function () {
        const aberto = menuLinks.classList.toggle("aberto");
        menuBotao.setAttribute("aria-expanded", aberto);
      });
    }

    /* ---------- Link ativo no menu ---------- */
    const marcaPagina = document.querySelector("[data-pagina]");
    const paginaAtual = (marcaPagina && marcaPagina.getAttribute("data-pagina")) || location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__links a").forEach(function (link) {
      if (link.getAttribute("href") === paginaAtual) link.classList.add("ativo");
    });

    /* ---------- Transição entre páginas ---------- */
    document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const destino = link.getAttribute("href");
        if (e.ctrlKey || e.metaKey || e.shiftKey || link.target === "_blank") return;
        e.preventDefault();
        document.body.classList.add("saindo");
        setTimeout(function () { location.href = destino; }, 320);
      });
    });

    // Ao voltar pelo histórico do navegador, a página pode vir do cache com a classe "saindo"
    window.addEventListener("pageshow", function () {
      document.body.classList.remove("saindo");
    });

    /* ---------- Rolagem: progresso, navegação e botão de topo ---------- */
    const progresso = document.querySelector(".progresso");
    const nav = document.querySelector(".nav");
    const botaoTopo = document.querySelector(".topo");

    function aoRolar() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      if (progresso) progresso.style.width = pct + "%";
      if (nav) nav.classList.toggle("rolando", window.scrollY > 10);
      if (botaoTopo) botaoTopo.classList.toggle("visivel", window.scrollY > 500);
      preencherLinhaTempo();
    }

    window.addEventListener("scroll", aoRolar, { passive: true });

    if (botaoTopo) {
      botaoTopo.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* ---------- Revelar elementos ao rolar ---------- */
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        if (entrada.target.hasAttribute("data-contar")) contar(entrada.target);
        if (entrada.target.hasAttribute("data-pct")) animarAnel(entrada.target);
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(".revelar, [data-contar], [data-pct]").forEach(function (el) {
      observador.observe(el);
    });

    /* ---------- Contadores ---------- */
    function contar(el) {
      const alvo = parseInt(el.getAttribute("data-contar"), 10);
      const sufixo = el.getAttribute("data-sufixo") || "";
      const duracao = 1600;
      const inicio = performance.now();

      function passo(agora) {
        const t = Math.min((agora - inicio) / duracao, 1);
        const suave = 1 - Math.pow(1 - t, 3);
        el.innerHTML = Math.round(alvo * suave) + (sufixo ? "<small>" + sufixo + "</small>" : "");
        if (t < 1) requestAnimationFrame(passo);
      }

      requestAnimationFrame(passo);
    }

    /* ---------- Anéis de carga horária ---------- */
    function animarAnel(el) {
      const alvo = parseFloat(el.getAttribute("data-pct"));
      const inicio = performance.now();

      function passo(agora) {
        const t = Math.min((agora - inicio) / 1200, 1);
        el.style.setProperty("--pct", (alvo * (1 - Math.pow(1 - t, 3))) + "%");
        if (t < 1) requestAnimationFrame(passo);
      }

      requestAnimationFrame(passo);
    }

    /* ---------- Efeito de digitação ---------- */
    const digitando = document.querySelector("[data-frases]");
    if (digitando) {
      const frases = digitando.getAttribute("data-frases").split("|");
      let indiceFrase = 0;
      let indiceLetra = 0;
      let apagando = false;

      (function digitar() {
        const frase = frases[indiceFrase];
        indiceLetra += apagando ? -1 : 1;
        digitando.textContent = frase.slice(0, indiceLetra);

        let espera = apagando ? 40 : 85;
        if (!apagando && indiceLetra === frase.length) {
          espera = 1800;
          apagando = true;
        } else if (apagando && indiceLetra === 0) {
          apagando = false;
          indiceFrase = (indiceFrase + 1) % frases.length;
          espera = 400;
        }
        setTimeout(digitar, espera);
      })();
    }

    /* ---------- Linha do tempo: abrir detalhes ---------- */
    document.querySelectorAll(".evento .card").forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");

      function alternar() {
        const evento = card.closest(".evento");
        const aberto = evento.classList.toggle("aberto");
        card.setAttribute("aria-expanded", aberto);
      }

      card.addEventListener("click", alternar);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); }
      });
    });

    /* ---------- Linha do tempo: preenchimento conforme rolagem ---------- */
    const linhaTempo = document.querySelector(".linha-tempo");
    const preenchimento = document.querySelector(".linha-tempo__preenchimento");

    function preencherLinhaTempo() {
      if (!linhaTempo || !preenchimento) return;
      const ret = linhaTempo.getBoundingClientRect();
      const visivel = window.innerHeight * 0.7 - ret.top;
      const pct = Math.max(0, Math.min(visivel / ret.height, 1));
      preenchimento.style.height = (pct * 100) + "%";
    }

    /* ---------- Filtros da linha do tempo ---------- */
    document.querySelectorAll(".filtro").forEach(function (botao) {
      botao.addEventListener("click", function () {
        const categoria = botao.getAttribute("data-filtro");
        document.querySelectorAll(".filtro").forEach(function (b) { b.classList.remove("ativo"); });
        botao.classList.add("ativo");

        document.querySelectorAll(".evento").forEach(function (evento) {
          const mostrar = categoria === "todos" || evento.getAttribute("data-categoria") === categoria;
          evento.classList.toggle("oculto", !mostrar);
        });

        reorganizarLados();
        preencherLinhaTempo();
      });
    });

    // Alterna os eventos visíveis entre esquerda e direita
    function reorganizarLados() {
      let i = 0;
      document.querySelectorAll(".evento:not(.oculto)").forEach(function (evento) {
        evento.classList.toggle("direita", i % 2 === 1);
        i++;
      });
    }

    reorganizarLados();

    /* ---------- Cartões que viram (toque no celular) ---------- */
    document.querySelectorAll(".flip").forEach(function (cartao) {
      cartao.setAttribute("tabindex", "0");
      cartao.addEventListener("click", function () { cartao.classList.toggle("virado"); });
      cartao.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cartao.classList.toggle("virado"); }
      });
    });

    /* ---------- Copiar contato ---------- */
    const toast = document.querySelector(".toast");
    let temporizadorToast;

    function mostrarToast(mensagem) {
      if (!toast) return;
      toast.textContent = mensagem;
      toast.classList.add("visivel");
      clearTimeout(temporizadorToast);
      temporizadorToast = setTimeout(function () { toast.classList.remove("visivel"); }, 2400);
    }

    document.querySelectorAll("[data-copiar]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        const texto = botao.getAttribute("data-copiar");
        const rotulo = botao.getAttribute("data-rotulo") || "Texto";

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(texto)
            .then(function () { mostrarToast(rotulo + " copiado!"); })
            .catch(function () { copiarAlternativo(texto, rotulo); });
        } else {
          copiarAlternativo(texto, rotulo);
        }
      });
    });

    // Alternativa para quando a página é aberta direto do arquivo (file://)
    function copiarAlternativo(texto, rotulo) {
      const campo = document.createElement("textarea");
      campo.value = texto;
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      document.body.appendChild(campo);
      campo.select();
      try {
        document.execCommand("copy");
        mostrarToast(rotulo + " copiado!");
      } catch (e) {
        mostrarToast(texto);
      }
      document.body.removeChild(campo);
    }

    /* ---------- Inclinação 3D das fotos ao passar o mouse ---------- */
    if (window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) {
      document.querySelectorAll("[data-inclinar]").forEach(function (foto) {
        foto.addEventListener("mousemove", function (e) {
          const ret = foto.getBoundingClientRect();
          const x = (e.clientX - ret.left) / ret.width - 0.5;
          const y = (e.clientY - ret.top) / ret.height - 0.5;
          foto.style.transition = "transform 0.15s ease-out";
          foto.style.transform = "perspective(900px) rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg)";
        });
        foto.addEventListener("mouseleave", function () {
          foto.style.transition = "transform 0.5s ease";
          foto.style.transform = "";
        });
      });
    }

    /* ---------- Imprimir / salvar em PDF ---------- */
    document.querySelectorAll("[data-imprimir]").forEach(function (botao) {
      botao.addEventListener("click", function () { window.print(); });
    });

    aoRolar();
  });
})();
