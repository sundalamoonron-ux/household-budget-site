// main.js — router dan penghubung RumahAnggaran: membaca hash, menggambar halaman
// dari views.js, lalu memasang semua kontrol (form, tombol, saringan) supaya berfungsi.

import { loadState, nextId, resetState, rupiah, saveState } from './store.js';
import {
  budgetPage,
  calculatorPage,
  dashboard,
  goalsPage,
  guidePage,
  missing,
  reportPage,
  transactionsPage,
} from './views.js';

const app = document.getElementById('app');
let state = loadState();
let txFilter = {};
// Pesan singkat yang bertahan melewati satu render ulang (form menyimpan lalu
// menggambar ulang halaman 600 ms kemudian).
let flash = null;

// window.__shotReady: false saat halaman dirender, true sesudahnya, supaya skrip
// screenshot tahu kapan halaman sudah tampil penuh.
function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  const route = hash.replace(/^#\/?/, '').split('?')[0];
  let html;
  let title;
  let nav = route || 'dashboard';
  if (route === '' || route === '/') {
    html = dashboard(state);
    title = 'RumahAnggaran — Anggaran Rumah Tangga yang Rapi';
    nav = 'dashboard';
  } else if (route === 'transaksi') {
    html = transactionsPage(state, txFilter);
    title = 'Transaksi | RumahAnggaran';
  } else if (route === 'anggaran') {
    html = budgetPage(state);
    title = 'Anggaran Bulanan | RumahAnggaran';
  } else if (route === 'tujuan') {
    html = goalsPage(state);
    title = 'Tujuan Tabungan | RumahAnggaran';
  } else if (route === 'kalkulator') {
    html = calculatorPage(state);
    title = 'Kalkulator Anggaran | RumahAnggaran';
  } else if (route === 'laporan') {
    html = reportPage(state);
    title = 'Laporan | RumahAnggaran';
  } else if (route === 'panduan') {
    html = guidePage(state);
    title = 'Panduan Anggaran | RumahAnggaran';
  } else {
    html = missing();
    title = 'Tidak ditemukan | RumahAnggaran';
    nav = '';
  }
  document.title = title;
  app.innerHTML = html;
  for (const a of document.querySelectorAll('[data-nav]')) {
    a.classList.toggle('active', a.dataset.nav === nav);
  }
  window.scrollTo(0, 0);
  wirePage(route);
  if (flash && flash.route === route) {
    setMsg(flash.id, flash.text);
    flash = null;
  }
  window.__shotReady = true;
}

function setMsg(id, text, ok = true) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
  void ok;
}

function wirePage(route) {
  // Hapus transaksi — tombol ada di Beranda dan Transaksi.
  app.querySelectorAll('[data-delete-tx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteTx;
      const tx = state.transactions.find((t) => t.id === id);
      if (!tx) return;
      if (!window.confirm(`Hapus transaksi "${tx.desc}" (${rupiah(tx.amount)})?`)) return;
      state.transactions = state.transactions.filter((t) => t.id !== id);
      saveState(state);
      render();
    });
  });

  if (route === 'transaksi') wireTransactions();
  else if (route === 'anggaran') wireBudget();
  else if (route === 'tujuan') wireGoals();
  else if (route === 'kalkulator') wireCalculator();
  else if (route === 'laporan') wireReport();
}

function wireTransactions() {
  const form = document.getElementById('add-tx');
  const typeSel = document.getElementById('f-type');
  const catField = document.getElementById('cat-field');
  const srcField = document.getElementById('src-field');
  const syncType = () => {
    const isIn = typeSel.value === 'in';
    catField.hidden = isIn;
    srcField.hidden = !isIn;
  };
  typeSel.addEventListener('change', syncType);
  syncType();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const type = data.get('type');
    const amount = Math.round(Number(data.get('amount')));
    const desc = String(data.get('desc') || '').trim();
    const date = String(data.get('date') || '2026-11-26');
    if (!desc || !amount || amount < 1000) {
      setMsg('add-tx-msg', 'Isi keterangan dan jumlah minimal Rp1.000.');
      return;
    }
    const tx = { id: nextId(state), date, type, desc, amount };
    if (type === 'in') tx.source = String(data.get('source'));
    else tx.category = String(data.get('category'));
    state.transactions.push(tx);
    saveState(state);
    flash = { route: 'transaksi', id: 'add-tx-msg', text: `✓ Tersimpan: ${desc} — ${rupiah(amount)}.` };
    setMsg('add-tx-msg', flash.text);
    form.reset();
    document.getElementById('f-date').value = '2026-11-26';
    syncType();
    // Gambar ulang daftar di bawah form tanpa pindah halaman.
    setTimeout(render, 600);
  });

  const filter = document.getElementById('filter-tx');
  filter.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(filter);
    txFilter = {
      q: String(data.get('q') || '').trim(),
      type: String(data.get('type') || ''),
      cat: String(data.get('cat') || ''),
    };
    render();
  });
}

