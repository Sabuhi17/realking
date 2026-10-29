"use strict";
/* ============================================================
   SOCIAL SECURITY KINGDOM — oyun mühərriki
   Vəziyyət, növbələr, qərarların tətbiqi, gecikmiş nəticələr,
   hakimiyyət böhranı yoxlaması və sonluqlar.
   Təsadüflik seed ilə idarə olunur (mulberry32): eyni seed = eyni gediş.
   ============================================================ */
const Engine = (() => {
  const INVS = { tens: 1 };
  const clamp = v => Math.max(0, Math.min(100, v));
  const DM = { 1: .85, 2: 1, 3: 1.2 };            // çətinliyə görə mənfi təsirlərin gücü
  const SC = id => SCENARIOS.find(s => s.id === id);
  const CO = S => COUNTRIES.find(c => c.id === S.cid);
  const L = ["A", "B", "C", "D"];

  function rnd(S) {                                // seed-li random
    const a = S.rs = (S.rs + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function ctx(S) {
    return {
      st: S.st, turn: S.turn, cid: S.cid,
      f: (n, w) => !!S.fl[n] && (w == null || S.turn - S.fl[n].t <= w),
      n: n => S.fl[n] ? S.fl[n].n : 0
    };
  }
  const isBad = (k, d) => INVS[k] ? d > 0 : d < 0;
  const val = fx => { let v = 0; for (const k in fx) v += (INVS[k] ? -fx[k] : fx[k]) * (k === "budg" ? 1.2 : 1); return v; };
  const sw = (fx, w) => { let v = 0; for (const k in w) v += (fx[k] || 0) * w[k]; return v; };
  const secIdx = s => Math.round((s.prot + s.heal + s.equa + s.empl + s.educ + s.safe + (100 - s.tens) + s.stab + s.envi + s.appr) / 10);

  /* Təsirin tətbiqi: ölkə həssaslığı və çətinlik əmsalı, 0–100 hüdudu */
  function applyFx(S, fx, raw) {
    const C = CO(S), out = {};
    for (const k in fx) {
      let d = fx[k];
      if (!raw) {
        if (isBad(k, d)) d *= (C.amp[k] || 1) * DM[S.diff];
        else if (S.diff === 3) d *= .9;
      }
      d = Math.round(d); if (!d) continue;
      const old = S.st[k]; S.st[k] = clamp(old + d);
      const real = Math.round((S.st[k] - old) * 10) / 10; if (real) out[k] = real;
    }
    return out;
  }

  function newGame(cid, diff, seed) {
    const C = COUNTRIES.find(c => c.id === cid);
    return {
      v: 1, cid, diff, seed, rs: seed | 0, turn: 0, max: 20, st: { ...C.st }, st0: { ...C.st },
      fl: {}, hist: [], pend: [], used: {}, cd: {}, rel: { fin: 60, soc: 60, sec: 60, peo: 60 },
      c: { lowA: 0, lowE: 0, lowB: 0, lowM: 0, lowL: 0 }, cur: null, rev: [], harm: {}, ended: null
    };
  }

  /* Hər növbədə passiv səbəb-nəticə dinamikası */
  function tick(S) {
    const s = S.st, d = {};
    d.budg = (s.econ - 50) * .05 - (s.prot - 50) * .03 + (s.empl - 50) * .02 - (s.envi < 40 ? 1.5 : 0) - (s.heal < 40 ? 1 : 0);
    d.econ = (s.educ - 50) * .04 + (s.empl - 50) * .03 + (s.stab - 50) * .02 - (s.envi < 35 ? 1 : 0) - (s.safe < 35 ? 1 : 0);
    d.appr = (s.empl - 50) * .04 + (s.prot - 50) * .02 + (s.safe - 50) * .02 - (s.tens - 50) * .03 - (s.budg < 20 ? 1.5 : 0);
    d.tens = (50 - s.equa) * .05 + (50 - s.appr) * .05 + (50 - s.empl) * .03 + (s.safe < 40 ? 1 : 0) - (s.stab - 50) * .02;
    d.stab = (s.legi - 50) * .03 - (s.tens - 50) * .05 + (s.safe - 50) * .02;
    d.heal = (s.envi - 50) * .04 + (s.prot - 50) * .02 - (s.budg < 15 ? 1.5 : 0);
    d.prot = s.budg < 15 ? -2.5 : s.budg < 30 ? -1 : 0;
    d.legi = (s.appr - 50) * .05 + (s.stab - 50) * .02;
    d.elit = (s.econ - 50) * .03 + (s.budg - 50) * .03 - (s.tens > 65 ? 1 : 0);
    d.empl = (s.econ - 50) * .04 + (s.educ - 50) * .02;
    d.safe = (s.equa - 50) * .02 + (s.empl - 50) * .02;
    d.envi = -.4; d.educ = s.budg < 25 ? -1 : 0; d.equa = (s.prot - 50) * .02 - (s.tens > 65 ? .5 : 0);
    const n = S.diff === 1 ? .5 : S.diff === 2 ? 1 : 1.6;
    for (const k in d) s[k] = clamp(s[k] + d[k] + (rnd(S) - .5) * n);
  }

  function addScore(S, h, got) {
    const e = S.hist[h]; if (!e) return;
    e.sc += val(got);
    for (const k in got) e.late[k] = (e.late[k] || 0) + got[k];
  }

  function collapse(S) {
    const s = S.st, c = S.c;
    c.lowA = s.appr < 30 ? c.lowA + 1 : 0;
    c.lowE = s.elit < 30 ? c.lowE + 1 : 0;
    c.lowB = (s.budg <= 10 && s.econ <= 38) ? c.lowB + 1 : 0;
    c.lowL = s.legi < 25 ? c.lowL + 1 : 0;
    const mis = [s.equa < 30, s.empl < 35, s.tens > 70, s.prot < 30, s.heal < 30, s.safe < 30].filter(Boolean).length;
    c.lowM = mis >= 4 ? c.lowM + 1 : 0;
    if (S.turn < 4) return null;                    // ilk növbələrdə kral qorunur
    if (c.lowB >= 2 || s.econ <= 6 || (s.budg <= 2 && s.econ <= 30)) return "C";
    if (s.tens >= 92) return "A";
    if (s.tens >= 65) {                             // üsyan ehtimalı: məntiqli, lakin avtomatik deyil
      const r = Math.min(1, Math.max(0, (s.tens - 55) / 40 * .4 + (50 - s.appr) / 50 * .2 + (45 - s.stab) / 45 * .15 + (50 - s.elit) / 50 * .1 + (S.fl.repress && S.turn - S.fl.repress.t < 6 ? .1 : 0)));
      if (rnd(S) < r * r * 1.1) return "A";
    }
    if (s.elit <= 8 || (s.elit <= 20 && c.lowE >= 2)) return "B";
    if (mis >= 5 || c.lowM >= 2) return "D";
    if (s.legi <= 8 || (s.legi <= 20 && c.lowL >= 3)) return "E";
    return null;
  }

  function finalEnd(S) {
    const s = S.st, idx = secIdx(s);
    const mn = Math.min(s.appr, s.stab, s.econ, s.budg, s.prot, s.heal, s.empl, s.educ, s.equa, s.safe, s.envi, s.legi, s.elit, 100 - s.tens);
    if (idx >= 58 && mn >= 30 && s.prot >= 50 && s.budg >= 33) return "F";
    if (s.prot >= 48 && s.budg >= 30 && s.stab >= 48 && idx >= 50) return "H";
    return "G";
  }

  function pick(S) {
    const c = ctx(S), ws = SCENARIOS.map(sc => {
      let w = sc.w(c);
      if (S.turn < sc.min) w = 0;
      const u = S.used[sc.id];
      if (u && S.turn - u < 5) w = 0;
      return Math.max(0, w);
    });
    let tot = ws.reduce((a, b) => a + b, 0);
    if (tot <= 0) { ws.fill(1); tot = ws.length; }
    let r = rnd(S) * tot;
    for (let i = 0; i < ws.length; i++) { r -= ws[i]; if (r <= 0) return SCENARIOS[i]; }
    return SCENARIOS[SCENARIOS.length - 1];
  }

  /* Məsləhətçilər: hər biri öz prioritetlərinə görə variant tövsiyə edir */
  function advise(S, sc) {
    return ADVISORS.map(a => {
      const bias = S.diff === 3 && rnd(S) < .5 - S.rel[a.id] / 220;
      const lw = S.diff === 1 ? .9 : S.diff === 2 ? .6 : (bias ? 0 : .4);
      let best = -1e9, pickI = 0;
      sc.o.forEach((o, i) => {
        let v = sw(o.fx, a.w);
        o.dl.forEach(d => v += lw * sw(d.fx, a.w));
        v += (rnd(S) - .5) * (S.diff - 1) * 1.5;
        if (v > best) { best = v; pickI = i; }
      });
      return { id: a.id, n: a.n, why: a.why, pick: pickI, bias };
    });
  }

  function startTurn(S) {
    S.turn++;
    const notes = [];
    if (S.turn > 1) {
      const keep = [];
      for (const p of S.pend) {
        if (p.due > S.turn) { keep.push(p); continue; }
        const sc = SC(p.sc), d = sc.o[p.oi].dl[p.di];
        if (d.c && !d.c(ctx(S))) continue;
        const got = applyFx(S, d.fx);
        addScore(S, p.h, got);
        notes.push({ k: val(got) >= 0 ? "good" : "bad", t: "Gecikmiş nəticə (" + sc.t + "): " + d.m, fx: got });
      }
      S.pend = keep;
      tick(S);
      const C = CO(S);
      C.hidden.forEach((h, i) => {                 // gizli risklər tədricən üzə çıxır
        if (S.rev.includes(i) || S.turn < h.at) return;
        if (S.turn >= h.at + 3 || rnd(S) < .5) {
          S.rev.push(i);
          const got = applyFx(S, h.fx);
          if (h.fl) setFlag(S, h.fl);
          notes.push({ k: "hidden", t: "Gizli risk üzə çıxdı — " + h.t + ". " + h.x, fx: got });
        }
      });
      const c = ctx(S);
      CHAINS.forEach(ch => {                       // hadisələr arası zəncirvari təsirlər
        if (S.cd[ch.id] && S.turn - S.cd[ch.id] < ch.cd) return;
        if (!ch.c(c)) return;
        S.cd[ch.id] = S.turn;
        const got = applyFx(S, ch.fx);
        notes.push({ k: val(got) >= 0 ? "good" : "risk", t: ch.m, fx: got });
      });
      const e = collapse(S);
      if (e) { S.ended = e; S.cur = null; return { ending: e, notes }; }
    }
    if (S.turn > S.max) { S.ended = finalEnd(S); S.cur = null; return { ending: S.ended, notes }; }
    const sc = pick(S);
    S.used[sc.id] = S.turn;
    S.cur = { id: sc.id, adv: advise(S, sc), notes };
    return { cur: S.cur, notes };
  }

  function setFlag(S, n) { const f = S.fl[n] || { n: 0, t: 0 }; f.n++; f.t = S.turn; S.fl[n] = f; }

  function applyChoice(S, oi) {
    const sc = SC(S.cur.id), o = sc.o[oi], c = ctx(S), notes = [];
    const fx = { ...o.fx };
    if (S.st.budg < 25 && (fx.budg || 0) < -4) { fx.stab = (fx.stab || 0) - 2; fx.legi = (fx.legi || 0) - 2; notes.push("Büdcə imkanı çox məhduddur: qərarın icrası çətinləşdi."); }
    if (S.st.tens > 70 && fx.appr > 0) { fx.appr = Math.round(fx.appr * .6); notes.push("Yüksək gərginlik fonunda qərar xalqda gözlənilən qədər dəstək tapmadı."); }
    if (S.st.legi < 30 && fx.tens < 0) { fx.tens = Math.round(fx.tens * .6); notes.push("Legitimlik zəif olduğundan insanlar atılan addımlara az inanır."); }
    if (o.fl.includes("spend") && c.n("spend") >= 2 && S.st.budg < 45) { fx.budg = (fx.budg || 0) - 4; fx.econ = (fx.econ || 0) - 2; notes.push("Ardıcıl xərclər borc yükünü artırdı."); }
    const got = applyFx(S, fx);
    o.fl.forEach(f => setFlag(S, f));
    const h = S.hist.length;
    S.hist.push({ t: S.turn, id: sc.id, tt: sc.t, oi, l: L[oi], ot: o.t, fx: got, sc: val(got), late: {} });
    o.dl.forEach((d, di) => S.pend.push({ due: S.turn + d.t, sc: sc.id, oi, di, h }));
    const score = val(got);
    S.cur.adv.forEach(a => {                        // məsləhətçilərin etibarlılığı
      let r = S.rel[a.id];
      if (a.pick === oi) r += score > 0 ? 4 : -5; else if (score < -4) r += 2;
      S.rel[a.id] = Math.max(10, Math.min(95, r));
    });
    if (score < 0) sc.groups.forEach((g, i) => { S.harm[g] = (S.harm[g] || 0) - score * (i === 0 ? 1 : .5); });
    // Xalqın reaksiyası
    const rx = [];
    rx.push(sc.groups[0] + (score >= 0 ? " qərarı dəstəkləyir." : " narazılığını bildirir."));
    if ((got.budg || 0) <= -6) rx.push("Maliyyəçilər büdcənin gələcək vəziyyətindən narahatdırlar.");
    if ((got.tens || 0) >= 4) rx.push("Şəhərdə gərginlik hiss olunur.");
    if ((got.legi || 0) <= -5) rx.push("Saray ətrafında kralın səlahiyyətinə şübhələr artır.");
    if ((got.elit || 0) <= -4) rx.push("Elita bu addımdan razı deyil.");
    if ((got.appr || 0) >= 5) rx.push("Küçələrdə qərar rəğbətlə qarşılanır.");
    const dl = o.dl.map(d => ({ t: d.t, m: d.m }));
    S.cur = null;
    return { sc, o, oi, got, notes, score, rx, dl, expl: o.x };
  }

  function analysis(S) {
    const s = S.st, a = [];
    if (s.prot >= 60) a.push("Sosial müdafiə sistemi geniş əhatəyə malikdir və həssas qrupları qoruyur."); else if (s.prot < 40) a.push("Sosial müdafiənin əhatəliliyi zəifdir; həssas qruplar risk altındadır.");
    if (s.budg >= 50) a.push("Maliyyə dayanıqlığı qorunub, sosial proqramların davamlılığı üçün imkan var."); else if (s.budg < 30) a.push("Büdcə zəifdir; sosial proqramların uzunmüddətli maliyyələşməsi sual altındadır.");
    if (s.equa < 35) a.push("Gəlir bərabərsizliyi yüksəkdir; bu, qütbləşmə və narazılıq riskini artırır.");
    if (s.empl >= 60 && s.educ >= 60) a.push("Məşğulluq və təhsil sahəsindəki güclü vəziyyət uzunmüddətli sabitliyin əsasıdır.");
    if (s.envi < 35 || s.heal < 40) a.push("Ekoloji və sağlamlıq problemləri gələcək xərcləri və sosial narazılığı artıra bilər.");
    if (s.tens > 60) a.push("İctimai gərginlik yüksək qalır; sosial dialoq və ədalətli bölgü vacibdir.");
    if ((S.fl.cut ? S.fl.cut.n : 0) >= 2) a.push("Təkrarlanan xərc kəsintiləri qısamüddətli büdcə qazandırdı, lakin sosial xərcləri artırdı.");
    if ((S.fl.spend ? S.fl.spend.n : 0) >= 3) a.push("Ardıcıl böyük xərclər xalqın razılığını artırdı, lakin maliyyə dayanıqlığına təzyiq yaratdı.");
    if (!a.length) a.push("Göstəricilər balanslıdır: heç bir sahə nə həddindən artıq güclü, nə də kritik zəifdir.");
    return a;
  }

  function report(S) {
    const C = CO(S), h = S.hist, s = S.st;
    const byScore = h.slice().sort((a, b) => b.sc - a.sc);
    const crisis = h.slice().sort((a, b) => a.sc - b.sc)[0];
    const harm = Object.entries(S.harm).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    const E = ENDINGS[S.ended];
    const reasons = [];
    if (S.ended === "A" || S.ended === "B" || S.ended === "E") {
      if (s.tens > 60) reasons.push("İctimai gərginlik " + Math.round(s.tens) + " səviyyəsinə çatdı.");
      if (s.appr < 35) reasons.push("Xalqın razılığı çox aşağıdır (" + Math.round(s.appr) + ").");
      if (s.elit < 35) reasons.push("Siyasi elita kralı artıq dəstəkləmir (" + Math.round(s.elit) + ").");
      if (s.legi < 35) reasons.push("Legitimlik zəifləyib (" + Math.round(s.legi) + ").");
    }
    if (S.ended === "C" || S.ended === "D") {
      if (s.budg < 25) reasons.push("Dövlət büdcəsi tükənib (" + Math.round(s.budg) + ").");
      if (s.econ < 35) reasons.push("İqtisadiyyat zəifdir (" + Math.round(s.econ) + ").");
      if (s.empl < 35) reasons.push("Məşğulluq çox aşağıdır (" + Math.round(s.empl) + ").");
      if (s.equa < 30) reasons.push("Gəlir bərabərliyi çökməyə yaxındır (" + Math.round(s.equa) + ").");
    }
    if (E.type !== "bad") {
      if (s.prot >= 48) reasons.push("Sosial müdafiə qorunub (" + Math.round(s.prot) + ").");
      if (s.budg >= 30) reasons.push("Büdcə dayanıqlığı saxlanıb (" + Math.round(s.budg) + ").");
      if (s.stab >= 48) reasons.push("Sosial sabitlik qorunub (" + Math.round(s.stab) + ").");
      if (!reasons.length) reasons.push("Taxt qorunub, lakin bir neçə sahə zəif qalıb.");
    }
    S.hist.forEach(x => { x.ok = x.sc > 0; });
    return {
      country: C.name, turns: Math.min(S.turn, S.max), made: h.length, good: h.filter(x => x.sc > 0).length,
      crisis: crisis && crisis.sc < 0 ? crisis : null, best: byScore[0], worst: byScore[byScore.length - 1],
      index: secIdx(s), harm, E, reasons, analysis: analysis(S), ending: S.ended
    };
  }

  return { newGame, startTurn, applyChoice, report, val, secIdx, SC, CO, L };
})();
if (typeof module !== "undefined") module.exports = Engine;
