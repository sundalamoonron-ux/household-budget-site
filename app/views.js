// views.js — HTML tiap halaman RumahAnggaran, dibangun dari keadaan di store.js.
// Semua angka dihitung dari data, bukan ditulis tangan di template.

import { HOUSEHOLD, CATEGORIES, INCOME_SOURCES } from './data.js';
import {
  budgetStatus,
  budgetTotal,
  categoryById,
  goalsTotal,
  monthlySummary,
  rupiah,
  shortRupiah,
  spentByCategory,
  totals,
} from './store.js';
import { donut, monthBars } from './charts.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fmtDate = (d) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

function txRow(t) {
  const cat = t.type === 'in' ? null : categoryById(t.category);
  const label =
    t.type === 'in'
      ? INCOME_SOURCES.find((s) => s.id === t.source)?.name || 'Pemasukan'
      : cat.name;
  const tag = t.type === 'in' ? '<span class="tag in">Masuk</span>' : '<span class="tag out">Keluar</span>';
  return `<tr>
    <td class="num">${fmtDate(t.date)}</td>
    <td>${esc(t.desc)}<br><span class="hint">${esc(label)}</span></td>
    <td class="hide-m">${tag}</td>
    <td class="num ${t.type === 'in' ? 'pos' : 'neg'}">${t.type === 'in' ? '+' : '−'}${rupiah(t.amount)}</td>
    <td><button type="button" class="linklike" data-delete-tx="${esc(t.id)}">Hapus</button></td>
  </tr>`;
}

export function dashboard(state) {
  const t = totals(state);
  const spent = spentByCategory(state);
  const slices = CATEGORIES.map((c) => ({ name: c.name, value: spent[c.id] || 0, color: c.color })).filter(
    (s) => s.value > 0,
  );
  const budgets = budgetStatus(state);
  const over = budgets.filter((b) => b.over);
  const goals = goalsTotal(state);
  const recent = [...state.transactions]
    .filter((x) => x.date.startsWith('2026-11'))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
  const savingRate = t.income > 0 ? Math.round((t.left / t.income) * 100) : 0;

  return `<h1>Beranda Anggaran — ${esc(HOUSEHOLD.monthLabel)}</h1>
<p class="lede">Halo, ${esc(HOUSEHOLD.name)} (${esc(HOUSEHOLD.members)}). Ini ringkasan uang keluarga bulan ini: berapa yang masuk, ke mana larinya, dan berapa yang tersisa.</p>

<div class="grid3">
  <div class="card stat"><div class="label">Pemasukan bulan ini</div><div class="value pos">${rupiah(t.income)}</div><div class="note">Gaji + usaha sampingan + lain-lain</div></div>
  <div class="card stat"><div class="label">Pengeluaran bulan ini</div><div class="value neg">${rupiah(t.spent)}</div><div class="note">${t.count} transaksi tercatat</div></div>
  <div class="card stat"><div class="label">Sisa untuk ditabung</div><div class="value">${rupiah(t.left)}</div><div class="note">Sekitar ${savingRate}% dari pemasukan</div></div>
</div>

<div class="grid2">
  <section class="card">
    <h2>Ke mana uang pergi?</h2>
    ${donut(slices)}
    <p class="hint">Belanja harian masih yang terbesar — wajar untuk keluarga empat orang. <a href="#/laporan">Lihat laporan 6 bulan</a>.</p>
  </section>
  <section class="card">
    <h2>Anggaran bulan ini</h2>
    ${over.length ? `<p class="msg err">⚠ ${over.length} kategori sudah lewat anggaran: ${over.map((b) => esc(b.name)).join(', ')}.</p>` : `<p class="msg ok">Semua kategori masih dalam anggaran. Pertahankan!</p>`}
    ${budgets
      .slice(0, 5)
      .map(
        (b) => `<div class="budget-row">
      <div class="rowhead"><b>${esc(b.icon)} ${esc(b.name)}</b><span class="pct">${b.pct}% dari ${shortRupiah(b.budget)}</span></div>
      <div class="bar${b.over ? ' over' : b.pct >= 80 ? ' warn' : ''}"><i style="width:${Math.min(100, b.pct)}%"></i></div>
      <div class="rowfoot"><span>Terpakai ${rupiah(b.used)}</span><span>${b.over ? 'Lewat ' + rupiah(-b.left) : 'Sisa ' + rupiah(b.left)}</span></div>
    </div>`,
      )
      .join('')}
    <p><a class="btn ghost small" href="#/anggaran">Atur semua anggaran &rarr;</a></p>
  </section>
</div>

<div class="grid2">
  <section class="card">
    <h2>Transaksi terbaru</h2>
    <table>
      <thead><tr><th>Tanggal</th><th>Keterangan</th><th class="hide-m">Jenis</th><th class="num">Jumlah</th><th></th></tr></thead>
      <tbody>${recent.map(txRow).join('')}</tbody>
    </table>
    <p><a class="btn ghost small" href="#/transaksi">Semua transaksi &rarr;</a></p>
  </section>
  <section class="card">
    <h2>Tujuan tabungan</h2>
    <p class="note">Total terkumpul <strong class="num">${rupiah(goals.saved)}</strong> dari target <strong class="num">${rupiah(goals.target)}</strong> (${goals.pct}%).</p>
    <div class="bar"><i style="width:${goals.pct}%"></i></div>
    <p style="margin-top:10px">Tujuan terdekat: <strong>${esc(state.goals[0].name)}</strong> — kurang ${rupiah(Math.max(0, state.goals[0].target - state.goals[0].saved))} lagi.</p>
    <p><a class="btn ghost small" href="#/tujuan">Lihat semua tujuan &rarr;</a></p>
    <p class="hint">Tips: sisihkan tabungan di awal gajian, bukan dari sisa. <a href="#/panduan">Baca panduan 50/30/20</a>.</p>
  </section>
</div>`;
}