function wireBudget() {
  const form = document.getElementById('budget-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    for (const [key, value] of data.entries()) {
      const n = Math.round(Number(value));
      if (Number.isFinite(n) && n >= 0) state.budgets[key] = n;
    }
    saveState(state);
    flash = { route: 'anggaran', id: 'budget-msg', text: '✓ Anggaran tersimpan.' };
    setMsg('budget-msg', flash.text);
    setTimeout(render, 600);
  });
}

function wireGoals() {
  app.querySelectorAll('form.addfund').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const goal = state.goals.find((g) => g.id === form.dataset.goal);
      if (!goal) return;
      const amount = Math.round(Number(new FormData(form).get('amount')));
      if (!amount || amount < 10000) return;
      goal.saved += amount;
      saveState(state);
      render();
    });
  });
  const form = document.getElementById('add-goal');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const target = Math.round(Number(data.get('target')));
    const saved = Math.round(Number(data.get('saved') || 0));
    if (!name || !target || target < 100000) {
      setMsg('goal-msg', 'Isi nama tujuan dan target minimal Rp100.000.');
      return;
    }
    state.goals.push({
      id: nextId(state),
      name,
      target,
      saved: Number.isFinite(saved) && saved >= 0 ? saved : 0,
      note: String(data.get('note') || '').trim(),
    });
    saveState(state);
    flash = { route: 'tujuan', id: 'goal-msg', text: `✓ Tujuan "${name}" dibuat.` };
    setMsg('goal-msg', flash.text);
    setTimeout(render, 600);
  });
}

function wireCalculator() {
  const form = document.getElementById('calc-503020');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const income = Math.round(Number(new FormData(form).get('income') || 0));
    document.getElementById('c-need').textContent = rupiah(income * 0.5);
    document.getElementById('c-want').textContent = rupiah(income * 0.3);
    document.getElementById('c-save').textContent = rupiah(income * 0.2);
  });

  const em = document.getElementById('calc-emergency');
  em.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(em);
    const monthly = Math.round(Number(data.get('monthly') || 0));
    const saved = Math.round(Number(data.get('saved') || 0));
    const setaside = Math.round(Number(data.get('setaside') || 0));
    const out = document.getElementById('emergency-result');
    if (!monthly || monthly <= 0) {
      out.textContent = 'Isi pengeluaran pokok bulanan dulu.';
      return;
    }
    const target = monthly * 6;
    const rest = Math.max(0, target - saved);
    if (rest === 0) {
      out.innerHTML = `🎉 Dana darurat sudah tercapai: <strong class="num">${rupiah(target)}</strong>.`;
      return;
    }
    if (!setaside || setaside <= 0) {
      out.innerHTML = `Target dana darurat: <strong class="num">${rupiah(target)}</strong>. Kurang <strong class="num">${rupiah(rest)}</strong> lagi — isi berapa yang bisa disisihkan tiap bulan untuk melihat waktunya.`;
      return;
    }
    const months = Math.ceil(rest / setaside);
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const when = years > 0 ? `${years} tahun ${rem} bulan` : `${months} bulan`;
    out.innerHTML = `Target dana darurat: <strong class="num">${rupiah(target)}</strong> (6 × ${rupiah(monthly)}). Kurang ${rupiah(rest)} lagi — dengan sisihan ${rupiah(setaside)}/bulan, tercapai dalam <strong>${when}</strong>.`;
  });
}

function wireReport() {
  const btn = document.getElementById('export-csv');
  btn.addEventListener('click', () => {
    const rows = [['Tanggal', 'Jenis', 'Kategori/Sumber', 'Keterangan', 'Jumlah (Rp)']];
    const sorted = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
    for (const t of sorted) {
      const cat =
        t.type === 'in'
          ? t.source || 'Pemasukan'
          : t.category || 'Lain-lain';
      rows.push([t.date, t.type === 'in' ? 'Masuk' : 'Keluar', cat, `"${t.desc.replace(/"/g, '""')}"`, String(t.amount)]);
    }
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-rumahanggaran-november-2026.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg('csv-msg', `✓ CSV diunduh (${sorted.length} transaksi).`);
  });
}

// Footer: kembalikan data contoh.
document.getElementById('reset-data').addEventListener('click', () => {
  if (!window.confirm('Kembalikan semua data ke contoh awal? Perubahanmu akan hilang.')) return;
  state = resetState();
  txFilter = {};
  render();
});

window.addEventListener('hashchange', render);
render();
