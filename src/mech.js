/* 水磨 — 尺寸常量与立轮直驱运动学
   文献依据:王祯《农书》水磨图(「水轮三事」变制之一):立式水轮下缘入水,
   同轴直驱上磨盘旋于下磨盘;周长比 1:1,磨速=轮速(载入断言)。
   面粉产出率 ∝ ω·磨径(示磨齿有效接触弧)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    R: 1.15,               // 立轮半径
    yC: 1.42,              // 轮/磨轴高
    axleL: 1.7,
    millR: 0.55,           // 磨盘半径
    millGap: 0.10,         // 上下磨间距
    flourRate: 2.4,        // 满速面粉粒率(视觉)
    k: { slow: 0.85, fast: 1.5 },
    waterY: 0.28
  };
  D.yC = D.waterY + D.R - 0.25 + 0.25;
  D.millY = D.yC - D.millGap / 2 - 0.05;

  function newState() {
    return {
      time: 0, phi: 0, omega: 0, omegaTarget: 0,
      flour: 0, puffs: 0,
      lastPhase: "", manual: false, _keyL: false, _keyR: false
    };
  }

  function step(st, dt) {
    st.omega += (st.omegaTarget - st.omega) * Math.min(1, dt * 1.8);
    st.phi += st.omega * dt;
    st.time += dt;
    var rate = D.flourRate * (st.omega / D.k.fast);
    st._acc = (st._acc || 0) + rate * dt;
    while (st._acc >= 1) {
      st._acc -= 1;
      st.flour++;
      st.puffs++;
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  (function selfCheck() {
    var errs = [];
    if (D.yC - D.R > D.waterY) errs.push("轮下缘未入水");
    if (D.millR < D.R * 0.4) errs.push("磨盘过小");
    /* 15s 模拟:粉率随 ω 线性 */
    var st = newState();
    st.omegaTarget = D.k.fast;
    st.omega = D.k.fast;
    for (var i = 0; i < 450; i++) step(st, 1 / 30);
    var exp = Math.round(D.flourRate * 15);
    if (Math.abs(st.flour - exp) > 3) errs.push("粉率异常: " + st.flour + " vs " + exp);
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("水磨自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
