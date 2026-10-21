/**
 * script.js — content.js の内容からページを組み立てる（通常は編集不要）
 */
(function () {
  "use strict";

  const FOLD_LINES = 14; // これより行数が多いプロンプトは折りたたむ

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const list = (items, cls) => (items && items.length ? `<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "");
  const ext = (url, text, cls) => `<a class="btn ${cls || ""}" href="${esc(url)}" target="_blank" rel="noopener">${text}</a>`;
  const textLink = (url, text) => `<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener">${text}</a>`;
  const paras = (arr) => (arr || []).map((p) => `<p>${p}</p>`).join("");
  const linkLines = (links) => (links && links.length ? `<p class="source">${links.map((l) => textLink(l.url, l.text + " ↗")).join("<br>")}</p>` : "");

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.setAttribute("content", value);
  }

  function applyMeta(m) {
    document.title = m.pageTitle;
    setMeta('meta[name="description"]', m.description);
    setMeta('meta[property="og:title"]', m.pageTitle);
    setMeta('meta[property="og:description"]', m.description);
    setMeta('meta[property="og:url"]', m.siteUrl);
  }

  // プロンプト本文を安全にHTML化し、書き換える場所（【 】・（ここに…））を目立たせる
  function highlightSlots(text) {
    return esc(text)
      .replace(/【[^】\n]*】/g, '<span class="slot-label">$&</span>')
      .replace(/（ここに[^）\n]*）/g, '<span class="slot">$&</span>');
  }

  function hero(h) {
    return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container">
        <p class="hero__brand">${h.brand}</p>
        <h1 class="hero__title" id="hero-title">${h.titleLines.map((l) => `<span>${l}</span>`).join("")}</h1>
        <p class="hero__sub">${h.subtitle}</p>
        <div class="hero__lead">${paras(h.lead)}</div>
        <a class="btn btn--ghost" href="#${esc(h.buttonTarget)}" data-scroll>${h.buttonText}</a>
      </div>
    </section>`;
  }

  function topCta(c, url) {
    const image = `<a class="cta-soft__image" href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(c.image.src)}" alt="${esc(c.image.alt)}" width="1855" height="848"></a>`;
    return `
    <section class="container top-cta" aria-labelledby="top-cta-title">
      <div class="cta-soft">
        ${image}
        <div class="cta-soft__text">
          <h2 class="cta-soft__title" id="top-cta-title">${c.heading}</h2>
          <p>${c.text}</p>
          <ul class="cta-soft__list">${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        </div>
        ${ext(url, c.buttonText)}
      </div>
    </section>`;
  }

  function overview(o) {
    const items = o.steps.map((s) => `<li><span class="route__tool">${s.tool}</span>${s.text}</li>`).join("");
    return `
    <section class="section section--soft" aria-labelledby="overview-title">
      <div class="container">
        <h2 class="heading" id="overview-title">${o.heading}</h2>
        <p>${o.lead}</p>
        <ol class="route">${items}</ol>
        ${list(o.notes, "check-list")}
      </div>
    </section>`;
  }

  function toc(t) {
    return `
    <nav class="section" aria-labelledby="toc-title">
      <div class="container">
        <h2 class="heading" id="toc-title">${t.heading}</h2>
        <ol class="toc">${t.items.map((i) => `<li><a href="#${esc(i.id)}" data-scroll>${i.label}</a></li>`).join("")}</ol>
      </div>
    </nav>`;
  }

  function promptBlock(b, id) {
    const long = b.text.split("\n").length > FOLD_LINES;
    const pre = `<pre class="prompt__text" id="${id}">${highlightSlots(b.text)}</pre>`;
    const body = long
      ? `<details class="prompt__fold"><summary>プロンプトの中身を見る</summary>${pre}</details>`
      : pre;
    return `
    <div class="prompt">
      <p class="prompt__label">${b.label}</p>
      <p class="prompt__hint">色がついた <span class="slot-label">【 】</span> と <span class="slot">（ここに入力）</span> を、自分の内容に書き換えて使います。</p>
      ${body}
      <button type="button" class="btn btn--primary copy-btn" data-copy-target="${id}">
        <span class="copy-btn__label">プロンプトをコピーする</span>
        <span class="copy-btn__done" role="status" aria-live="polite">コピーしました</span>
      </button>
    </div>`;
  }

  function settingsBlock(b) {
    const items = b.items
      .map(
        (it) => `
      <article class="setting">
        <p class="setting__state">${it.state}</p>
        <h4 class="setting__name">${it.name}</h4>
        <p>${it.text}</p>
        <p class="setting__link">${textLink(it.url, "公式ヘルプで確認 ↗")}</p>
      </article>`
      )
      .join("");
    return `<div><h3 class="sub-heading">${b.heading}</h3><p>${b.lead}</p><div class="settings">${items}</div><p class="source">${b.note}</p></div>`;
  }

  function feeBlock(b) {
    const rows = b.rows.map((r, i) => `<tr${i === b.rows.length - 1 ? ' class="fee__total"' : ""}><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join("");
    return `
    <div class="fee">
      <h3 class="sub-heading">${b.heading}</h3>
      <p>${b.lead}</p>
      <table class="fee__table"><tbody>${rows}</tbody></table>
      ${list(b.notes, "point-box__list")}
      ${linkLines(b.links)}
    </div>`;
  }

  function block(b, id) {
    switch (b.type) {
      case "text":
        return `<div><h3 class="sub-heading">${b.heading}</h3>${paras(b.paragraphs)}${list(b.list, "bullet-list")}</div>`;
      case "compare":
        return `<div><h3 class="sub-heading">${b.heading}</h3><div class="compare">${b.cols.map((c) => `<div class="compare__col"><p class="compare__label">${c.label}</p><p>${c.text}</p></div>`).join("")}</div></div>`;
      case "ordered": {
        const btn = (b.buttons || []).map((x) => ext(x.url, x.text, "btn--outline")).join("");
        const note = b.note ? `<p class="source">${b.note}</p>` : "";
        return `<div><h3 class="sub-heading">${b.heading}</h3><ol class="num-list">${b.items.map((i) => `<li>${i}</li>`).join("")}</ol>${note}${btn ? `<p class="btn-row">${btn}</p>` : ""}</div>`;
      }
      case "point":
        return `<aside class="point-box"><p class="point-box__label">${b.label}</p><p>${b.text}</p>${linkLines(b.links)}</aside>`;
      case "caution":
        return `<aside class="point-box point-box--caution"><p class="point-box__label">${b.label}</p>${b.text ? `<p>${b.text}</p>` : ""}${list(b.list, "point-box__list")}</aside>`;
      case "emphasis":
        return `<p class="emphasis">${b.text}</p>`;
      case "harm":
        return `<div><h3 class="sub-heading">${b.heading}</h3><ul class="harm">${b.items.map((i) => `<li><span class="harm__key">${i.key}</span><span class="harm__name">${i.name}</span>${i.text}</li>`).join("")}</ul><p class="source">${b.note}</p></div>`;
      case "example":
        return `<div class="example"><h3 class="sub-heading">${b.heading}</h3><dl>${b.rows.map((r) => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join("")}</dl></div>`;
      case "prompt":
        return promptBlock(b, id);
      case "settings":
        return settingsBlock(b);
      case "fee":
        return feeBlock(b);
      default:
        return "";
    }
  }

  const nextBox = (text) => (text ? `<aside class="next"><p class="next__label">次にやること</p><p>${text}</p></aside>` : "");

  // 通常セクション（はじめに・準備編・実践編）
  function section(s, soft) {
    const body = s.blocks.map((b, i) => block(b, `${s.id}-b${i}`)).join("");
    const src = s.source ? linkLines([s.source]) : "";
    return `
    <section class="section${soft ? " section--soft" : ""}" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="container">
        <h2 class="heading" id="${s.id}-title">${s.heading}</h2>
        ${s.lead ? `<p>${s.lead}</p>` : ""}
        <div class="stack">${body}${src}${nextBox(s.next)}</div>
      </div>
    </section>`;
  }

  function step(s) {
    const body = s.blocks.map((b, i) => block(b, `${s.id}-b${i}`)).join("");
    return `
    <section class="step" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="container">
        <article class="step-card">
          <header class="step__head">
            <p class="step__no" aria-hidden="true"><span>STEP</span>${s.number}</p>
            <div>
              <p class="step__badge"><span class="badge badge--basic">${s.tool}</span></p>
              <h2 class="step__title" id="${s.id}-title"><span class="visually-hidden">STEP ${s.number}　</span>${s.title}</h2>
              <p class="step__lead">${s.lead}</p>
            </div>
          </header>
          <div class="step__body">${body}${nextBox(s.next)}</div>
        </article>
      </div>
    </section>`;
  }

  function checklist(c) {
    const items = c.items.map((t) => `<li><label class="check"><input type="checkbox" data-check><span>${t}</span></label></li>`).join("");
    return `
    <section class="section" id="${c.id}" aria-labelledby="${c.id}-title">
      <div class="container">
        <h2 class="heading" id="${c.id}-title">${c.heading}</h2>
        <p>${c.lead}</p>
        <ul class="checklist">${items}</ul>
        <p class="checklist__done" id="checklist-done" role="status" aria-live="polite" hidden>${c.doneText}</p>
      </div>
    </section>`;
  }

  function finalCta(c, t, url) {
    return `
    <section class="section section--soft" id="line" aria-labelledby="final-cta-title">
      <div class="container">
        <div class="cta-final">
          <h2 class="cta-final__title" id="final-cta-title">${c.heading}</h2>
          ${paras(c.paragraphs)}
          ${ext(url, c.buttonText, "btn--large")}
        </div>
        <div class="textbook">
          <p>${t.bridge}</p>
          <a class="textbook__banner" href="${esc(url)}" target="_blank" rel="noopener">
            <img src="${esc(t.banner)}" alt="${esc(t.bannerAlt)}" loading="lazy">
          </a>
          <p>${t.support}</p>
        </div>
      </div>
    </section>`;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => false);
    }
    return Promise.resolve(false);
  }

  function onCopy(btn) {
    const target = document.getElementById(btn.dataset.copyTarget);
    copyText(target.textContent).then((ok) => {
      if (!ok) return;
      btn.classList.add("is-copied");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => btn.classList.remove("is-copied"), 2200);
    });
  }

  function onScroll(e, link) {
    const dest = document.querySelector(link.getAttribute("href"));
    if (!dest) return;
    e.preventDefault();
    dest.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function updateChecklist() {
    const boxes = document.querySelectorAll("[data-check]");
    const done = document.getElementById("checklist-done");
    if (done) done.hidden = !(boxes.length && [...boxes].every((b) => b.checked));
  }

  function bind() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-btn[data-copy-target]");
      if (btn) return onCopy(btn);
      const link = e.target.closest("a[data-scroll]");
      if (link) onScroll(e, link);
    });
    document.addEventListener("change", (e) => {
      if (e.target.matches("[data-check]")) updateChecklist();
    });
  }

  function init() {
    const main = document.getElementById("main");
    if (typeof CONTENT === "undefined") return;
    const c = CONTENT;
    applyMeta(c.meta);
    main.innerHTML =
      hero(c.hero) +
      topCta(c.topCta, c.lineUrl) +
      overview(c.overview) +
      toc(c.toc) +
      section(c.intro, true) +
      section(c.prepare, false) +
      `<div class="basic-zone">${c.steps.map(step).join("")}</div>` +
      section(c.sell, true) +
      checklist(Object.assign({ id: "check" }, c.check)) +
      finalCta(c.finalCta, c.textbook, c.lineUrl);
    document.getElementById("footer").innerHTML = `<p>${c.footer.copyright}</p><p>${c.footer.notice}</p>`;
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