export function transactionsPage(state, filter = {}) {
  const all = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const q = (filter.q || '').toLowerCase();
  const shown = all.filter((t) => {
    if (filter.type && t.type !== filter.type) return false;
    if (filter.cat && t.category !== filter.cat) return false;
    if (q && !t.desc.toLowerCase().includes(q)) return false;
    return true;
  });
  const t = totals(state);
  const catOptions = CATEGORIES.map(
    (c) => `<option value="${c.id}"${filter.cat === c.id ? ' selected' : ''}>${esc(c.name)}</option>`,
  ).join('');

  return `<h1>Transaksi</h1>
<p class="lede">Semua pemasukan dan pengeluaran ${esc(HOUSEHOLD.monthLabel)}. Tambah transaksi baru di bawah — langsung masuk ke hitungan beranda, anggaran, dan laporan.</p>

<section class="card">
  <h2>Tambah transaksi</h2>
  <form id="add-tx">
    <div class="formgrid">
      <div class="field"><label for="f-type">Jenis</label>
        <select id="f-type" name="type"><option value="out">Pengeluaran</option><option value="in">Pemasukan</option></select></div>
      <div class="field"><label for="f-date">Tanggal</label>
        <input type="date" id="f-date" name="date" value="2026-11-26" required></div>
      <div class="field"><label for="f-desc">Keterangan</label>
        <input type="text" id="f-desc" name="desc" placeholder="cth. Belanja mingguan — Pasar Minggu" required maxlength="120"></div>
      <div class="field"><label for="f-amount">Jumlah (Rp)</label>
        <input type="number" id="f-amount" name="amount" min="1000" step="500" placeholder="cth. 250000" required></div>
      <div class="field" id="cat-field"><label for="f-cat">Kategori</label>
        <select id="f-cat" name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field" id="src-field" hidden><label for="f-src">Sumber pemasukan</label>
        <select id="f-src" name="source">${INCOME_SOURCES.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    </div>
    <button class="btn" type="submit">Simpan transaksi</button>
    <span class="hint" id="add-tx-msg" role="status"></span>
  </form>
</section>

<section class="card">
  <h2>Daftar transaksi <span class="hint">(${shown.length} dari ${all.length})</span></h2>
  <form id="filter-tx" class="toolbar">
    <div class="field"><label for="flt-q">Cari</label><input type="text" id="flt-q" name="q" value="${esc(filter.q || '')}" placeholder="cth. pasar, gojek…"></div>
    <div class="field"><label for="flt-type">Jenis</label>
      <select id="flt-type" name="type"><option value="">Semua</option><option value="in"${filter.type === 'in' ? ' selected' : ''}>Pemasukan</option><option value="out"${filter.type === 'out' ? ' selected' : ''}>Pengeluaran</option></select></div>
    <div class="field"><label for="flt-cat">Kategori</label>
      <select id="flt-cat" name="cat"><option value="">Semua kategori</option>${catOptions}</select></div>
    <button class="btn ghost" type="submit">Saring</button>
  </form>
  <table style="margin-top:14px">
    <thead><tr><th>Tanggal</th><th>Keterangan</th><th class="hide-m">Jenis</th><th class="num">Jumlah</th><th></th></tr></thead>
    <tbody>${shown.map(txRow).join('') || '<tr><td colspan="5">Tidak ada transaksi yang cocok dengan saringan.</td></tr>'}</tbody>
  </table>
  <p class="hint">Total bulan ini: masuk <strong class="pos num">${rupiah(t.income)}</strong> · keluar <strong class="neg num">${rupiah(t.spent)}</strong> · sisa <strong class="num">${rupiah(t.left)}</strong>.</p>
</section>`;
}

