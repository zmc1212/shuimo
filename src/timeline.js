/* 时间线(44s):支架 → 立轮 → 立轴 → 下磨 → 上磨 → 慢速研磨 → 快速出粉 → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "frame", name: "FRAME · 支架磨台", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 5.4, target: [0, 1.2, 0] }, drift: 0.03 },
    { id: "wheel", name: "WHEEL · 立轮", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.22, r: 4.2, target: [0, 1.4, 0.6] }, drift: 0.01 },
    { id: "mill", name: "MILL · 上下磨合拢", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.24, r: 3.4, target: [0, 1.3, -0.6] }, drift: 0.01 },
    { id: "pour", name: "POUR · 麦粒入膛", dur: 3, dot: "blue", mode: "READY",
      cam: { theta: 0.15, phi: 1.10, r: 3.0, target: [0, 1.5, -0.7] }, drift: 0.008 },
    { id: "slow", name: "GRIND · 慢磨 0.85 rad/s", dur: 7, dot: "green", mode: "GRINDING",
      cam: { theta: 0.75, phi: 1.20, r: 4.6, target: [0, 1.2, -0.3] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快磨 1.5 rad/s", dur: 7, dot: "pink", mode: "FAST",
      cam: { theta: -0.5, phi: 1.18, r: 4.4, target: [0, 1.2, -0.3] }, drift: 0.02 },
    { id: "closeup", name: "CLOSE · 磨齿特写", dur: 6, dot: "yellow", mode: "CLOSE-UP",
      cam: { theta: 0.20, phi: 1.30, r: 2.4, target: [0, 1.25, -0.9] }, drift: 0.006 },
    { id: "summary", name: "SUMMARY · 直驱 1:1", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.12, r: 5.2, target: [0, 1.2, 0] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["frame", "wheel", "mill", "pour", "slow", "fast", "closeup", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; }
    if (ph.id === "slow") st.omegaTarget = D.k.slow;
    else if (ph.id === "fast" || ph.id === "closeup") st.omegaTarget = D.k.fast;
    else st.omegaTarget = 0;
    var f0 = st.flour;
    KS.step(st, dt);
    if (st.flour > f0 && st.omega > 0.3) {
      MECH.Scene3D.spawnPuff(Math.cos(Math.random() * 6.28) * (D.millR + 0.05), D.yC - 0.22, -0.9 + Math.sin(Math.random() * 6.28) * (D.millR + 0.05), {
        max: 0.8, base: 0.14, vx: (Math.random() - 0.5) * 0.5, vy: 0.25, vz: (Math.random() - 0.5) * 0.5,
        opacity: 0.5, tint: 0xE8DCB8, grow: 1.7
      });
    }
    if (st.omega > 0.4 && Math.random() < 0.03) {
      MECH.Scene3D.spawnPuff(-2.0, D.waterY + 0.12, 1.3, {
        max: 1.0, base: 0.26, vx: 1.1, vy: 0.05, vz: 0, opacity: 0.4, tint: 0x9FD4E8, grow: 1.3
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup") {
      pill = ph.name + " · " + (st.omega / (2 * Math.PI) * 60).toFixed(1) + " RPM";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: (st.omega / (2 * Math.PI) * 60).toFixed(1) + " RPM",
      b: "出粉 " + st.flour,
      c: "直驱 1:1"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheel") return [{ id: "p-w", obj: E("wheel"), text: "立轮 R 1.15 · 入水 0.25" }];
    if (ph.id === "mill") return [
      { id: "p-m", obj: E("mill"), text: "上磨旋转 · 磨齿 8 道" },
      { id: "p-b", obj: E("basemill"), text: "下磨固定", tone: "white" }
    ];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup" || ph.id === "summary") return [
      { id: "p-a", obj: E("axle"), text: "立轴直驱 1:1 · 磨速=轮速", tone: "white" },
      { id: "p-w", obj: E("wheel"), text: "水轮驱动" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
