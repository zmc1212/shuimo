/* 仪表盘:①轮/磨转速 ②出粉累计曲线 ③传动链示意 ④磨盘俯视 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var flourHist = [];

  MECH.DASH = { panels: [
    { title: "SPEED · 轮磨转速", meta: "直驱 1:1", dot: "teal",
      html: '<div class="big" id="d-rpm">0</div><div class="k">RPM · 磨=轮</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>ω</span><b id="d-w">0.00 rad/s</b></div>',
      init: initSpd, draw: drawSpd },
    { title: "FLOUR · 出粉累计", meta: "率 ∝ ω", dot: "yellow",
      html: '<div class="big" id="d-flour">0</div><div class="k">粉粒(视觉)</div>' +
            '<canvas id="d-fc" style="width:100%;height:34px;display:block;border-radius:4px;margin-top:6px"></canvas>',
      init: initFlour, draw: drawFlour },
    { title: "DRIVE · 传动链", meta: "水→轮→轴→磨", dot: "blue", canvasH: 96, draw: drawDrive },
    { title: "TOP · 磨盘俯视", meta: "磨齿 8 道", dot: "green", canvasH: 96, draw: drawTop }
  ] };

  function initSpd(sec) {
    el.rpm = sec.querySelector("#d-rpm");
    el.bar = sec.querySelector("#d-bar");
    el.w = sec.querySelector("#d-w");
  }
  function initFlour(sec) {
    el.flour = sec.querySelector("#d-flour");
    el.fc = sec.querySelector("#d-fc");
    el._ctx = MECH.Dash.mkCanvas(el.fc, 34);
  }

  function drawSpd(st, ph, pt, ctx, w, h) {
    var rpm = st.omega / (2 * Math.PI) * 60;
    if (el.rpm) el.rpm.textContent = String(Math.round(rpm));
    if (el.bar) el.bar.style.width = Math.min(100, rpm / 15 * 100) + "%";
    if (el.w) el.w.textContent = st.omega.toFixed(2) + " rad/s";
  }

  function drawFlour(st, ph, pt, ctx, w, h) {
    if (el.flour) el.flour.textContent = String(st.flour);
    flourHist.push(st.flour);
    if (flourHist.length > 200) flourHist.shift();
    var c = el._ctx;
    if (!c) return;
    c.ctx.clearRect(0, 0, c.w, c.h);
    c.ctx.strokeStyle = "#E9C93C";
    c.ctx.lineWidth = 1.4;
    c.ctx.beginPath();
    var maxF = Math.max(1, flourHist[flourHist.length - 1]);
    for (var i = 0; i < flourHist.length; i++) {
      var px = i / 199 * c.w, py = c.h - flourHist[i] / maxF * (c.h - 4) - 2;
      if (i === 0) c.ctx.moveTo(px, py); else c.ctx.lineTo(px, py);
    }
    c.ctx.stroke();
  }

  /* ③ 传动链:水轮→轴→磨(三级转动件角标) */
  function drawDrive(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var nodes = [
      { x: 0.14, label: "立轮", r: 16, ang: st.phi, color: "#B08D57" },
      { x: 0.42, label: "立轴", r: 7, ang: st.phi, color: "#7FD8D8" },
      { x: 0.72, label: "上磨", r: 16, ang: st.phi, color: "#E9C93C" }
    ];
    nodes.forEach(function (n) {
      var cx = w * n.x, cy = h * 0.44;
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, n.r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(-n.ang) * n.r, cy + Math.sin(-n.ang) * n.r);
      ctx.stroke();
      ctx.fillStyle = soft;
      ctx.font = "700 8px serif";
      ctx.textAlign = "center";
      ctx.fillText(n.label, cx, cy + n.r + 12);
      if (n.x !== 0.72) {
        ctx.strokeStyle = "rgba(233,238,242,0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + n.r + 2, cy);
        ctx.lineTo(cx + w * 0.16 - 10, cy);
        ctx.stroke();
      }
    });
    ctx.fillStyle = "#E9C93C";
    ctx.font = "700 9px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("1:1", w * 0.56, h * 0.44 - 18);
  }

  /* ④ 磨盘俯视:磨齿旋转 + 出粉缘 */
  function drawTop(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, R = Math.min(cx, cy) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.35)";
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2 - st.phi;
      ctx.strokeStyle = "rgba(233,238,242,0.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.18, cy + Math.sin(a) * R * 0.18);
      ctx.lineTo(cx + Math.cos(a + 0.35) * R * 0.95, cy + Math.sin(a + 0.35) * R * 0.95);
      ctx.stroke();
    }
    ctx.strokeStyle = "#E9C93C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, st.phi, st.phi + 0.9);
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("磨齿 8 道 · 出粉缘(黄)", 4, 10);
    ctx.fillText("R 0.55", 4, h - 6);
  }
})(window.MECH = window.MECH || {});