export function budgetPage(state) {
  const rows = budgetStatus(state);
  const total = budgetTotal(state);
  const t = totals(state);
  const over = rows.filter((b) => b.over);
  return `<h1>Anggaran Bulanan</h1>
<p class="lede">Tentukan batas belanja tiap kategori untuk ${esc(HOUSEHOLD.monthLabel)}. Total anggaran saat ini <strong class="num">${rupiah(total)}</strong> dari pemasukan <strong class="num">${rupiah(t.income)}</strong> — ${total <= t.income ? 'masih di bawah pemasukan, bagus.' : 'melebihi pemasukan! Kurangi salah satu kategori.'}</p>
${over.length ? `<p class="msg err">⚠ ${over.map((b) => `${esc(b.name)} lewat ${rupiah(-b.left)}`).join(' · ')}</p>` : ''}
<section class="card">
  <h2>Ubah anggaran</h2>
  <form id="budget-form">
    ${rows
      .map(
        (b) => `<div class="field"><label for="b-${b.id}">${esc(b.icon)} ${esc(b.name)} — terpakai ${rupiah(b.used)} (${b.pct}%)</label>
      <input type="number" id="b-${b.id}" name="${b.id}" min="0" step="50000" value="${b.budget}"></div>`,
      )
      .join('')}
    <button class="btn" type="submit">Simpan anggaran</button>
    <span class="hint" id="budget-msg" role="status"></span>
  </form>
</section>
<section class="card">
  <h2>Ringkasan per kategori</h2>
  ${rows
    .map(
      (b) => `<div class="budget-row">
    <div class="rowhead"><b>${esc(b.icon)} ${esc(b.name)}</b><span class="pct">${b.pct}% dari ${shortRupiah(b.budget)}</span></div>
    <div class="bar${b.over ? ' over' : b.pct >= 80 ? ' warn' : ''}"><i style="width:${Math.min(100, b.pct)}%"></i></div>
    <div class="rowfoot"><span>Terpakai ${rupiah(b.used)}</span><span>${b.over ? 'Lewat ' + rupiah(-b.left) : 'Sisa ' + rupiah(b.left)}</span></div>
  </div>`,
    )
    .join('')}
</section>
<div class="tip"><b>Cara memakai anggaran:</b> tetapkan batas di awal bulan, catat setiap pengeluaran, dan cek halaman ini tiap minggu. Kategori yang lewat dua bulan berturut-turut tandanya batasnya perlu dinaikkan — atau pengeluarannya yang ditekan.</div>`;
}

