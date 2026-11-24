'use strict';
window.EK_VERI = window.EK_VERI || {}; window.EK_VERI["efsane"] = {"dil":{"tr":{"menu.efsane":"Efsane","efsane.gec":"Geç","efsane.bin":"Ejderhaya yaklaş","efsane.bin.alt":"Göl ejderi seni bekliyor","efsane.uc":"Göl ejderi","efsane.uc.alt":"W: ileri · Fare: yön · Boşluk: kalk, yüksel · C: alçal · Shift: turbo · S: dur, in","efsane.uc.alt.m":"Gaz: ileri · Ekranı sürükle: yön · El freni: kalk, yüksel · Turbo: hızlan · Fren: dur, in","efsane.akro":"Takla ve fıçı dönüşü","efsane.akro.alt":"Boşluğa iki kez bas: takla · A ya da D’ye iki kez bas: fıçı dönüşü · Tıkla: fareyi kilitle","efsane.akro.alt.m":"El frenine iki kez bas: takla · Sağa ya da sola iki kez bas: fıçı dönüşü"},"en":{"menu.efsane":"Legend","efsane.gec":"Skip","efsane.bin":"Approach the dragon","efsane.bin.alt":"The lake dragon is waiting for you","efsane.uc":"Lake dragon","efsane.uc.alt":"W: forward · Mouse: aim · Space: take off, rise · C: descend · Shift: turbo · S: stop, land","efsane.uc.alt.m":"Gas: forward · Drag the screen: aim · Handbrake: take off, rise · Turbo: speed up · Brake: stop, land","efsane.akro":"Loop and barrel roll","efsane.akro.alt":"Tap Space twice: loop · Tap A or D twice: barrel roll · Click: lock the mouse","efsane.akro.alt.m":"Tap the handbrake twice: loop · Tap left or right twice: barrel roll"},"fa":{"menu.efsane":"افسانه","efsane.gec":"رد کردن","efsane.bin":"به اژدها نزدیک شو","efsane.bin.alt":"اژدهای دریاچه منتظر توست","efsane.uc":"اژدهای دریاچه","efsane.uc.alt":"W: جلو · ماوس: جهت · فاصله: پرواز و اوج · C: فرود · Shift: توربو · S: توقف و نشستن","efsane.uc.alt.m":"گاز: جلو · کشیدن صفحه: جهت · ترمز دستی: پرواز و اوج · توربو: شتاب · ترمز: توقف و نشستن","efsane.akro":"پشتک و چرخش بشکه‌ای","efsane.akro.alt":"دو بار فاصله: پشتک · دو بار A یا D: چرخش بشکه‌ای · کلیک: قفل ماوس","efsane.akro.alt.m":"دو بار ترمز دستی: پشتک · دو بار چپ یا راست: چرخش بشکه‌ای"}},"stil":"/* Efsane: ejderha açılış videosu (23 Kas 2026). Bitince ya da geçilince solarak oyunu açar. */\n.efsane { position: fixed; inset: 0; z-index: 90; background: #000; opacity: 1; transition: opacity 0.9s ease; }\n.efsane.soluyor { opacity: 0; pointer-events: none; }\n.efsane video { width: 100%; height: 100%; object-fit: contain; display: block; }      /* dik telefonda kırpılmasın: üstte ve altta siyah bant */\n.efsane-gec { position: absolute; right: max(16px, env(safe-area-inset-right, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); padding: 8px 16px; border-radius: 999px;\n  border: 1px solid rgba(255, 255, 255, 0.35); background: rgba(0, 0, 0, 0.35); color: #fff; font-size: 14px; }\n"};
// Göl ejderi (24 Kas 2026; kurucu: "adam olsa ejderhaya binse ve savaşa katılsa daha iyi değil mi?"; sonra: "Ashwing_Drake_Lite klasöründeki ejderhayı kullan.
// yürüyebiliyor da ... neredeyse herşeyin içinden geçiyor. olmaz").
// Model: Ashwing Drake Lite (Literock Studios; kurucunun getirdiği paket, "asset indirilen/Ashwing_Drake_Lite"; lisans masaustu/LISANSLAR.md). Kanat-elleri üstünde
// yürüyen iki ayaklı ejderha, 12 bin üçgen, 61 kemik, altı canlandırma: idle_loop, walk_loop, roar, bite, takeoff, fly_loop. Dosya tools/ejder-glb.py ile küçültülür
// (ek/efsane/model/ashwing.glb). Yalnız Efsane sahnesinde yüklenir. Model +z'ye bakar, kökü ayak tabanındadır; oyunda EJ_OLCEK katı büyütülür.
// Oyuncunun durumu c.binek: 'yer' (yürür: araç fiziği, bina ve sur çarpışması, trafik, çit ve direkler onunla aynı), 'kalkis' (kalkış canlandırması), 'ucus'.
// Uçuşta çarpışma: duvarlar üst kotuyla tutulur (WYUK, src/dunya.js); gövde duvarın üstünden alçaktaysa çarpar, yüksekteyse üstünden geçer. Çatıya inilmez, üstünde durulur.
const EJDER_SURUM = '2026-11-24c';
const EJ_OLCEK = 1.5;
// m/sn. seyir / hizli / yavas: tuşsuz, turbolu ve el frenli hız; enAz / enCok: dalış ve tırmanışın hız sınırı; burun: burun dönüş hızı (rad/sn), duzel: bırakınca
// düzelme hızı, egim: en dik burun açısı (rad; 78°); taban: uçarken yerden en az yükseklik; yuru / guc: yerde yürüme hızı ve itiş; R: gövde çarpışma yarıçapı
const EJ_FIZ = { hizli: 62, turbo: 105, enCok: 125, ivme: 1.5, burun: 2.4, egim: 1.4, don: 1.5, govdeDon: 2.6, fare: 0.0024, kolDon: 2.2, dikHiz: 16, cift: 0.32, taklaHiz: 2.0, ficiSure: 0.9, ficiKay: 7, taban: 1.4, tavan: 450, yuru: 6.2, guc: 5.2, kalkis: 2.4, R: 2.5 };
const EJ_KAM = { d: 21, h: 8, la: 3.6 }, EJ_KAM_YER = { d: 15, h: 6.2, la: 3.2 };      // takip kamerası: uçuşta ve yerde
const EJ_OTURAK = [0, 2.38, -0.3];      // binicinin oturduğu yer (model uzayı, ölçeksiz): boyun dibi, omuzların arası
let _ejSoz = null;
function ejderYukle(kok) {      // kok: paketin klasörü (ek/efsane/)
  if (!_ejSoz) _ejSoz = new Promise((ok, red) => {
    if (!THREE.GLTFLoader) { red(new Error('GLB yükleyici yok')); return; }
    new THREE.GLTFLoader().load(kok + 'model/ashwing.glb?s=' + EJDER_SURUM, ok, undefined, red);
  });
  return _ejSoz;
}
// g: ashwing.glb (sahne + canlandırmalar); us: ucteker.glb sahnesi (binici figürü; yoksa binicisiz).
function ejderKur(g, us) {
  const kok = new THREE.Group(), ic = new THREE.Group(), model = g.scene, K = {};
  kok.name = 'ejderha'; kok.add(ic); ic.add(model); model.scale.setScalar(EJ_OLCEK);
  model.traverse((o) => {
    if (o.isBone) K[o.name] = o;
    if (!o.isMesh) return;
    o.frustumCulled = false; o.castShadow = true; o.receiveShadow = true;      // canlandırmada sınır küresi tutmaz
    const m = o.material; if (!m) return;
    m.envMapIntensity = 0.8; m.shadowSide = THREE.DoubleSide;
    for (const t of [m.map, m.normalMap, m.roughnessMap]) if (t) t.anisotropy = 4;
  });
  const mixer = new THREE.AnimationMixer(model), A = {};
  for (const klip of g.animations) A[klip.name] = mixer.clipAction(klip);
  for (const ad of ['takeoff', 'roar', 'bite']) if (A[ad]) { A[ad].setLoop(THREE.LoopOnce, 1); A[ad].clampWhenFinished = true; }
  const E = { kok, ic, K, A, binici: null, durum: 'yok', klip: null };
  // Canlandırmayı değiştirir (yumuşak geçişle); aynı klip sürüyorsa yalnız hızını ayarlar.
  E.oyna = (ad, hiz, gecis) => {
    const a = A[ad]; if (!a) return;
    a.timeScale = hiz === undefined ? 1 : hiz;
    if (E.klip === ad) return;
    a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.play();
    const eski = E.klip && A[E.klip]; if (eski) eski.crossFadeTo(a, gecis === undefined ? 0.35 : gecis, false);
    E.klip = ad;
  };
  E.bitti = (ad) => { const a = A[ad]; return !a || (!a.isRunning() && a.time > 0); };
  // Binici: oyuncunun figürü, omuzların arasında sırta oturur (24 Kas, kurucu ekran görüntüsüyle: "karakterimizin duruşunu görüyor musun?": ayakta, bacakları açık
  // duruyordu, çünkü oturak yürüme duruşunda ölçülüp uçuşta kemikle birlikte yukarı savruluyordu ve binici köke göre dik tutuluyordu).
  // Oturak: omurga kemiğinin başından sırt yönünde gövde yarıçapı kadar. Sırt yönü ve yarıçap durağan ağdan ölçülür; her karede kemiğin o anki çerçevesiyle
  // yeniden kurulur, binici gövdeyle birlikte eğilir (yarı yarıya dik tutulur: dik yürüme duruşunda sırtüstü yatmasın).
  const kemik = K.spine_03 || K.spine_02 || K.pelvis;
  const _p = new THREE.Vector3(), _a = new THREE.Vector3(), _s = new THREE.Vector3(), _x = new THREE.Vector3(), _bq = new THREE.Quaternion(), _iq = new THREE.Quaternion(), _m = new THREE.Matrix4();
  kok.updateMatrixWorld(true);
  let sirtL = null, yaricap = 0.45 * EJ_OLCEK;
  if (kemik) {
    kemik.getWorldQuaternion(_bq); const o0 = kemik.getWorldPosition(new THREE.Vector3()), eksen = new THREE.Vector3(0, 1, 0).applyQuaternion(_bq).normalize();
    const sirt = new THREE.Vector3(1, 0, 0).cross(eksen).normalize(); if (sirt.dot(_p.set(0, 1, -0.3)) < 0) sirt.negate();      // kemik eksenine dik, sırt tarafı (yukarı ve arkaya)
    sirtL = sirt.clone().applyQuaternion(_bq.clone().invert());
    let en = 0;      // durağan ağda, kemiğin başı hizasında orta çizgideki en uzak sırt noktası
    model.traverse((m) => {
      if (!m.isSkinnedMesh) return; const pa = m.geometry.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        _p.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).sub(o0);
        if (Math.abs(_p.x) > 0.22 * EJ_OLCEK || Math.abs(_p.dot(eksen)) > 0.18 * EJ_OLCEK) continue;
        const r = _p.dot(sirt); if (r > en) en = r;
      }
    });
    if (en > 0.1) yaricap = en;
  }
  if (us && us.getObjectByName('oyuncu') && kemik) {
    const o = figurKopya(us, 'oyuncu'), f = figurKur(o), v = new THREE.Vector3(), b = new THREE.Vector3();
    ic.add(o); E.binici = o;
    o.traverse((m) => { if (m.isMesh) m.frustumCulled = false; });
    f.govde.position.set(0, 0.07, 0); f.govde.rotation.set(0.52, 0, 0); f.bas.rotation.set(-0.42, 0, 0);      // öne eğik oturur, başı ileri bakar
    const gqi = new THREE.Quaternion().setFromEuler(f.govde.rotation).invert();
    for (const yan of ['L', 'R']) {
      const sx = yan === 'L' ? 1 : -1;
      ikCoz(f.bacak[yan], v.set(sx * 0.4, -0.5, -0.12).applyQuaternion(gqi), b.set(sx * 0.9, 0.1, 1).applyQuaternion(gqi), gqi);      // bacaklar gövdenin iki yanından aşağı, dizler bükük
      ikCoz(f.kol[yan], v.set(sx * 0.13, -0.02, 0.5).applyQuaternion(gqi), b.set(sx * 0.6, -1, -0.3).applyQuaternion(gqi));      // eller önde, boyun dibinde
    }
    o.visible = false;
  }
  E.adim = (dt) => {
    mixer.update(dt);
    if (!E.binici || !E.binici.visible) return;
    kemik.updateWorldMatrix(true, false); kemik.getWorldQuaternion(_bq); ic.getWorldQuaternion(_iq).invert();
    _s.copy(sirtL).applyQuaternion(_bq);      // sırt yönü (dünya)
    ic.worldToLocal(kemik.getWorldPosition(_p).addScaledVector(_s, yaricap - 0.03)); E.binici.position.copy(_p);
    _s.applyQuaternion(_iq).lerp(_x.set(0, 1, 0), 0.5).normalize();      // binicinin yukarısı: sırt yönü ile dik arası
    _a.set(0, 1, 0).applyQuaternion(_bq).applyQuaternion(_iq); _a.addScaledVector(_s, -_a.dot(_s)); if (_a.lengthSq() < 1e-4) _a.set(0, 0, 1); _a.normalize();      // ileri: kemik ekseni, yukarıya dik
    _x.crossVectors(_s, _a).normalize();
    E.binici.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _s, _a));
  };
  E.oyna('idle_loop'); E.adim(0);
  return E;
}
// Uçuşta bina ve sur çarpışması: ön ve arka iki daire; üst kotu gövdenin altında kalan duvarlar sayılmaz. Çarpınca dışarı itilir, hız keser, burnu duvardan döner.
function ejderCarp(c) {
  const fx = Math.sin(c.h), fz = Math.cos(c.h), R = EJ_FIZ.R; let carpti = false;
  for (let part = 0; part < 2; part++) {
    const o = part ? -2.4 : 2.6;
    let px = c.x + fx * o, pz = c.z + fz * o;
    const cell = gridCell(WG, px, pz);
    if (!cell) continue;
    for (let q = 0; q < cell.length; q++) {
      const id = cell[q], w = id * 4;
      if (WYUK[id] < c.y + 0.7) continue;      // duvarın üstünden uçuyor
      const ax = WSEG[w], az = WSEG[w + 1], ex = WSEG[w + 2] - ax, ez = WSEG[w + 3] - az;
      const L = ex * ex + ez * ez, t = L > 0 ? clamp(((px - ax) * ex + (pz - az) * ez) / L, 0, 1) : 0;
      const dx = px - ax - ex * t, dz = pz - az - ez * t, d2 = dx * dx + dz * dz;
      if (d2 >= R * R || d2 < 1e-8) continue;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, pen = R - d;
      c.x += nx * pen; c.z += nz * pen; px += nx * pen; pz += nz * pen;
      const vn = fx * nx + fz * nz;      // ileri yönün duvara dik bileşeni (eksi: duvara doğru)
      if (vn < 0) {
        c.ev *= Math.max(0.2, 1 + vn * 0.7);      // dik çarpışta hızın çoğu gider
        const side = nx * -fz + nz * fx;
        c.h -= side * 0.06 * (part ? -1 : 1) * (-vn);
        if (-vn * c.ev > (c.hit || 0)) c.hit = -vn * c.ev;
        carpti = true;
      }
    }
    // ağaç ve direk (src/kirik.js ızgarası): ağaç 12 m, direk 8 m sayılır; üstünden uçuyorsa çarpmaz. Çit alçaktır, uçarken sayılmaz.
    if (typeof KIRIK !== 'undefined' && KIRIK.oge.length) for (let i = Math.floor((px - R) / KIRIK_H); i <= Math.floor((px + R) / KIRIK_H); i++) for (let j = Math.floor((pz - R) / KIRIK_H); j <= Math.floor((pz + R) / KIRIK_H); j++) {
      const h = KIRIK.izg.get(i * 100003 + j); if (!h) continue;
      for (const k of h) {
        if (k.tip === 1 || k.durum !== 0) continue;
        const dx = px - k.x, dz = pz - k.z, RR = R + (k.r || 0.2), d2 = dx * dx + dz * dz;
        if (d2 >= RR * RR || d2 < 1e-8 || c.y > groundH(k.x, k.z) + (k.tip === 2 ? 12 : 8)) continue;
        const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, pen = RR - d, vn = fx * nx + fz * nz;
        c.x += nx * pen; c.z += nz * pen; px += nx * pen; pz += nz * pen;
        if (vn < 0) {
          if (k.tip === 2 && c.ev > 4 && typeof AGAC_U !== 'undefined') AGAC_U.uVur.value.set(k.x, k.z, AGAC_U.uZaman.value, Math.min(1, c.ev / 14));      // ağaç sallanır
          c.ev *= Math.max(0.3, 1 + vn * 0.6); c.h -= (nx * -fz + nz * fx) * 0.06 * (part ? -1 : 1) * (-vn); carpti = true;
        }
      }
    }
  }
  return carpti;
}
// Serbest uçuş (24 Kas, kurucu: "360 derece kontrol edebilme özelliği olmalı ki oyun daha heyecanlı olsun"). Ejderha burnunun baktığı yöne uçar:
// gaz burnu kaldırır (tırmanır), fren burnu indirir (dalar), bırakınca düzelir; direksiyon yatırıp döndürür; turbo hızlandırır, el freni yavaşlatır.
// Dalışta hız artar, tırmanışta düşer. c: oyuncu (x, y, z, h, steer, roll; ep: burun açısı, ev: hız, evy: dikey hız). zorla: kalkışta burun açısını ezer.
function ejderAdim(c, inp, dt, zorla) {
  // Kumanda (24 Kas 2026 gece, kurucu: "hala 360 derece kontrol edemiyorum. ayrıca ileri gitme tuşu hangisi? Turbo ise çok yavaş gidiyor ve sıkıcı yapıyor oyunu"):
  // gaz = ileri, fren = dur (havada asılı kalır), turbo = hızlı ileri; yön NİŞANLA verilir: fare / ekranı sürükleme / sağ çubuk nişanı her yöne çevirir (c.ah yön, c.ap eğim),
  // sağ-sol tuşları da nişanı döndürür; ejderha nişana döner ve gazla o yöne uçar. Yüksel (boşluk) ve alçal (C) dikey iter. Kamera nişana bağlıdır (src/oyun.js).
  // Önceki kumanda (gaz = burun yukarı, kendiliğinden 21 m/sn ileri) reddedildi.
  const F = EJ_FIZ, ileri = zorla ? 1 : inp.thr > 0.1 ? 1 : 0, fren = !zorla && inp.brk > 0.1, turbo = !zorla && !!inp.turbo;
  const dy = zorla ? 0 : (inp.hb ? 1 : 0) - (inp.asagi ? 1 : 0), yon = zorla ? 0 : inp.steer > 0.6 ? 1 : inp.steer < -0.6 ? -1 : 0;
  if (c.ah == null) { c.ah = c.h; c.ap = 0; }
  if (!zorla) {
    c.ah -= (inp.ax || 0) * F.fare + (clamp(inp.steer, -1, 1) * F.don + (inp.nx || 0) * F.kolDon) * dt;
    c.ap = clamp((c.ap || 0) - (inp.ay || 0) * F.fare - (inp.ny || 0) * F.kolDon * dt, -F.egim, F.egim);
  }
  inp.ax = 0; inp.ay = 0;
  let ep = c.ep || 0;
  // Takla ve fıçı dönüşü: aynı tuşa F.cift sn içinde iki kez basınca. Yüksel = takla (burun yukarı tam tur), alçal = ters takla, sağ / sol = fıçı dönüşü (o yana F.ficiKay m kayar).
  c.tT = (c.tT || 0) + dt; c.fT = (c.fT || 0) + dt;
  if (dy !== (c.tYon || 0)) { if (dy) { if (dy === c.tSon && c.tT < F.cift && !c.takla && !c.fici && (c.ev || 0) > 12 && (dy > 0 || c.y - Math.max(groundH(c.x, c.z), 0.3, binaUst(c.x, c.z)) > 2.5 * (c.ev || 0) / F.taklaHiz + 4)) c.takla = { yon: dy, a: 0 }; c.tSon = dy; c.tT = 0; } c.tYon = dy; }      // ters takla aşağı döner: altında yeterli boşluk yoksa başlamaz
  if (yon !== (c.fYon || 0)) { if (yon) { if (yon === c.fSon && c.fT < F.cift && !c.fici && !c.takla) c.fici = { yon, t: 0 }; c.fSon = yon; c.fT = 0; } c.fYon = yon; }
  if (c.takla) {      // ep (-π, π] aralığında döner; tur bitince başladığı eğime çıkar
    const d = Math.min(F.taklaHiz * dt, Math.PI * 2 - c.takla.a); c.takla.a += d; ep = wrapAngle(ep + c.takla.yon * d);
    if (c.takla.a >= Math.PI * 2 - 1e-4) { c.takla = null; ep = clamp(ep, -F.egim, F.egim); }
  } else { const hedef = zorla || c.ap; ep += clamp((hedef - ep) * Math.min(1, dt * 6), -F.burun * dt, F.burun * dt); }
  let kay = 0;
  if (c.fici) {
    const k0 = c.fici.t / F.ficiSure; c.fici.t += dt; const k = Math.min(1, c.fici.t / F.ficiSure), e = (q) => q * q * (3 - 2 * q);
    c.rollEk = c.fici.yon * Math.PI * 2 * e(k); kay = c.fici.yon * F.ficiKay * (e(k) - e(k0));
    if (k >= 1) { c.fici = null; c.rollEk = 0; }
  }
  // hız: gaz F.hizli, turbo F.turbo; bırakınca süzülerek yavaşlar, frenle hızla durur (0 = havada asılı). Dalış hızlandırır, tırmanış yavaşlatır.
  const hv = zorla ? 18 : fren ? 0 : turbo ? F.turbo : ileri ? F.hizli : 0, v0 = c.ev || 0;
  c.ev = v0 + (hv - v0) * Math.min(1, dt * (hv > v0 ? F.ivme : fren ? 2.4 : 0.3)) - (v0 > 4 ? 9.8 * Math.sin(ep) * 0.5 * dt : 0);
  c.ev = clamp(c.ev, 0, F.enCok);
  // gövde nişan yönüne döner; dönüş hızı yatışı verir
  const adim = zorla ? 0 : clamp(wrapAngle(c.ah - c.h) * Math.min(1, dt * 5), -F.govdeDon * dt, F.govdeDon * dt);
  c.h += adim; c.steer = clamp(-adim / dt / 1.3, -1, 1);
  c.dv = (c.dv || 0) + (dy * Math.max(F.dikHiz, c.ev * 0.5) - (c.dv || 0)) * Math.min(1, dt * 4);      // yüksel / alçal
  const ce = Math.cos(ep), fx = Math.sin(c.h), fz = Math.cos(c.h);
  c.evy = c.ev * Math.sin(ep) + c.dv;
  // sarp yamaç ve kale kayası: varacağı yerin zemini bulunduğu yükseklikten 3 m'den fazla yukarıdaysa duvar gibi durdurur (üstünden aşmak için tırmanmak gerekir)
  const nx = c.x + fx * c.ev * ce * dt, nz = c.z + fz * c.ev * ce * dt;
  if (groundH(nx, nz) + F.taban - (c.y + c.evy * dt) > 3) { c.hit = Math.max(c.hit || 0, c.ev * 0.5); c.ev = c.ev * (1 - 2.5 * dt); c.yamac = true; }
  else { c.x = nx; c.z = nz; c.yamac = false; }
  if (kay) { const kx = c.x - fz * kay, kz = c.z + fx * kay; if (groundH(kx, kz) + F.taban - c.y <= 3) { c.x = kx; c.z = kz; } }      // fıçı dönüşünde yana kayma (direksiyon yönü: -cos h, sin h)
  c.y += c.evy * dt;
  if (typeof XMIN === 'number') { c.x = clamp(c.x, XMIN + 30, XMAX - 30); c.z = clamp(c.z, ZMIN + 30, ZMAX - 30); }      // bölge sınırından çıkmaz
  ejderCarp(c);
  // taban: yer, göl yüzeyi, altındaki binanın çatısı. Yere dalarsa yüzeyin üstünde kayar ve burnu düzelir; hızla çarparsa sarsılır ve hız keser.
  // Sırtüstü ya da yan dönmüşken taban yükselir: binici ve kanat yere girmesin (sırtüstü +3 m, kanat dikken +3,5 m).
  const rt = (c.roll || 0) + (c.rollEk || 0), ustY = ce * Math.cos(rt);
  const yer = Math.max(groundH(c.x, c.z), 0.3), cati = binaUst(c.x, c.z), taban = Math.max(yer, cati) + F.taban + Math.max(0, -ustY) * 3 + (c.fici ? Math.abs(Math.sin(rt)) * 3.5 : 0);
  c.catida = cati > yer;
  if (c.y < taban) {
    if (Math.sin(ep) < -0.25 && c.ev > 16) { c.hit = Math.max(c.hit || 0, c.ev * -Math.sin(ep)); c.ev *= 0.82; }      // yere sert dalış
    c.y += (taban - c.y) * Math.min(1, dt * 8); if (c.y < taban - 0.9) c.y = taban - 0.9;      // yumuşak yay hızlı dalışta yetmez: tabanın 0,9 m altına hiç inmez
    if (ep < 0 && !c.takla) ep += Math.min(-ep, 3.2 * dt); c.yerde = ustY > 0.5 && !c.fici && !c.takla;
  } else c.yerde = ustY > 0.5 && !c.fici && !c.takla && c.y < taban + 0.6;
  if (c.y > F.tavan) { c.y = F.tavan; if (ep > 0 && !c.takla) ep -= Math.min(ep, 2.5 * dt); }
  if (c.yerde && !c.takla) { if (c.ap < 0) c.ap += Math.min(-c.ap, 3.2 * dt); if (c.dv < 0) c.dv = 0; }      // yerde nişan ve dikey itiş de düzelir
  c.ep = ep; c.pitch = c.takla ? ep : clamp(ep + Math.atan2(c.dv, Math.max(c.ev, 14)) * 0.8, -1.45, 1.45);      // dikey itişte burun da o yöne döner
  c.vx = fx * c.ev * ce; c.vz = fz * c.ev * ce; c.vf = c.ev; c.slip = 0; c.onRoad = false; c.brake = false; c.air = false;
  c.roll = (c.roll || 0) + (c.steer * 0.85 - (c.roll || 0)) * Math.min(1, dt * 3.2);
}
// Ejderhalı oyuncunun fizik adımı: yerde araç fiziği (çarpışmalarıyla), turbo ile kalkış, uçuş, frenle yere iniş.
function ejderStep(c, inp, dt) {
  if (c.binek === 'yer') {
    if ((inp.turbo || inp.hb) && !c.air) { c.ah = c.h; c.ap = 0; c.dv = 0; c.binek = 'kalkis'; c.ejT = 0; c.ev = Math.max(0, Math.hypot(c.vx || 0, c.vz || 0)); c.evy = 0; c.roll = 0; c.pitch = 0; c.ep = 0; c.inisT = 0; c.fici = null; c.takla = null; c.rollEk = 0; c.fSon = 0; c.tSon = 0; return; }
    stepCar(c, inp, dt); c.pitch = 0; c.roll = 0;
    return;
  }
  if (c.binek === 'kalkis') {      // kalkış: önce çömelip sıçrar (ilk 0,9 sn yerde), sonra yükselir
    c.ejT += dt; const k = c.ejT / EJ_FIZ.kalkis;
    if (k < 0.38) { c.ev = (c.ev || 0) * Math.max(0, 1 - dt * 2); c.vx = Math.sin(c.h) * c.ev; c.vz = Math.cos(c.h) * c.ev; c.x += c.vx * dt; c.z += c.vz * dt; c.y = groundH(c.x, c.z); c.vf = c.ev; }
    else ejderAdim(c, inp, dt, 0.5);      // kalkışta burun en çok 0,5 rad yukarı
    if (k >= 1) c.binek = 'ucus';
    return;
  }
  ejderAdim(c, inp, dt);
  // yere iniş: yerin hemen üstünde ve yavaşken fren ya da alçal 0,35 sn basılı kalınca. Göle ve çatıya inilmez.
  c.inisT = c.yerde && (inp.brk > 0.1 || inp.asagi) ? (c.inisT || 0) + dt : 0;
  if (c.yerde && !c.catida && c.ev < 30 && groundH(c.x, c.z) > 0.4 && c.inisT > 0.35) {
    c.binek = 'yer'; const v = Math.min(c.ev, EJ_FIZ.yuru); c.vx = Math.sin(c.h) * v; c.vz = Math.cos(c.h) * v; c.y = groundH(c.x, c.z); c.evy = 0; c.ep = 0; c.pitch = 0; c.roll = 0; c.air = false; c.inisT = 0; c.fici = null; c.takla = null; c.rollEk = 0;
  }
}
// Ejderhayı oyuncunun durumuna göre yerleştirir ve canlandırır.
function ejderPoz(E, c, dt, inp) {
  const ucus = c.binek === 'ucus' || (c.binek === 'kalkis' && c.ejT > EJ_FIZ.kalkis * 0.38);
  E.kok.position.set(c.x, c.y, c.z);
  E.kok.rotation.set(ucus ? -(c.pitch || 0) : 0, c.h, ucus ? (c.roll || 0) + (c.rollEk || 0) : 0, 'YXZ');      // gövde burun açısıyla tam eğilir
  if (c.binek === 'yer') { const v = Math.hypot(c.vx || 0, c.vz || 0), vf = (c.vx || 0) * Math.sin(c.h) + (c.vz || 0) * Math.cos(c.h); if (v > 0.5) E.oyna('walk_loop', clamp(v / 3.6, 0.55, 2.3) * (vf < -0.3 ? -1 : 1)); else E.oyna('idle_loop'); }
  else if (c.binek === 'kalkis') E.oyna('takeoff', 1, 0.2);
  else E.oyna('fly_loop', (c.ev || 0) < 8 ? 1.15 : inp && (inp.turbo || inp.thr > 0.1) ? 1.3 : Math.sin(c.pitch || 0) < -0.3 ? 0.55 : 0.95, 0.5);      // tırmanırken ve hızlanırken sık çırpar, dalışta süzülür
  E.adim(dt);
}

