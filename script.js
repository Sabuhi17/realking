"use strict";
/* ============================================================
   SOCIAL SECURITY KINGDOM — istifadəçi interfeysi
   Ekranlar, düymələr, nəticə paneli, LocalStorage
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const SAVE = "ssk_save_v1", RES = "ssk_results_v1";
  const ST = Object.fromEntries(STATS.map(s => [s.id, s]));
  const DN = { 1: "Asan", 2: "Orta", 3: "Çətin" };
  let S = null, rep = null, pickC = null, ok3d = false, cinema = null;
  const seedParam = Number(new URLSearchParams(location.search).get("seed"));

  /* ---------- köməkçilər ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sgn = n => (n > 0 ? "+" : "") + (Math.round(n * 10) / 10);
  const good = (k, d) => ST[k].inv ? d < 0 : d > 0;
  function show(id) { $$(".screen").forEach(e => e.classList.toggle("active", e.id === id)); window.scrollTo(0, 0); }
  function vis(m) { if (ok3d) Scene3D.setMode(m); else $("#bg").className = "m-" + m; }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { } }
  function loadSave() { try { const v = JSON.parse(localStorage.getItem(SAVE)); return v && v.v === 1 ? v : null; } catch (e) { return null; } }
  function results() { try { return JSON.parse(localStorage.getItem(RES)) || []; } catch (e) { return []; } }
  function addResult(r) { try { const a = results(); a.unshift(r); localStorage.setItem(RES, JSON.stringify(a.slice(0, 30))); } catch (e) { } }
  function openModal(html, actions) {
    $("#modal-body").innerHTML = html;
    const a = $("#modal-actions"); a.innerHTML = "";
    actions.forEach(x => { const b = document.createElement("button"); b.className = "btn" + (x.p ? " primary" : ""); b.textContent = x.t; b.onclick = x.f; a.appendChild(b); });
    $("#modal").classList.remove("hidden");
  }
  const closeModal = () => $("#modal").classList.add("hidden");
  const fxList = fx => Object.keys(fx).map(k => `<li class="${good(k, fx[k]) ? "up" : "dn"}"><span>${ST[k].n}</span><b>${sgn(fx[k])}</b></li>`).join("");

  /* ---------- xəritə (proseduraldır) ---------- */
  function mapSVG(C) {
    let h = 7; for (const ch of C.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const r = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
    const n = 16, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * 6.283, R = 52 + r() * 26; pts.push([100 + Math.cos(a) * R * 1.3, 80 + Math.sin(a) * R * .85]); }
    const cap = [100 + (r() - .5) * 40, 80 + (r() - .5) * 30];
    const lines = [0, 1, 2].map(() => { const p = pts[Math.floor(r() * n)]; return `<line x1="${cap[0]}" y1="${cap[1]}" x2="${p[0]}" y2="${p[1]}" class="mr"/>`; }).join("");
    return `<svg viewBox="0 0 200 160" class="map" role="img" aria-label="${C.name} xəritəsi"><polygon points="${pts.map(p => p.join(",")).join(" ")}" class="mp"/>${lines}<circle cx="${cap[0]}" cy="${cap[1]}" r="4" class="mc"/><text x="${cap[0] + 7}" y="${cap[1] + 4}" class="mt">${C.capital}</text></svg>`;
  }

  /* ---------- BAŞLANĞIC ---------- */
  function refreshTitle() { $("#btn-continue").disabled = !loadSave(); }
  function renderCountries() {
    $("#country-list").innerHTML = COUNTRIES.map(c => `<button class="ccard" data-c="${c.id}"><b>${c.name}</b><small>${c.tag}</small></button>`).join("");
    $$(".ccard").forEach(b => b.onclick = () => {
      pickC = COUNTRIES.find(c => c.id === b.dataset.c);
      $$(".ccard").forEach(x => x.classList.toggle("sel", x === b));
      $("#btn-start").disabled = false;
      const C = pickC;
      $("#country-detail").innerHTML = `${mapSVG(C)}<h3>${C.name}</h3>
        <dl class="meta"><dt>Paytaxt</dt><dd>${C.capital}</dd><dt>Əhali</dt><dd>${C.pop}</dd><dt>İqtisadi vəziyyət</dt><dd>${C.econ}</dd>
        <dt>Sosial müdafiə</dt><dd>${C.sys}</dd><dt>Siyasi sabitlik</dt><dd>${C.pol}</dd></dl>
        <p><b>Əsas sosial problemlər</b></p><ul>${C.prob.map(p => `<li>${p}</li>`).join("")}</ul>
        <p class="muted">Gizli risklər oyun irəlilədikcə üzə çıxacaq.</p>`;
    });
  }
  function startGame() {
    const d = Number(($("input[name=diff]:checked") || {}).value) || 2;
    const seed = seedParam || (Math.random() * 2147483647 | 0);
    S = Engine.newGame(pickC.id, d, seed);
    $("#hud").innerHTML = ""; save(); show("s-game"); beginTurn(true);
  }
  function resumeGame() {
    S = loadSave(); if (!S) return;
    pickC = Engine.CO(S); $("#hud").innerHTML = ""; show("s-game");
    if (S.cur) renderTurn(); else beginTurn(true);
  }

  /* ---------- HUD ---------- */
  function renderHud(old) {
    const hud = $("#hud");
    if (!hud.children.length) hud.innerHTML = STATS.map(s => `<div class="st" id="st-${s.id}"><div class="st-l"><span>${s.n}</span><b></b></div><div class="bar"><i></i></div></div>`).join("");
    STATS.forEach(s => {
      const el = $("#st-" + s.id), v = S.st[s.id];
      const approx = S.diff === 3 && s.id !== "budg" && s.id !== "appr";
      const shown = approx ? Math.round(v / 5) * 5 : Math.round(v);
      el.querySelector("b").textContent = (approx ? "≈" : "") + shown;
      el.querySelector("i").style.width = shown + "%";
      const g = s.inv ? 100 - shown : shown;
      el.className = "st " + (g < 30 ? "bad" : g < 55 ? "mid" : "ok");
      if (old && Math.round(old[s.id]) !== Math.round(v)) {
        const d = Math.round(v) - Math.round(old[s.id]), c = document.createElement("em");
        c.className = "dl " + (good(s.id, d) ? "up" : "dn"); c.textContent = sgn(d); el.appendChild(c); setTimeout(() => c.remove(), 2600);
      }
    });
    const b = Math.round(S.st.budg);
    $("#budget-fill").style.width = b + "%"; $("#budget-val").textContent = b;
    $("#budget-fill").className = b < 25 ? "bad" : b < 45 ? "mid" : "ok";
    if (ok3d) Scene3D.setMood(S.st);
  }

  /* ---------- NÖVBƏ ---------- */
  function beginTurn(first) {
    const old = { ...S.st };
    const r = Engine.startTurn(S);
    save();
    renderHud(first ? null : old);
    if (r.ending) { finish(); return; }
    renderTurn();
  }
  function effectHint(o) {
    if (S.diff === 3) return "";
    const ks = Object.keys(o.fx).sort((a, b) => Math.abs(o.fx[b]) - Math.abs(o.fx[a])).slice(0, S.diff === 1 ? 4 : 2);
    return `<small class="hint">${ks.map(k => `<span class="${good(k, o.fx[k]) ? "up" : "dn"}">${o.fx[k] > 0 ? "↑" : "↓"}${S.diff === 1 && Math.abs(o.fx[k]) >= 8 ? (o.fx[k] > 0 ? "↑" : "↓") : ""} ${ST[k].n}</span>`).join("")}</small>`;
  }
  function renderTurn() {
    const sc = Engine.SC(S.cur.id);
    vis(sc.scene);
    $("#top-country").textContent = Engine.CO(S).name;
    $("#top-turn").textContent = "Növbə " + Math.min(S.turn, S.max) + " / " + S.max;
    $("#top-diff").textContent = DN[S.diff];
    $("#notes").innerHTML = S.cur.notes.map(n => `<div class="note ${n.k}">${esc(n.t)}${n.fx && Object.keys(n.fx).length ? `<ul class="fx">${fxList(n.fx)}</ul>` : ""}</div>`).join("");
    $("#evt-title").textContent = sc.t;
    $("#evt-desc").textContent = sc.d;
    $("#evt-cause").textContent = sc.cause;
    $("#evt-groups").textContent = sc.groups.join(", ");
    const weak = STATS.filter(s => s.id !== "tens").map(s => [s.n, S.st[s.id]]).sort((a, b) => a[1] - b[1]).slice(0, 2).map(x => x[0]);
    const ten = S.st.tens > 60 ? " Gərginlik yüksəkdir." : "";
    $("#evt-state").textContent = "Ən zəif sahələr: " + weak.join(", ") + "." + ten;
    $("#evt-prob").textContent = sc.prob;
    $("#advisors").innerHTML = S.cur.adv.map(a => `<div class="adv"><div><b>${a.n}</b><em>Etibar: ${S.rel[a.id]}%</em></div><p>«${Engine.L[a.pick]}» variantını məsləhət görürəm. ${a.why}</p></div>`).join("");
    $("#options").innerHTML = sc.o.map((o, i) => `<button class="opt" data-i="${i}"><span class="lt">${Engine.L[i]}</span><span class="ot">${esc(o.t)}${effectHint(o)}</span></button>`).join("");
    $$(".opt").forEach(b => b.onclick = () => choose(Number(b.dataset.i)));
    $("#card").scrollTop = 0;
  }
  function choose(i) {
    $$(".opt").forEach(b => b.disabled = true);
    const old = { ...S.st };
    rep = Engine.applyChoice(S, i);
    save(); renderHud(old); showResult();
  }

  /* ---------- NƏTİCƏ PANELİ ---------- */
  function showResult() {
    const r = rep, hint = S.diff === 3 ? "Bəzi gecikmiş risklər mümkündür, lakin mənbəyi dəqiq məlum deyil." : null;
    const dl = hint ? `<p>${hint}</p>` : r.dl.length ? "<ul>" + (S.diff === 1 ? r.dl : r.dl.slice(0, 1)).map(d => `<li>${d.t} növbə sonra: ${esc(d.m)}</li>`).join("") + "</ul>" : "<p>Əhəmiyyətli gecikmiş risk görünmür.</p>";
    openModal(`<h3>Kralın qərarı</h3><p class="big">${Engine.L[r.oi]}. ${esc(r.o.t)}</p>
      <h4>Dərhal nəticə</h4><ul class="fx">${fxList(r.got) || "<li>Dəyişiklik yoxdur</li>"}</ul>
      ${r.notes.length ? `<p class="note risk">${r.notes.map(esc).join(" ")}</p>` : ""}
      <h4>Gecikmiş risk</h4>${dl}
      <h4>Xalqın reaksiyası</h4><p>${r.rx.map(esc).join(" ")}</p>
      <h4>Analitik izah</h4><p>${esc(r.expl)}</p>`,
      [{ t: "Nəticələri qəbul et", p: 1, f: () => { closeModal(); beginTurn(); } },
       { t: "Ölkənin vəziyyətinə bax", f: showStatus },
       { t: "Qərar tarixçəsinə bax", f: showHistory }]);
  }
  function showStatus() {
    const rows = STATS.map(s => { const v = Math.round(S.st[s.id]), v0 = Math.round(S.st0[s.id]), d = v - v0; return `<li><span>${s.n}</span><b>${v}</b><i class="${d === 0 ? "" : good(s.id, d) ? "up" : "dn"}">${d ? sgn(d) : "—"}</i></li>`; }).join("");
    const adv = ADVISORS.map(a => `<li><span>${a.n}</span><b>${S.rel[a.id]}%</b></li>`).join("");
    openModal(`<h3>Ölkənin vəziyyəti</h3><ul class="fx stat-list">${rows}</ul><h4>Məsləhətçilərin etibarlılığı</h4><ul class="fx">${adv}</ul>`,
      [{ t: "Geri", p: 1, f: () => rep ? showResult() : closeModal() }]);
  }
  function showHistory() {
    const h = S.hist.slice().reverse().map(x => `<li class="${x.sc > 0 ? "up" : "dn"}"><span>${x.t}. ${esc(x.tt)} — ${x.l}. ${esc(x.ot)}</span><b>${sgn(Math.round(x.sc))}</b></li>`).join("");
    openModal(`<h3>Qərar tarixçəsi</h3><ul class="fx hist">${h || "<li>Hələ qərar yoxdur.</li>"}</ul>`,
      [{ t: "Geri", p: 1, f: () => rep ? showResult() : closeModal() }]);
  }
  function showMenu() {
    openModal("<h3>Menyu</h3><p>Oyun hər qərardan sonra avtomatik yadda saxlanılır.</p>", [
      { t: "Davam et", p: 1, f: closeModal },
      { t: "Ölkənin vəziyyəti", f: () => { rep = null; showStatus(); } },
      { t: "Qərar tarixçəsi", f: () => { rep = null; showHistory(); } },
      { t: "Saxla və çıx", f: () => { save(); closeModal(); refreshTitle(); vis("title"); show("s-title"); } }]);
  }

  /* ---------- SON ---------- */
  function finish() {
    const E = ENDINGS[S.ended], rp = Engine.report(S);
    addResult({ d: new Date().toLocaleDateString("az-AZ"), c: rp.country, e: E.t, ty: E.type, n: rp.turns, i: rp.index, df: DN[S.diff] });
    try { localStorage.removeItem(SAVE); } catch (e) { }
    const done = () => { cinema = null; $("#skip").classList.add("hidden"); $("#app").classList.remove("cinema"); renderResult(rp); show("s-result"); vis(E.scene === "fall" ? "throne" : E.scene); };
    if (E.type === "bad") {
      $("#app").classList.add("cinema"); $("#skip").classList.remove("hidden"); vis("fall");
      cinema = setTimeout(done, 6500); $("#skip").onclick = () => { clearTimeout(cinema); done(); };
    } else done();
  }
  function renderResult(rp) {
    const s = S.st, E = rp.E;
    const grid = STATS.map(x => { const v = Math.round(s[x.id]), d = v - Math.round(S.st0[x.id]); return `<li><span>${x.n}</span><b>${v}</b><i class="${d === 0 ? "" : good(x.id, d) ? "up" : "dn"}">${d ? sgn(d) : "—"}</i></li>`; }).join("");
    const rec = x => x ? `${x.t}. ${esc(x.tt)} — ${x.l}. ${esc(x.ot)}` : "—";
    $("#result-box").innerHTML = `<p class="sub ${E.type}">${E.type === "bad" ? "Taxtdan salınma" : "Hakimiyyət qorundu"}</p><h2>${E.t}</h2><p class="lead">${E.x}</p>
      <h4>${E.type === "bad" ? "Hakimiyyətin itirilmə səbəbləri" : "Hakimiyyətdə qalma səbəbləri"}</h4><ul>${rp.reasons.map(x => `<li>${esc(x)}</li>`).join("") || "<li>Bir neçə səbəbin birləşməsi.</li>"}</ul>
      <dl class="meta"><dt>Seçilmiş ölkə</dt><dd>${rp.country} (${DN[S.diff]})</dd><dt>Hakimiyyətdə qalınan növbə</dt><dd>${rp.turns} / ${S.max}</dd>
        <dt>Qəbul edilən qərarlar</dt><dd>${rp.made}, uğurlu: ${rp.good}</dd><dt>Ən böyük böhran</dt><dd>${rec(rp.crisis)}</dd>
        <dt>Ən yaxşı qərar</dt><dd>${rec(rp.best)}</dd><dt>Ən riskli qərar</dt><dd>${rec(rp.worst)}</dd>
        <dt>Sosial təhlükəsizliyin yekun indeksi</dt><dd><b>${rp.index} / 100</b></dd>
        <dt>Ən çox zərər görən qruplar</dt><dd>${rp.harm.join(", ") || "Əhəmiyyətli zərər qeydə alınmayıb"}</dd></dl>
      <h4>Yekun göstəricilər (başlanğıca nisbətən)</h4><ul class="fx stat-list">${grid}</ul>
      <h4>Sosial təhlükəsizlik üzrə analitik qiymətləndirmə</h4><ul>${rp.analysis.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <div class="row"><button class="btn primary" id="r-again">Yenidən oyna</button><button class="btn" id="r-other">Başqa ölkə seç</button><button class="btn" id="r-menu">Əsas menyu</button></div>`;
    $("#r-again").onclick = () => { S = Engine.newGame(S.cid, S.diff, seedParam || (Math.random() * 2147483647 | 0)); pickC = Engine.CO(S); $("#hud").innerHTML = ""; save(); show("s-game"); beginTurn(true); };
    $("#r-other").onclick = openCountry;
    $("#r-menu").onclick = () => { refreshTitle(); vis("title"); show("s-title"); };
  }
  function openCountry() { pickC = null; $("#btn-start").disabled = true; $$(".ccard").forEach(x => x.classList.remove("sel")); $("#country-detail").innerHTML = '<p class="muted">Ətraflı məlumat üçün krallıq seçin.</p>'; vis("map"); show("s-country"); }
  function renderHistoryScreen() {
    const a = results();
    $("#hist-list").innerHTML = a.length ? a.map(r => `<div class="hrow ${r.ty}"><b>${esc(r.e)}</b><span>${esc(r.c)} · ${esc(r.df)} · ${r.n} növbə · indeks ${r.i}</span><small>${esc(r.d)}</small></div>`).join("") : '<p class="muted">Hələ tamamlanmış oyun yoxdur.</p>';
  }

  /* ---------- BAŞLATMA ---------- */
  function boot() {
    ok3d = typeof THREE !== "undefined" && Scene3D.init($("#bg"));
    if (!ok3d) { document.body.classList.add("no3d"); $("#bg").className = "m-title"; }
    renderCountries(); refreshTitle();
    $("#btn-new").onclick = openCountry;
    $("#btn-continue").onclick = resumeGame;
    $("#btn-rules").onclick = () => show("s-rules");
    $("#btn-history").onclick = () => { renderHistoryScreen(); show("s-history"); };
    $("#btn-clear").onclick = () => { try { localStorage.removeItem(RES); } catch (e) { } renderHistoryScreen(); };
    $("#btn-start").onclick = () => { if (pickC) startGame(); };
    $("#btn-menu").onclick = showMenu;
    $("#btn-hud").onclick = () => $("#hud").classList.toggle("open");
    $$("[data-go]").forEach(b => b.onclick = () => { vis(b.dataset.go === "s-title" ? "title" : "map"); show(b.dataset.go); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#modal").classList.contains("hidden") && !rep) closeModal(); });
  }
  boot();
})();