export function goalsPage(state) {
  const g = goalsTotal(state);
  return `<h1>Tujuan Tabungan</h1>
<p class="lede">Tabungan bukan sisa belanja — tabungan adalah pos pertama. Total terkumpul <strong class="num">${rupiah(g.saved)}</strong> dari <strong class="num">${rupiah(g.target)}</strong> (${g.pct}%).</p>
<div class="grid2">
${state.goals
  .map((goal) => {
    const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
    const rest = Math.max(0, goal.target - goal.saved);
    return `<div class="goal">
      <h3>${esc(goal.name)}</h3>
      <p class="hint">${esc(goal.note)}</p>
      <div class="bar"><i style="width:${Math.min(100, pct)}%"></i></div>
      <div class="meta"><span>Terkumpul <strong class="num">${rupiah(goal.saved)}</strong></span><span>Target <strong class="num">${rupiah(goal.target)}</strong> · ${pct}%</span></div>
      <p class="hint">${rest > 0 ? 'Kurang ' + rupiah(rest) + ' lagi.' : '🎉 Target tercapai!'}</p>
      <form class="addfund" data-goal="${esc(goal.id)}">
        <label class="hint" for="fund-${esc(goal.id)}" style="position:absolute;left:-9999px">Tambah dana ${esc(goal.name)}</label>
        <input type="number" id="fund-${esc(goal.id)}" name="amount" min="10000" step="10000" placeholder="Tambah Rp…" required>
        <button class="btn amber small" type="submit">Tambah dana</button>
      </form>
    </div>`;
  })
  .join('')}
</div>
<section class="card">
  <h2>Buat tujuan baru</h2>
  <form id="add-goal">
    <div class="formgrid">
      <div class="field"><label for="g-name">Nama tujuan</label><input type="text" id="g-name" name="name" placeholder="cth. Renovasi dapur" required maxlength="80"></div>
      <div class="field"><label for="g-target">Target (Rp)</label><input type="number" id="g-target" name="target" min="100000" step="50000" placeholder="cth. 10000000" required></div>
      <div class="field"><label for="g-saved">Sudah terkumpul (Rp)</label><input type="number" id="g-saved" name="saved" min="0" step="50000" value="0"></div>
      <div class="field"><label for="g-note">Catatan</label><input type="text" id="g-note" name="note" placeholder="cth. Target akhir 2027" maxlength="140"></div>
    </div>
    <button class="btn" type="submit">Buat tujuan</button>
    <span class="hint" id="goal-msg" role="status"></span>
  </form>
</section>`;
}

