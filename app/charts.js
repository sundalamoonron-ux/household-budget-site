// charts.js — grafik SVG yang digambar langsung oleh situs, tanpa pustaka luar.
// Dipakai di Beranda (donat pengeluaran per kategori) dan Laporan (batang bulanan).

import { shortRupiah } from './store.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Donat: slices = [{ name, value, color }]. Mengembalikan string SVG + legenda.
export function donut(slices, size = 190) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  if (total <= 0) {
    return `<p class="hint">Belum ada pengeluaran bulan ini — tambahkan transaksi untuk melihat donatnya.</p>`;
  }
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const hole = r * 0.62;
  let offset = 0;
  const parts = [];
  for (const s of slices) {
    if (s.value <= 0) continue;
    const frac = s.value / total;
    const a0 = offset * Math.PI * 2 - Math.PI / 2;
    const a1 = (offset + frac) * Math.PI * 2 - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    // Irisan tipis digambar sebagai garis tebal melengkung agar sambungannya rapi.
    if (frac >= 0.999) {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r - (r - hole) / 2}" fill="none" stroke="${s.color}" stroke-width="${r - hole}"/>`);
    } else {
      parts.push(`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${s.color}" stroke-width="${r - hole}"/>`);
    }
    offset += frac;
  }
  const legend = slices
    .filter((s) => s.value > 0)
    .map(
      (s) => `<li><span class="dot" style="background:${s.color}"></span>${esc(s.name)}<span class="pct">${Math.round((s.value / total) * 100)}%</span><span class="amt num">${shortRupiah(s.value)}</span></li>`,
    )
    .join('');
  return `<div class="donut-wrap">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Donat pengeluaran per kategori">
      ${parts.join('')}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="13" fill="#6b756e">Total keluar</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="16" font-weight="700" fill="#22312a">${shortRupiah(total)}</text>
    </svg>
    <ul class="legend">${legend}</ul>
  </div>`;
}

// Batang bulanan: months = [{ label, income, spent }].
export function monthBars(months) {
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spent)), 1);
  const cols = months
    .map((m) => {
      const hi = Math.max(4, Math.round((m.income / max) * 150));
      const hs = Math.max(4, Math.round((m.spent / max) * 150));
      return `<div class="col" style="flex:1">
        <span class="v num">${shortRupiah(m.income)}</span>
        <div style="display:flex;gap:4px;align-items:flex-end;height:150px">
          <div class="b" style="height:${hi}px" title="Pemasukan ${m.label}"></div>
          <div class="b spend" style="height:${hs}px" title="Pengeluaran ${m.label}"></div>
        </div>
        <span class="m">${esc(m.label)}</span>
      </div>`;
    })
    .join('');
  return `<div class="barchart" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir">${cols}</div>
  <p class="chart-legend"><span><span class="swatch" style="background:#2f7d6b"></span>Pemasukan</span><span><span class="swatch" style="background:#e9a13b"></span>Pengeluaran</span></p>`;
}
