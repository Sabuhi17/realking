"use strict";
/* ============================================================
   SOCIAL SECURITY KINGDOM — 3D səhnələr (Three.js r128)
   Bütün modellər proseduraldır: xarici resurs yüklənmir.
   Three.js və ya WebGL işləməzsə init() false qaytarır
   və oyun 2D rejimə keçir.
   ============================================================ */
const Scene3D = (() => {
  let R, S, C, clk, ok = false, cfg, mode = "title", host;
  let world, room, doorL, doorR, king, people = [], guards = [], intruders = [], flags = [], clouds = [], smk = [];
  let sun, hemi, lamp, fac, hos, fallT = -1, t = 0, tp, tl, lk, bg, mood = { stab: 60, envi: 60, tens: 40 };
  const rand = (a, b) => a + Math.random() * (b - a);

  const M = {
    title:   { w: 1, c: [0, 15, 36], l: [0, 5, -2], o: 1, sky: 0xf0b98a, d: .9 },
    map:     { w: 1, c: [0, 52, 8], l: [0, 0, 0], sky: 0x9cc3e0, d: 1 },
    city:    { w: 1, c: [-16, 8, 22], l: [0, 3, 2], o: .5, sky: 0x8fc1e8, d: 1 },
    elder:   { w: 1, c: [10, 5, 20], l: [2, 2, 4], o: .3, sky: 0xe8c49a, d: .8 },
    school:  { w: 1, c: [-6, 6, 20], l: [-6, 2, 4], sky: 0x9fd0f0, d: 1 },
    housing: { w: 1, c: [14, 10, 18], l: [4, 2, 2], o: .4, sky: 0xa8c8e0, d: .9 },
    night:   { w: 1, c: [0, 6, 22], l: [0, 2, 4], sky: 0x10162b, d: .25 },
    square:  { w: 1, c: [0, 6, 20], l: [0, 2, 6], crowd: 1, sky: 0xb9b3a8, d: .7 },
    factory: { w: 1, c: [22, 8, 10], l: [12, 3, -5], smoke: 1, sky: 0xaab4bd, d: .8 },
    smoke:   { w: 1, c: [20, 9, 12], l: [12, 4, -5], smoke: 2, sky: 0x6d6a64, d: .55 },
    hospital:{ w: 1, c: [-20, 7, 10], l: [-12, 3, -5], sky: 0xb7d3e6, d: .9 },
    budget:  { w: 0, c: [0, 4.2, 7], l: [0, 3, -8], sky: 0x1a1410, d: 1 },
    throne:  { w: 0, c: [0, 4.2, 7], l: [0, 3, -8], sky: 0x1a1410, d: 1 },
    fall:    { w: 0, c: [0, 4, 6], l: [0, 3.2, -8], sky: 0x0d0a0a, d: 1, fall: 1 }
  };

  const mat = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .9, metalness: .05 }, o || {}));
  function box(w, h, d, c, x, y, z, p) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (p) p.add(m); return m;
  }
  function cyl(rt, rb, h, c, x, y, z, p, seg) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 10), mat(c));
    m.position.set(x, y, z); m.castShadow = true; if (p) p.add(m); return m;
  }
  function cone(r, h, c, x, y, z, p, seg, ry) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 10), mat(c));
    m.position.set(x, y, z); if (ry) m.rotation.y = ry; m.castShadow = true; if (p) p.add(m); return m;
  }
  function flag(p, x, y, z, col, s) {
    s = s || 1;
    const g = new THREE.Group(); g.position.set(x, y, z);
    cyl(.05, .05, 3 * s, 0x5a4a3a, 0, 1.5 * s, 0, g, 6);
    const geo = new THREE.PlaneGeometry(1.6 * s, 1 * s, 8, 3);
    const cl = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, roughness: .8 }));
    cl.position.set(.8 * s, 2.5 * s, 0); g.add(cl);
    flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), s });
    p.add(g);
  }
  function person(col, scale) {
    const g = new THREE.Group();
    cyl(.18, .24, .75, col, 0, .45, 0, g, 6);
    const h = new THREE.Mesh(new THREE.SphereGeometry(.16, 6, 6), mat(0xe0b98f)); h.position.y = 1.0; g.add(h);
    const sign = box(.7, .45, .05, 0xf0e6c8, 0, 1.55, 0, g); sign.visible = false;
    const stick = cyl(.02, .02, .8, 0x5a4a3a, 0, 1.1, 0, g, 4); stick.visible = false;
    g.scale.setScalar(scale || 1); g.userData = { sign, stick };
    return g;
  }

  function buildWorld() {
    world = new THREE.Group();
    const gr = new THREE.Mesh(new THREE.CircleGeometry(80, 40), mat(0x5d7a4a)); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; world.add(gr);
    const pl = new THREE.Mesh(new THREE.CircleGeometry(7, 32), mat(0x9a9486)); pl.rotation.x = -Math.PI / 2; pl.position.set(0, .03, 6); pl.receiveShadow = true; world.add(pl);
    // təpə və qala
    cyl(14, 22, 5, 0x6a7b52, 0, 2.5, -34, world, 14);
    const cg = new THREE.Group(); cg.position.set(0, 5, -34); world.add(cg);
    box(26, 5, 3, 0x9a9183, 0, 2.5, 4, cg); box(9, 10, 7, 0xa89f90, 0, 5, -2, cg); box(2.6, 3.4, .4, 0x2b2118, 0, 1.7, 4.3, cg);
    [[-13, 4], [13, 4], [-5, -2], [5, -2]].forEach(([x, z], i) => {
      const h = i < 2 ? 8 : 12; cyl(1.3, 1.5, h, 0xb3a999, x, h / 2, z, cg, 10); cone(1.9, 3.2, 0x8c2a2a, x, h + 1.6, z, cg, 10);
      flag(cg, x, h + 3, z, i % 2 ? 0x2f5d8a : 0xb8892e, .9);
    });
    // evlər
    const roofC = [0x8c3b2a, 0x6e4a32, 0x7a5a3a, 0x5a3a2e];
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * 6.283, r = rand(12, 44), x = Math.cos(a) * r, z = Math.sin(a) * r * .8 + 4;
      if (z < -18 || Math.hypot(x, z - 6) < 9 || Math.hypot(x - 14, z + 8) < 8 || Math.hypot(x + 14, z + 8) < 8) continue;
      const w = rand(1.6, 3), h = rand(1.4, 3.4), g = new THREE.Group(); g.position.set(x, 0, z);
      box(w, h, w, 0xcfc2a4, 0, h / 2, 0, g); cone(w * .85, 1.2, roofC[i % 4], 0, h + .6, 0, g, 4, Math.PI / 4); world.add(g);
    }
    // fabrik və xəstəxana
    fac = new THREE.Group(); fac.position.set(14, 0, -8); world.add(fac);
    box(9, 4, 6, 0x6b6b70, 0, 2, 0, fac); box(3, 6, 3, 0x56565b, -2, 3, 0, fac);
    cyl(.7, .9, 9, 0x4a4a4f, -3, 4.5, -1, fac, 8); cyl(.7, .9, 7.5, 0x4a4a4f, 1, 3.75, -1, fac, 8);
    hos = new THREE.Group(); hos.position.set(-14, 0, -8); world.add(hos);
    box(9, 5, 6, 0xe8eaec, 0, 2.5, 0, hos); box(1.8, .5, .1, 0xc0392b, 0, 4, 3.05, hos); box(.5, 1.8, .1, 0xc0392b, 0, 4, 3.05, hos);
    // tüstü
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshBasicMaterial({ color: 0x555552, transparent: true, opacity: 0 }));
      m.userData = { ph: Math.random() * 10, ch: i % 2 }; fac.add(m); smk.push(m);
    }
    // buludlar
    for (let i = 0; i < 7; i++) {
      const g = new THREE.Group();
      for (let j = 0; j < 4; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(rand(1.8, 3), 7, 7), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75 })); s.position.set(j * 2.2, rand(-.3, .3), rand(-.5, .5)); g.add(s); }
      g.position.set(rand(-60, 60), rand(18, 28), rand(-50, 10)); world.add(g); clouds.push(g);
    }
    // insanlar
    const n = innerWidth < 700 ? 24 : 44, cols = [0x8a4b3a, 0x3a5f8a, 0x6b7f4a, 0x8a7a3a, 0x7a3a6b, 0x4a4a4a];
    for (let i = 0; i < n; i++) {
      const g = person(cols[i % cols.length], rand(.9, 1.15)); g.position.set(rand(-20, 20), 0, rand(-6, 22)); world.add(g);
      people.push({ g, tx: null, tz: 0, sp: rand(.8, 1.6), ph: Math.random() * 6, crowd: i < n * .6 });
    }
    S.add(world);
  }

  function buildRoom() {
    room = new THREE.Group();
    box(18, .3, 28, 0x4a3f36, 0, -.15, -2, room);                         // döşəmə
    box(2.6, .05, 26, 0x7a1f26, 0, .02, -2, room);                        // xalça
    box(18, 12, .5, 0x6b5f52, 0, 6, -16, room);                           // arxa divar
    box(.5, 12, 28, 0x5f5448, -9, 6, -2, room); box(.5, 12, 28, 0x5f5448, 9, 6, -2, room);
    box(5, 12, .5, 0x5f5448, -6.5, 6, 10, room); box(5, 12, .5, 0x5f5448, 6.5, 6, 10, room);
    for (let z = -12; z <= 8; z += 5) [-6, 6].forEach(x => { cyl(.5, .6, 10, 0x8c8272, x, 5, z, room, 12); });
    box(5, .6, 4, 0x6b6054, 0, .3, -11, room); box(2, 1, 1.6, 0xb8892e, 0, 1.1, -11, room); box(2.2, 4, .4, 0xb8892e, 0, 2.6, -12.2, room);
    king = new THREE.Group(); king.position.set(0, 0, -11); room.add(king);
    box(.9, 1.4, .7, 0x8c2a2a, 0, 1.9, 0, king); const kh = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 8), mat(0xe0b98f)); kh.position.y = 2.9; king.add(kh);
    cone(.3, .35, 0xe5b94a, 0, 3.3, 0, king, 6);
    flag(room, -3.5, 3.5, -15.5, 0x8c2a2a, 1.3); flag(room, 3.5, 3.5, -15.5, 0x2f5d8a, 1.3);
    [-9, -5, -1, 3].forEach((z, i) => [-4.8, 4.8].forEach(x => {
      const g = person(0x39424e, 1.3); g.position.set(x, 0, z); cyl(.03, .03, 2.6, 0x9aa0a6, .45, 1.3, 0, g, 4); room.add(g); guards.push(g);
    }));
    for (let i = 0; i < 5; i++) { const g = person(0x1f1f24, 1.3); g.position.set(-2 + i, 0, 14); g.visible = false; room.add(g); intruders.push(g); }
    const mk = x => { const p = new THREE.Group(); p.position.set(x, 0, 10); const d = box(4, 9, .4, 0x4a321f, x < 0 ? 2 : -2, 4.5, 0, p); room.add(p); return p; };
    doorL = mk(-4); doorR = mk(4); doorL.visible = doorR.visible = false;
    lamp = new THREE.PointLight(0xffc680, 1.3, 40); lamp.position.set(0, 7, -5); room.add(lamp);
    S.add(room);
  }

  function init(el) {
    try {
      if (!window.THREE) return false;
      host = el;
      R = new THREE.WebGLRenderer({ antialias: innerWidth > 700, powerPreference: "low-power" });
      R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      R.setSize(innerWidth, innerHeight);
      if (innerWidth > 700) { R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; }
      host.appendChild(R.domElement);
      S = new THREE.Scene(); S.background = new THREE.Color(0x222222); S.fog = new THREE.Fog(0x222222, 40, 120);
      C = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 300);
      tp = new THREE.Vector3(0, 15, 36); tl = new THREE.Vector3(0, 5, -2); lk = new THREE.Vector3(0, 5, -2); C.position.copy(tp);
      hemi = new THREE.HemisphereLight(0xdfe9ff, 0x4a5a3a, .7); S.add(hemi);
      sun = new THREE.DirectionalLight(0xfff2d0, 1); sun.position.set(25, 35, 20);
      if (R.shadowMap.enabled) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.far = 120; }
      S.add(sun);
      buildWorld(); buildRoom();
      bg = new THREE.Color(0x222222); clk = new THREE.Clock();
      addEventListener("resize", () => { R.setSize(innerWidth, innerHeight); C.aspect = innerWidth / innerHeight; C.updateProjectionMatrix(); });
      ok = true; setMode("title"); loop();
      return true;
    } catch (e) { console.warn("3D işə düşmədi:", e); ok = false; return false; }
  }

  function setMode(m) {
    if (!ok) return;
    if (!M[m]) m = "city";
    const prev = cfg; mode = m; cfg = M[m];
    world.visible = !!cfg.w; room.visible = !cfg.w; sun.visible = !!cfg.w; hemi.intensity = cfg.w ? .7 : .25;
    people.forEach(p => { p.tx = null; });
    tp.set(...cfg.c); tl.set(...cfg.l);
    const inRoomFall = cfg.fall;
    doorL.visible = doorR.visible = !!inRoomFall; intruders.forEach(g => g.visible = !!inRoomFall);
    king.visible = true;
    if (inRoomFall) { fallT = 0; C.position.set(0, 3.5, 16); lk.set(0, 3, -4); } else fallT = -1;
    if (!cfg.w && prev && prev.w && !inRoomFall) { C.position.set(tp.x, tp.y, tp.z + 4); }
  }
  function setMood(st) { if (st) mood = { stab: st.stab, envi: st.envi, tens: st.tens }; }

  function loop() {
    requestAnimationFrame(loop);
    if (!ok || document.hidden) return;
    try { frame(); } catch (e) {
      console.error("3D xətası, 2D rejimə keçid:", e); ok = false;
      if (R && R.domElement) R.domElement.style.display = "none";
      document.body.classList.add("no3d");
      const b = document.getElementById("bg"); if (b) b.className = "m-" + mode;
    }
  }
  function frame() {
    const dt = Math.min(clk.getDelta(), .05); t += dt;
    // kamera
    const k = 1 - Math.pow(cfg.fall ? .45 : .06, dt);
    const ox = cfg.o ? Math.sin(t * .2) * cfg.o * 7 : 0;
    C.position.x += (tp.x + ox - C.position.x) * k; C.position.y += (tp.y - C.position.y) * k; C.position.z += (tp.z - C.position.z) * k;
    lk.lerp(tl, k); C.lookAt(lk);
    // rənglər
    const dim = .55 + .45 * (mood.stab / 100), want = new THREE.Color(cfg.sky).multiplyScalar(dim);
    if (cfg.w) want.lerp(new THREE.Color(0x77756f), (1 - mood.envi / 100) * .4);
    bg.lerp(want, k); S.background.copy(bg); S.fog.color.copy(bg); S.fog.near = cfg.w ? 40 : 30; S.fog.far = cfg.w ? 130 : 70;
    sun.intensity = (.35 + .9 * (mood.stab / 100)) * cfg.d;
    // bayraqlar
    flags.forEach(f => {
      const pos = f.geo.attributes.position;
      for (let i = 0; i < pos.count; i++) { const x = f.base[i * 3]; pos.setZ(i, Math.sin(x * 3 / f.s - t * 4) * .2 * f.s * ((x / f.s + .8) / 1.6)); }
      pos.needsUpdate = true;
    });
    if (cfg.w) {
      clouds.forEach(c => { c.position.x += dt * .8; if (c.position.x > 70) c.position.x = -70; });
      // insanlar
      const crowd = !!cfg.crowd;
      people.forEach(p => {
        const g = p.g, cm = crowd && p.crowd;
        g.userData.sign.visible = g.userData.stick.visible = cm;
        if (p.tx === null || Math.hypot(p.tx - g.position.x, p.tz - g.position.z) < .5) {
          if (cm) { p.tx = rand(-5, 5); p.tz = rand(3, 10); } else { const a = Math.random() * 6.283, r = rand(4, 24); p.tx = Math.cos(a) * r; p.tz = Math.max(-14, Math.sin(a) * r * .7 + 6); }
        }
        const dx = p.tx - g.position.x, dz = p.tz - g.position.z, d = Math.hypot(dx, dz) || 1, sp = p.sp * (.5 + mood.stab / 100) * (cm ? 1.4 : 1) * dt;
        g.position.x += dx / d * sp; g.position.z += dz / d * sp; g.rotation.y = Math.atan2(dx, dz);
        g.position.y = Math.abs(Math.sin(t * 6 * p.sp + p.ph)) * .08 + (cm ? Math.abs(Math.sin(t * 5 + p.ph)) * .12 : 0);
      });
      // tüstü
      const amt = cfg.smoke === 2 ? .75 : cfg.smoke === 1 ? .45 : Math.max(0, (50 - mood.envi) / 50) * .5;
      smk.forEach(m => {
        const u = m.userData, life = ((t * .25 + u.ph) % 1), cx = u.ch ? -3 : 1;
        m.position.set(cx + Math.sin(t + u.ph) * .6 + life * 2, 9 + life * 9, -1);
        m.scale.setScalar(.8 + life * 3); m.material.opacity = amt * (1 - life);
      });
    } else {
      lamp.intensity = 1.3 * (.5 + .5 * (mood.stab / 100)) * (cfg.fall ? Math.max(.15, 1 - fallT * .15) : 1);
      lamp.color.setHex(mood.tens > 65 ? 0xff8a5a : 0xffc680);
      if (cfg.fall && fallT >= 0) {
        fallT += dt;
        const o = Math.min(1, fallT / 2.2) * 1.25; doorL.rotation.y = o; doorR.rotation.y = -o;
        intruders.forEach((g, i) => { const s = Math.min(1, Math.max(0, (fallT - 2) / 4)); g.position.z = 14 - s * 20; g.position.x = (i - 2) * .9 * (1 - s * .5); g.position.y = Math.abs(Math.sin(t * 7 + i)) * .07; g.rotation.y = Math.PI; });
        if (fallT > 4.2) king.visible = false;
      }
    }
    R.render(S, C);
  }

  return { init, setMode, setMood, isOk: () => ok };
})();