export function calculatorPage(state) {
  const t = totals(state);
  const income = t.income;
  const needsSpent = ['belanja', 'tagihan', 'transport', 'pendidikan', 'kesehatan']
    .reduce((a, id) => a + (spentByCategory(state)[id] || 0), 0);
  const need = Math.round(income * 0.5);
  const want = Math.round(income * 0.3);
  const save = Math.round(income * 0.2);
  return `<h1>Kalkulator Anggaran</h1>
<p class="lede">Dua alat hitung cepat untuk keluarga: aturan 50/30/20 dan perencana dana darurat. Angka awal diambil dari pemasukan bulan ini (<strong class="num">${rupiah(income)}</strong>) — ubah angkanya dan hasilnya ikut berubah.</p>

<section class="card">
  <h2>Aturan 50/30/20</h2>
  <p>Dari setiap pemasukan: <strong>50%</strong> kebutuhan, <strong>30%</strong> keinginan, <strong>20%</strong> tabungan &amp; bayar utang.</p>
  <form id="calc-503020">
    <div class="field"><label for="c-income">Pemasukan bulanan (Rp)</label>
      <input type="number" id="c-income" name="income" min="0" step="100000" value="${income}"></div>
    <button class="btn" type="submit">Hitung</button>
  </form>
  <div id="calc-result" style="margin-top:16px">
    <div class="grid3">
      <div class="card stat"><div class="label">50% — Kebutuhan</div><div class="value num" id="c-need">${rupiah(need)}</div><div class="note">Belanja, tagihan, transport, sekolah</div></div>
      <div class="card stat"><div class="label">30% — Keinginan</div><div class="value num" id="c-want">${rupiah(want)}</div><div class="note">Makan di luar, hiburan, jajan</div></div>
      <div class="card stat"><div class="label">20% — Tabungan</div><div class="value num" id="c-save">${rupiah(save)}</div><div class="note">Dana darurat, tujuan, investasi</div></div>
    </div>
    <p class="hint" id="c-compare">Bandingkan dengan kenyataan bulan ini: kebutuhan keluarga Mahesa (belanja, tagihan, transport, sekolah, kesehatan) ${rupiah(needsSpent)} dari pemasukan ${rupiah(t.income)} — lihat <a href="#/laporan">laporan</a> untuk rinciannya.</p>
  </div>
</section>

<section class="card">
  <h2>Perencana dana darurat</h2>
  <p>Dana darurat ideal = <strong>6 × pengeluaran pokok bulanan</strong>. Hitung berapa bulan lagi targetmu tercapai.</p>
  <form id="calc-emergency">
    <div class="formgrid">
      <div class="field"><label for="e-monthly">Pengeluaran pokok per bulan (Rp)</label>
        <input type="number" id="e-monthly" name="monthly" min="0" step="100000" value="7500000"></div>
      <div class="field"><label for="e-saved">Sudah terkumpul (Rp)</label>
        <input type="number" id="e-saved" name="saved" min="0" step="100000" value="9800000"></div>
      <div class="field"><label for="e-setaside">Disisihkan per bulan (Rp)</label>
        <input type="number" id="e-setaside" name="setaside" min="0" step="50000" value="1000000"></div>
    </div>
    <button class="btn" type="submit">Hitung</button>
  </form>
  <p id="emergency-result" class="msg ok" style="margin-top:14px">Target dana darurat: <strong class="num">Rp45.000.000</strong> (6 × Rp7.500.000). Kurang Rp35.200.000 lagi — dengan sisihan Rp1.000.000/bulan, tercapai dalam <strong>36 bulan</strong>.</p>
</section>`;
}

export function reportPage(state) {
  const months = monthlySummary(state);
  const t = totals(state);
  const spent = spentByCategory(state);
  const rows = CATEGORIES.map((c) => ({ ...c, used: spent[c.id] || 0 }))
    .sort((a, b) => b.used - a.used);
  const best = months.reduce((a, m) => (m.income - m.spent > a.income - a.spent ? m : a), months[0]);
  const avgSpent = Math.round(months.reduce((a, m) => a + m.spent, 0) / months.length);
  return `<h1>Laporan — Enam Bulan Terakhir</h1>
<p class="lede">Juni sampai ${esc(HOUSEHOLD.monthLabel)}. Bulan dengan sisa terbesar: <strong>${esc(best.label)} 2026</strong> (sisa ${rupiah(best.income - best.spent)}). Rata-rata pengeluaran: <strong class="num">${rupiah(avgSpent)}</strong>/bulan.</p>
<section class="card">
  <h2>Pemasukan vs pengeluaran</h2>
  ${monthBars(months)}
  <p><button class="btn ghost small" type="button" id="export-csv">Unduh laporan (CSV)</button> <span class="hint" id="csv-msg" role="status"></span></p>
</section>
<section class="card">
  <h2>Pengeluaran ${esc(HOUSEHOLD.monthLabel)} per kategori</h2>
  <table>
    <thead><tr><th>Kategori</th><th class="num">Jumlah</th><th class="num">Bagian</th><th class="num">Anggaran</th></tr></thead>
    <tbody>
    ${rows
      .map((c) => {
        const pct = t.spent > 0 ? Math.round((c.used / t.spent) * 100) : 0;
        return `<tr><td>${esc(c.icon)} ${esc(c.name)}</td><td class="num">${rupiah(c.used)}</td><td class="num">${pct}%</td><td class="num">${rupiah(state.budgets[c.id] || 0)}</td></tr>`;
      })
      .join('')}
    <tr><td><strong>Total</strong></td><td class="num"><strong>${rupiah(t.spent)}</strong></td><td class="num"><strong>100%</strong></td><td class="num"><strong>${rupiah(budgetTotal(state))}</strong></td></tr>
    </tbody>
  </table>
</section>
<div class="tip"><b>Yang bisa diperbaiki bulan depan:</b> kategori Makan di Luar sudah Rp400.500 (50% anggaran) padahal bulan masih berjalan — masak di rumah dua kali seminggu bisa menghemat sekitar Rp300.000.</div>`;
}

