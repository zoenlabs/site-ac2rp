/* ==========================================================================
   AC2RP — Interações da landing page
   - Reveal on scroll (IntersectionObserver)
   - Nav com fundo ao rolar + menu mobile
   - Ano dinâmico no rodapé + scroll suave com offset do header
   - Formulário de aplicação para a sessão estratégica
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Reveal on scroll ----------
     IntersectionObserver como mecanismo principal, com rede de segurança
     por scroll/load para garantir que nada fique invisível se o IO falhar
     ou atrasar em algum navegador. */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));

  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < revealEls.length; i++) {
      var el = revealEls[i];
      if (el.classList.contains("is-visible")) continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-visible");
    }
  }

  if (prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    }

    // Rede de segurança (funciona mesmo sem IO):
    revealInView();
    window.addEventListener("scroll", revealInView, { passive: true });
    window.addEventListener("load", revealInView);
    // último recurso: se nada foi revelado logo após o load, revela tudo
    setTimeout(function () {
      if (!document.querySelector(".reveal.is-visible")) {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      }
    }, 1200);
  }

  /* ---------- 2. Nav: fundo ao rolar ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 3. Menu mobile ---------- */
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("navMobile");

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    mobile.hidden = true;
  }
  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    mobile.hidden = false;
  }

  toggle.addEventListener("click", function () {
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu();
  });

  mobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- 6. Formulário de aplicação ----------
     O site é estático. Configure FORM_ENDPOINT com a URL de um serviço que
     receba POST JSON (ex.: Formspree, n8n, Make, Zapier, Google Apps Script).
     Sem endpoint, a aplicação é encaminhada pelo WhatsApp da AC2RP com o
     texto já preenchido (e um e-mail como alternativa). */
  var FORM_ENDPOINT = "";
  var WHATS_NUMBER = "5519995735894";
  var MAIL_TO = "contato@ac2rptecnologia.com.br";

  var form = document.getElementById("applyForm");
  var success = document.getElementById("applySuccess");
  var successText = document.getElementById("applySuccessText");
  var errorBox = document.getElementById("formError");
  var submitBtn = document.getElementById("applySubmit");
  var whatsLink = document.getElementById("applyWhats");
  var mailLink = document.getElementById("applyMail");

  function fieldValue(name) {
    var el = form.elements[name];
    if (!el) return "";
    if (el.length && el[0] && el[0].type === "radio") {
      for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value;
      return "";
    }
    return (el.value || "").trim();
  }

  function collect() {
    return {
      nome: fieldValue("nome"),
      email: fieldValue("email"),
      telefone: fieldValue("telefone"),
      empresa: fieldValue("empresa"),
      objetivo: fieldValue("objetivo"),
      papel: fieldValue("papel"),
      faturamento: fieldValue("faturamento"),
      impacto: fieldValue("impacto"),
      lgpd: !!(form.elements.lgpd && form.elements.lgpd.checked),
      origem: "ac2rptecnologia.com.br/#aplicacao",
      enviadoEm: new Date().toISOString()
    };
  }

  function validate() {
    var ok = true;
    form.classList.add("was-validated");

    // inputs de texto
    var inputs = form.querySelectorAll("input[required]:not([type=radio]):not([type=checkbox])");
    for (var i = 0; i < inputs.length; i++) if (!inputs[i].checkValidity()) ok = false;

    // grupos de rádio
    var groups = form.querySelectorAll(".field--group");
    for (var g = 0; g < groups.length; g++) {
      var checked = groups[g].querySelector("input[type=radio]:checked");
      groups[g].classList.toggle("is-invalid", !checked);
      if (!checked) ok = false;
    }

    // consentimento LGPD
    var consent = form.querySelector(".consent");
    var lgpd = form.elements.lgpd;
    var consentOk = !!(lgpd && lgpd.checked);
    if (consent) consent.classList.toggle("is-invalid", !consentOk);
    if (!consentOk) ok = false;

    if (errorBox) errorBox.hidden = ok;
    if (!ok) {
      var first = form.querySelector(".field input:invalid, .field--group.is-invalid, .consent.is-invalid");
      if (first && first.scrollIntoView) first.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    }
    return ok;
  }

  function buildMessage(d) {
    return [
      "Aplicação para a sessão estratégica (AC2RP)",
      "",
      "Nome: " + d.nome,
      "E-mail: " + d.email,
      "Telefone/WhatsApp: " + d.telefone,
      "Empresa: " + d.empresa,
      "",
      "O que quer fazer: " + d.objetivo,
      "Papel na empresa: " + d.papel,
      "Faturamento anual: " + d.faturamento,
      "Impacto na receita: " + d.impacto,
      "",
      "Autorizo o contato e o tratamento dos dados conforme a LGPD."
    ].join("\n");
  }

  function showSuccess(d, fallback) {
    form.hidden = true;
    success.hidden = false;
    if (fallback) {
      var msg = buildMessage(d);
      successText.textContent = "Sua aplicação está pronta. Envie pelo WhatsApp para garantirmos o seu horário, ou, se preferir, por e-mail.";
      whatsLink.href = "https://wa.me/" + WHATS_NUMBER + "?text=" + encodeURIComponent(msg);
      whatsLink.hidden = false;
      mailLink.href = "mailto:" + MAIL_TO + "?subject=" + encodeURIComponent("Aplicação para a sessão estratégica: " + d.empresa) + "&body=" + encodeURIComponent(msg);
      mailLink.hidden = false;
    }
    if (success.scrollIntoView) success.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // honeypot
      if (!validate()) return;

      var data = collect();

      if (!FORM_ENDPOINT) {
        // Sem backend: abre o WhatsApp já preenchido (gesto do usuário) e mostra alternativas
        var url = "https://wa.me/" + WHATS_NUMBER + "?text=" + encodeURIComponent(buildMessage(data));
        try { window.open(url, "_blank", "noopener"); } catch (err) {}
        showSuccess(data, true);
        return;
      }

      submitBtn.classList.add("is-loading");
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        showSuccess(data, false);
      }).catch(function () {
        // Falhou o envio: oferece WhatsApp/e-mail como plano B
        showSuccess(data, true);
      }).then(function () {
        submitBtn.classList.remove("is-loading");
      });
    });

    // limpa o estado de erro ao interagir
    form.addEventListener("input", function () {
      if (form.classList.contains("was-validated")) validate();
    });
  }

  /* ---------- 7. Ano dinâmico ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