// Efsane paketi (ek/efsane): ejderha açılış videosu, fırtınalı sahne, göl ejderi (biniş, yürüyüş, uçuş). Çekirdek oyundan ayrı satılır;
// çekirdeğe yalnız src/oyun.js "Ek paketler" bölümündeki kancalarla bağlanır (ekKaydet). Uçuş fiziği ve model ejder.js'te.
ekKaydet('efsane', function (C) {
  const $ = (id) => document.getElementById(id), { G, A, AYAR, YUZK, inp, scene, camPos, flash, beep, setVehicle, loadRegion, startFree, girisBitir, vakitZorlaAyarla, initAudio, masterGain, nisanBirak } = C;
  const EJ_BINEK = { adim: ejderStep, kam: (c) => (c.binek === 'yer' ? EJ_KAM_YER : EJ_KAM) };      // çekirdeğin binek kancası: fizik adımı ve takip kamerası
  {      // açılış videosunun katmanı (menünün önünde durur; stil: stil.css)
    const kat = document.createElement('div'); kat.id = 'efsane'; kat.className = 'efsane'; kat.hidden = true;
    kat.innerHTML = '<video id="efsane-video" playsinline preload="none"></video><button id="btn-efsane-gec" class="efsane-gec" type="button" data-i18n="efsane.gec"></button>';
    const m = $('menu'); m.parentNode.insertBefore(kat, m); $('btn-efsane-gec').textContent = T('efsane.gec');
  }
  // ---- Efsane (23 Kas 2026, kurucu: "ejderhalar olsun, van gölünden çıktığı sahne. burası önce bir animasyon olup sonra oyuna girilebilir"; isteğe bağlı):
  // menüdeki düğme açılış videosunu oynatır; video sürerken arkada kalenin güney dibinde fırtınalı serbest sürüş kurulur, video bitince ya da geçilince
  // perde solarak açılır. Yer ve ışık videonun son karesine göredir (tools/bakis-ejderha.json).
  // Videonun son çekimi oyunun kendi karesinde başlar ve biter (kamera EFSANE.kam ile dondurulur); perde açılırken görüntü kıpırdamaz, sonra kamera takibe geçer.
  // kam: aracın 6,6 m gerisi ve yerden 1,9 m; bakış 45 m ileri ve yerden 11 m (tools/bakis-ejderha.json ile aynı). Video değişince ?s= artır.
  const EFSANE = { acik: false, bitir: null, video: C.kok + 'video/ejderha-acilis.mp4?s=2', yer: [-54, 240, 2.547], kam: [6.6, 1.9, 45, 11] };
  // Göl ejderi (ejder.js): video bitince kayanın ardından süzülüp yolun ilerisine iner ve bekler; oyuncu yaklaşınca biner, üç teker olduğu yerde kalır.
  // EJ.durum: 'yok' | 'inis' (iniyor) | 'bekliyor' | 'ucus'. Serbest sürüş yeniden başlayınca, yola dönünce ya da bölge değişince oyuncu iner (ejderIn).
  let EJ = null, EJ_YER = null;
  function ejderHazirla() {
    return Promise.all([ejderYukle(C.kok), ucTekerYukle().catch(() => null)]).then(([src, us]) => { if (!EJ) { EJ = ejderKur(src, us); EJ.kok.visible = false; scene.add(EJ.kok); } return EJ; }).catch(() => null);
  }
  function ejderCagir() {      // perde açıldıktan sonra: kayanın üstünden yolun 26 m ilerisine iner
    if (!EJ || C.player.binek) return;
    const [x, z, h] = EFSANE.yer, s = Math.sin(h), c = Math.cos(h), ix = x + s * 26, iz = z + c * 26;
    EJ_YER = { x: ix, z: iz, y: groundH(ix, iz), h: -1.75, bx: ix + s * 190, bz: iz + c * 190, by: groundH(ix, iz) + 115, t: 0 };
    EJ.durum = 'inis'; EJ.kok.visible = true; if (EJ.binici) EJ.binici.visible = false;
  }
  function ejderBin() {
    const c = C.player; EJ.arac = { x: c.x, z: c.z, h: c.h };
    const sur = c.mesh.getObjectByName('oyuncu'); if (sur) { sur.visible = false; EJ.surucu = sur; }      // sürücü üç tekerden iner
    EJ.aracTur = c.arac;
    C.binek = EJ_BINEK; c.binek = 'yer'; c.x = EJ_YER.x; c.z = EJ_YER.z; c.y = EJ_YER.y; c.h = EJ_YER.h; c.ev = 0; c.evy = 0; c.ep = 0; c.steer = 0; c.roll = 0; c.pitch = 0; c.vx = c.vz = 0; c.air = false; c.ah = null; c.ap = 0; c.dv = 0;
    c.power = EJ_FIZ.guc; c.vmax = EJ_FIZ.yuru; c.vKat = 1; c.ucTeker = false; c.pedal = false; c.devrik = 0; c.kalkis = 0;      // yerde araç fiziğiyle yürür
    EJ.durum = 'ucus'; if (EJ.binici) EJ.binici.visible = true;
    YUZK.dur = 0; YUZK.k = 0; beep(196, 0.5, 0.25, 'sawtooth'); flash(T('efsane.uc'), T(MOBIL ? 'efsane.uc.alt.m' : 'efsane.uc.alt'), 7);
  }
  function ejderIn() {      // ejderhadan iner: oyuncu üç tekerine döner, ejderha gider
    nisanBirak();
    if (EJ) { EJ.durum = 'yok'; EJ.kok.visible = false; if (EJ.surucu) { EJ.surucu.visible = true; EJ.surucu = null; } }
    if (!C.player.binek) return;
    C.player.binek = false; C.player.ev = 0; C.player.evy = 0; C.player.roll = 0; C.player.pitch = 0;
    if (EJ && EJ.aracTur) setVehicle(EJ.aracTur);      // güç ve hız değerleri araca döner
    if (EJ && EJ.arac) placeCar(C.player, EJ.arac.x, EJ.arac.z, EJ.arac.h);
    C.camSnap = true;
  }
  function ejderKare(dt) {      // her karede: iniş, bekleme, biniş ve uçuş duruşu
    if (!EJ || EJ.durum === 'yok') return;
    if (EJ.durum === 'ucus') {
      if (C.player.binek === 'ucus' && !EJ.akro) { EJ.akro = true; flash(T('efsane.akro'), T(MOBIL ? 'efsane.akro.alt.m' : 'efsane.akro.alt'), 7); }      // ilk havalanışta takla ve fıçı dönüşü ipucu
      if (C.player.binek) ejderPoz(EJ, C.player, dt, inp); return;
    }      // binili: yürür, kalkar, uçar
    const Y = EJ_YER;
    if (EJ.durum === 'inis') {
      Y.t = Math.min(1, Y.t + dt / 5.5); const k = 1 - Math.pow(1 - Y.t, 3);      // yavaşlayarak iner
      EJ.kok.position.set(lerp(Y.bx, Y.x, k), lerp(Y.by, Y.y, k), lerp(Y.bz, Y.z, k));
      EJ.kok.rotation.set(0.25 * (1 - k), lerp(EFSANE.yer[2] - Math.PI, Y.h, k * k), 0, 'YXZ'); EJ.oyna('fly_loop', 1.1); EJ.adim(dt);
      if (Y.t >= 1) { EJ.durum = 'bekliyor'; EJ.oyna('roar', 1, 0.3); flash(T('efsane.bin'), T('efsane.bin.alt'), 4); }      // konunca kükrer
      return;
    }
    EJ.kok.position.set(Y.x, Y.y, Y.z); EJ.kok.rotation.set(0, Y.h, 0, 'YXZ'); if (EJ.klip !== 'roar' || EJ.bitti('roar')) EJ.oyna('idle_loop'); EJ.adim(dt);      // bekliyor
    if (G.state === 'free' && Math.hypot(C.player.x - Y.x, C.player.z - Y.z) < 11) ejderBin();
  }
  async function efsaneAc() {
    if (EFSANE.acik) return;
    EFSANE.acik = true; initAudio();
    const kat = $('efsane'), v = $('efsane-video');
    kat.classList.remove('soluyor'); kat.hidden = false;
    if (A.master) A.master.gain.value = masterGain();      // video sürerken oyunun sesi kısık
    v.src = EFSANE.video; v.muted = !!G.muted; v.volume = clamp(AYAR.ses / 100, 0, 1);
    const bitti = new Promise((ok) => { EFSANE.bitir = ok; v.onended = ok; v.onerror = ok; });
    const oyna = v.play(); if (oyna && oyna.catch) oyna.catch(() => EFSANE.bitir());      // oynatılamazsa doğrudan oyuna geçilir
    $('btn-efsane-gec').focus();
    try {
      await loadRegion('van'); startFree(); girisBitir(); ejderHazirla();
      setVehicle('motor');      // videodaki araç kırmızı hamal üç tekeri: bu sahnede oyuncuda olmasa da onunla başlar (satın alma değişmez; yeni serbest sürüşte kendi aracına döner)
      placeCar(C.player, EFSANE.yer[0], EFSANE.yer[1], EFSANE.yer[2]); vakitZorlaAyarla(3); trafficClear();
      { const [x, z, h] = EFSANE.yer, [geri, yuk, ileri, th] = EFSANE.kam, s = Math.sin(h), c = Math.cos(h), cx = x - s * geri, cz = z - c * geri, tx = x + s * ileri, tz = z + c * ileri;
        G.freeze = [cx, groundH(cx, cz) + yuk, cz, tx, groundH(tx, tz) + th, tz]; }
    } catch (e) { /* sahne kurulamazsa menü yerinde kalır; perde yine açılır */ }
    await bitti;
    v.pause(); v.onended = v.onerror = null; EFSANE.bitir = null; EFSANE.acik = false;
    trafficClear();      // video sürerken yaklaşan trafik aracı perde açılınca oyuncunun önünde durmasın; araçlar uzakta yeniden doğar
    YUZK.dur = -4; YUZK.k = 0; C.camSnap = true;      // perde açılınca arkadan görünüş (videonun son karesi); yüz kamerası 6 sn sonra
    if (A.master) A.master.gain.value = masterGain();
    kat.classList.add('soluyor');
    setTimeout(() => {
      if (EFSANE.acik) return;
      kat.hidden = true; v.removeAttribute('src'); v.load();
      if (G.freeze) { camPos.set(G.freeze[0], G.freeze[1], G.freeze[2]); G.freeze = null; C.camSnap = false; }      // dondurulmuş kareden takip kamerasına yumuşak geçiş
      ejderHazirla().then(() => { if (G.state === 'free' && C.vakitZorla === 3 && !C.player.binek) ejderCagir(); });      // ejderha kayanın ardından iner
    }, 950);
  }
  C.menu('btn-efsane', 'menu.efsane', efsaneAc);
  $('btn-efsane-gec').addEventListener('click', () => { if (EFSANE.bitir) EFSANE.bitir(); });
  window.addEventListener('keydown', (e) => {      // video sürerken tuşlar oyuna gitmez; Esc, Enter ve boşluk videoyu geçer
    if (!EFSANE.acik) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if ((e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') && EFSANE.bitir) EFSANE.bitir();
  }, true);
  if (window.__van) {      // sınama kancaları (tools/bakis-ejder*.json)
    __van.efsane = { get acik() { return EFSANE.acik; }, ac: efsaneAc, gec: () => { if (EFSANE.bitir) EFSANE.bitir(); } };
    __van.ejder = { get durum() { return EJ ? EJ.durum : 'yok'; }, get kip() { return C.player.binek || null; }, get nesne() { return EJ; }, get yer() { return EJ_YER; }, bin: () => { if (EJ && EJ_YER && !C.player.binek) { EJ_YER.t = 1; ejderBin(); } }, in: ejderIn };
  }
  return { kare: ejderKare, sahneSifirla: ejderIn, binekIn: ejderIn, sessiz: () => EFSANE.acik, kameraTut: () => EFSANE.acik || !!(EJ && EJ.durum !== 'yok') };
});