export function guidePage() {
  return `<h1>Panduan Anggaran Rumah Tangga</h1>
<p class="lede">Lima langkah yang dipakai keluarga Mahesa — dan bisa dipakai keluargamu juga. Tanpa jargon, tanpa aplikasi berbayar.</p>
<ol class="steps">
  <li><strong>Catat dulu, atur belakangan.</strong> Selama dua minggu, tulis semua pengeluaran apa adanya di <a href="#/transaksi">halaman Transaksi</a>. Kebanyakan keluarga kaget melihat ke mana larinya Rp500 ribu pertama.</li>
  <li><strong>Pisahkan kebutuhan dan keinginan.</strong> Kebutuhan: belanja, tagihan, transport, sekolah, kesehatan. Keinginan: makan di luar, hiburan, jajan. Aturan 50/30/20 di <a href="#/kalkulator">Kalkulator</a> memberi patokan awal yang sehat.</li>
  <li><strong>Tetapkan anggaran per kategori.</strong> Di <a href="#/anggaran">halaman Anggaran</a>, isi batas tiap kategori dari data dua minggu tadi — bukan dari angan-angan. Anggaran yang terlalu ketat pasti dilanggar.</li>
  <li><strong>Bayar diri sendiri dulu.</strong> Begitu gaji masuk, pindahkan tabungan ke rekening terpisah. Di <a href="#/tujuan">Tujuan Tabungan</a>, keluarga Mahesa menabung Rp1.000.000 tiap bulan untuk dana darurat sebelum belanja apa pun.</li>
  <li><strong>Tinjau tiap minggu, 10 menit saja.</strong> Buka <a href="#/laporan">Laporan</a> tiap Minggu malam. Satu kategori lewat anggaran bukan kegagalan — itu sinyal untuk menyesuaikan minggu berikutnya.</li>
</ol>
<section class="card">
  <h2>Pertanyaan yang sering ditanya</h2>
  <h3>Berapa dana darurat yang cukup?</h3>
  <p>Enam kali pengeluaran pokok bulanan. Kalau pengeluaran pokokmu Rp7.500.000, targetnya Rp45.000.000. Hitung punyamu di <a href="#/kalkulator">Kalkulator dana darurat</a>.</p>
  <h3>Apakah data saya dikirim ke mana-mana?</h3>
  <p>Tidak. Semua data hanya tersimpan di peramban perangkatmu (localStorage). Tidak ada akun, tidak ada server, tidak ada iklan.</p>
  <h3>Bagaimana kalau saya salah mencatat?</h3>
  <p>Buka <a href="#/transaksi">Transaksi</a>, tekan “Hapus” pada baris yang salah, lalu catat ulang. Anggaran bisa diubah kapan saja di <a href="#/anggaran">halaman Anggaran</a>.</p>
  <h3>Kenapa anggaran saya selalu jebol di Belanja Harian?</h3>
  <p>Tiga penyebab paling umum: belanja tanpa daftar, terlalu sering ke minimarket, dan harga bahan pokok naik. Coba belanja mingguan sekali jalan dengan daftar, seperti yang dilakukan keluarga Mahesa — pengeluaran mereka turun dari Rp3,4 juta ke Rp2,8 juta.</p>
</section>`;
}

export function missing() {
  return `<h1>Halaman tidak ditemukan</h1>
<p>Halaman yang kamu cari tidak ada di RumahAnggaran. Coba salah satu halaman ini:</p>
<p><a href="#/">Beranda</a> · <a href="#/transaksi">Transaksi</a> · <a href="#/anggaran">Anggaran</a> · <a href="#/tujuan">Tujuan Tabungan</a> · <a href="#/kalkulator">Kalkulator</a> · <a href="#/laporan">Laporan</a> · <a href="#/panduan">Panduan</a></p>`;
}
