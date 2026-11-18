/* 水磨部件建模与注册(10 件)。
   布局:立轮(X-Y 平面,法线 Z)入水;立轴沿 Z;上磨悬于轴端(绕 Z 转)
   压在下磨上;麦粒自轴顶漏斗撒入磨膛,面粉从磨缘飘出。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildPond() {
    var g = group();
    var water = P.mesh(new THREE.PlaneGeometry(3.2, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x2E6E8E, transparent: true, opacity: 0.6, roughness: 0.24 }), -1.4, D.waterY, 1.3, false, true);
    water.rotation.x = -Math.PI / 2;
    g.add(water);
    g.add(P.box(0.26, 0.5, 2.7, M3.stone, -2.9, 0.25, 1.3));
    return g;
  }

  function buildFrame() {
    var g = group();
    [-0.5, 1.2].forEach(function (z) {
      g.add(P.box(0.20, D.yC + 0.15, 0.20, M3.woodD, 0, (D.yC + 0.15) / 2, z));
      g.add(P.cyl(0.09, 0.09, 0.14, M3.iron, 0, D.yC, z, 12));
    });
    g.add(P.box(0.34, 0.10, 1.9, M3.stone, 0, 0.05, 0.35));
    /* 磨房台 */
    g.add(P.box(1.5, 0.16, 1.5, M3.stone, 0, 0.08, -0.9));
    return g;
  }

  function buildWheel() {
    var g = group();
    g.add(P.torus(D.R, 0.06, M3.woodD, 0, 0, 0, 46));
    g.add(P.torus(D.R - 0.16, 0.045, M3.wood, 0, 0, 0, 42));
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      var s = P.box(0.06, D.R - 0.14, 0.05, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.13 + (D.R - 0.14) / 2), Math.sin(a) * (0.13 + (D.R - 0.14) / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    for (var j = 0; j < 8; j++) {
      var a2 = j / 8 * Math.PI * 2 + Math.PI / 10;
      var b = P.box(0.36, 0.15, 0.02, M3.woodL, 0, 0, 0);
      b.position.set(Math.cos(a2) * (D.R - 0.26), Math.sin(a2) * (D.R - 0.26), 0.09);
      b.rotation.z = a2 + Math.PI / 2;
      g.add(b);
    }
    var hub = P.cyl(0.11, 0.11, 0.22, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return { group: g };
  }

  function buildAxle() {   // 立轴(沿 Z)+ 磨撑
    var g = group();
    var axle = P.cyl(0.065, 0.065, D.axleL, M3.woodD, 0, 0, 0, 14);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    return { group: g };
  }

  function buildMill() {   // 上磨(绕 Z)+ 磨齿
    var g = group();
    var disk = P.cyl(D.millR, D.millR, 0.09, M3.stone, 0, 0, 0, 36);
    g.add(disk);
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2 + Math.PI / 8;
      var groove = P.box(D.millR * 0.6, 0.02, 0.03, M3.dark, 0, 0, 0);
      groove.position.set(Math.cos(a) * D.millR * 0.5, -0.055, Math.sin(a) * D.millR * 0.5);
      groove.rotation.y = -a;
      g.add(groove);
    }
    var hub = P.cyl(0.09, 0.09, 0.10, M3.iron, 0, 0, 0, 12);
    g.add(hub);
    /* 麦粒漏斗(轴顶) */
    var funnel = group();
    funnel.add(P.box(0.16, 0.04, 0.16, M3.woodD, 0, 0, 0));
    [-1, 1].forEach(function (s) {
      var w = P.box(0.16, 0.10, 0.02, M3.wood, 0, 0.05, s * 0.06);
      w.rotation.x = s * 0.4;
      funnel.add(w);
      var w2 = P.box(0.02, 0.10, 0.16, M3.wood, s * 0.06, 0.05, 0);
      w2.rotation.z = -s * 0.4;
      funnel.add(w2);
    });
    funnel.position.set(0, D.millGap + 0.22, 0);
    g.add(funnel);
    return { group: g };
  }

  function buildBaseMill() {  // 下磨(固定)+ 面粉台
    var g = group();
    var disk = P.cyl(D.millR + 0.05, D.millR + 0.05, 0.10, M3.stone, 0, 0, 0, 36);
    g.add(disk);
    var table = P.box(D.millR * 3.2, 0.06, D.millR * 3.2, M3.woodD, 0, -0.08, 0);
    g.add(table);
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "pond", name: "POND · 水池", sub: "冲立轮下缘", phase: 0, kind: "none", world: true,
      build: buildPond, target: [0, 0, 0] });
    def({ id: "frame", name: "FRAME · 轴承支架", sub: "双柱 + 磨房台", phase: 0, at: 0.15, dur: 1.2,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.4, 2.4], mid: [0, 2.6, 1.2], anchor: [0, 1.4, 0.6] });
    def({ id: "wheel", name: "WHEEL · 立轮", sub: "R 1.15 · 入水 0.25", phase: 0, at: 1.5, dur: 1.3, kind: "kine",
      build: buildWheel, target: [0, D.yC, 1.3], off: [0, 1.0, 6.5] });
    def({ id: "axle", name: "AXLE · 立轴", sub: "直驱 1:1", phase: 1, at: 3.4, dur: 1.1, kind: "kine",
      build: buildAxle, target: [0, D.yC, 0.1], off: [0, 1.6, 2.0] });
    def({ id: "basemill", name: "BASE MILL · 下磨", sub: "固定磨盘", phase: 1, at: 4.4, dur: 1.1,
      build: buildBaseMill, target: [0, D.yC - D.millGap / 2 - 0.05 - D.millGap, -0.9], start: [0, 3.2, -0.9], mid: [0, 2.0, -0.9], anchor: [0.6, 0.2, 0.3] });
    def({ id: "mill", name: "MILL · 上磨(旋转)", sub: "R 0.55 · 磨齿 8 道", phase: 2, at: 6.2, dur: 1.3, kind: "kine",
      build: buildMill, target: [0, D.yC - D.millGap / 2 - 0.05, -0.9], off: [0, 1.8, 2.0] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("wheel");
    if (e && e.shown) e.group.rotation.z = -st.phi;
    e = MECH.Parts.entry("axle");
    if (e && e.shown) e.group.rotation.z = -st.phi;
    e = MECH.Parts.entry("mill");
    if (e && e.shown) e.group.rotation.z = -st.phi;
    /* 面粉粒子(磨缘) */
    if (st.flour > 0 && Math.random() < 0.03) {
      var a = Math.random() * Math.PI * 2;
      MECH.Scene3D.spawnPuff(Math.cos(a) * (D.millR + 0.06), D.yC - D.millGap / 2 - 0.12, -0.9 + Math.sin(a) * (D.millR + 0.06), {
        max: 1.0, base: 0.12, vx: Math.cos(a) * 0.3, vy: 0.12, vz: Math.sin(a) * 0.3,
        opacity: 0.5, tint: 0xE8DCB8, grow: 1.8
      });
    }
    /* 水流 */
    if (st.omega > 0.4 && Math.random() < 0.03) {
      MECH.Scene3D.spawnPuff(-2.2, D.waterY + 0.12, 1.3, {
        max: 1.0, base: 0.26, vx: 1.1, vy: 0.05, vz: 0, opacity: 0.4, tint: 0x9FD4E8, grow: 1.3
      });
    }
  };
})(window.MECH = window.MECH || {});
