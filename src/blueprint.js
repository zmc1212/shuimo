/* 图纸面板(B 键):水磨侧视总图 + 直驱详图 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = "rgba(42,38,32,0.4)";
    ctx.fillStyle = "rgba(42,38,32,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * dir, y2 - 3); ctx.lineTo(x2 - s * dir, y2 + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + s * dir, y1 - 3); ctx.lineTo(x1 + s * dir, y1 + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 10px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? (y1 + 13) : (y1 - 5));
  }

  MECH.BP = {
    no: "Fig. 09 · 复原总图",
    title: "水磨 · 立轮立轴直驱 · 上磨旋转",
    src: "王祯《农书》水磨图(「水轮三事」变制之一) · 直驱 1:1",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("立轮与上磨同轴 ⇒ 磨速 = 轮速(1:1)· 出粉率 ∝ ω × 磨径", w * 0.045, topY - 10);

      /* ============ 左:侧视图 ============ */
      var S = Math.min(w * 0.44 / 4.6, (chainY - topY - 26) / 3.4);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (m) { return ox + (m + 2.2) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE", ox, Y(3.2));
      /* 水面 */
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X(-3.0), Y(D.waterY)); ctx.lineTo(X(-0.3), Y(D.waterY)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 8px sans-serif";
      ctx.fillText("水流 →", X(-2.9), Y(D.waterY - 0.12));
      /* 立轮 */
      ctx.beginPath(); ctx.arc(X(-0.9), Y(D.yC), D.R * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-0.9), Y(D.yC), 0.11 * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(-0.9), Y(D.yC));
        ctx.lineTo(X(-0.9) + Math.cos(a) * D.R * S, Y(D.yC) - Math.sin(a) * D.R * S);
        ctx.stroke();
      }
      /* 立轴(水平 Z 向 → 侧视为点)+ 磨盘(侧视矩形) */
      ctx.strokeRect(X(-0.1), Y(D.yC + 0.08), 0.2 * S, 0.13 * S);
      ctx.strokeRect(X(-D.millR), Y(D.yC - D.millGap / 2 - 0.05), 2 * D.millR * S, 0.09 * S);
      ctx.strokeRect(X(-D.millR), Y(D.yC - D.millGap / 2 - 0.05 + 0.10), 2 * D.millR * S, 0.10 * S);
      ctx.fillText("上磨(转)", X(-D.millR), Y(D.yC - D.millGap / 2 - 0.05) - 5);
      ctx.fillText("下磨(定)", X(-D.millR), Y(D.yC - D.millGap / 2 - 0.05 + 0.10) + 14);
      /* 漏斗 */
      ctx.beginPath();
      ctx.moveTo(X(-0.08), Y(D.yC + 0.35));
      ctx.lineTo(X(0.08), Y(D.yC + 0.35));
      ctx.stroke();
      ctx.fillText("麦粒漏斗", X(0.10), Y(D.yC + 0.35));
      /* 尺寸 */
      arrow(ctx, X(-0.9) - D.R * S, Y(-0.05), X(-0.9) + D.R * S, Y(-0.05), "轮径 2.3m", true);
      arrow(ctx, X(D.millR), Y(D.yC - D.millGap / 2 - 0.05 + 0.25), X(-D.millR), Y(D.yC - D.millGap / 2 - 0.05 + 0.25), "磨径 1.1m", false);

      /* ============ 右:直驱详图 ============ */
      var ox2 = w * 0.55;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("直驱链 DRIVE(1:1)", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      var nodes = [["水流", "冲轮缘"], ["立轮", "R 1.15"], ["立轴", "同轴"], ["上磨", "R 0.55"]];
      for (var k = 0; k < 4; k++) {
        var x = gx + 14 + k * (gw - 28) / 3;
        var y = gy + gh / 2;
        ctx.strokeStyle = ink;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.font = "700 9px sans-serif";
        ctx.fillText(nodes[k][0], x - 10, y - 20);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(nodes[k][1], x - 12, y + 30);
        ctx.fillStyle = ink;
        if (k < 3) {
          ctx.beginPath(); ctx.moveTo(x + 15, y); ctx.lineTo(x + 14 + (gw - 28) / 3 - 14, y); ctx.stroke();
        }
      }
      ctx.fillStyle = red;
      ctx.font = "700 10px Menlo, monospace";
      ctx.fillText("ω磨 = ω轮(同轴无变速)", gx + 14, gy + 18);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["水流冲轮", "入水 0.25"], ["立轮 R1.15", "12 辐 8 叶"], ["立轴", "同轴直驱"],
        ["上磨旋转", "磨齿 8 道"], ["下磨固定", "磨膛研麦"], ["出粉", "率 ∝ ω·磨径"]
      ];
      var bwid = (w * 0.91) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.045 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.font = "700 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 20);
          ctx.lineTo(bx2 + bwid - 2, chainY + 20);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>轮与轴</h4><table>' +
      '<tr><th>立轮</th><td>R 1.15 · 12 辐 8 叶 · 入水 0.25</td><td>径 2.3 m</td></tr>' +
      '<tr><th>立轴</th><td>Ø 0.13 × 1.7</td><td>同轴直驱</td></tr>' +
      '</table><h4>磨盘</h4><table>' +
      '<tr><th>上磨(旋转)</th><td>R 0.55 · 磨齿 8 道</td><td>轴端悬置</td></tr>' +
      '<tr><th>下磨(固定)</th><td>R 0.60 · 磨膛研麦</td><td>间隙 0.10</td></tr>' +
      '<tr><th>传动比</th><td>同轴 1:1</td><td>磨速=轮速</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入模拟 15s:出粉累计与 ω·t 线性一致(±3 粒);轮下缘入水、磨径比例断言。</p>' +
      '<h4>文献</h4>' +
      '<p>王祯《农书》水磨图并「水轮三事」说——水轮兼供磨、砻、碾三用;《天工开物》亦有立轮直驱磨图。</p>'
  };
})(window.MECH = window.MECH || {});
