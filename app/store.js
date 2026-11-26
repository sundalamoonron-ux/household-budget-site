// store.js — keadaan situs: memuat data contoh, menyimpan perubahan pengguna di
// localStorage, dan menghitung angka-angka yang ditampilkan di semua halaman.

import {
  CATEGORIES,
  SEED_BUDGETS,
  SEED_GOALS,
  SEED_MONTHLY,
  SEED_TRANSACTIONS,
} from './data.js';

const KEY = 'rumahanggaran-v1';

export function rupiah(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export function shortRupiah(n) {
  if (Math.abs(n) >= 1000000) return 'Rp' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (Math.abs(n) >= 1000) return 'Rp' + Math.round(n / 1000) + ' rb';
  return rupiah(n);
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, color: '#8a8f88', icon: '📦' };
}

function freshState() {
  return {
    budgets: { ...SEED_BUDGETS },
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    monthly: SEED_MONTHLY.map((m) => ({ ...m })),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Penyimpanan penuh atau diblokir: situs tetap jalan dengan data di memori.
  }
}

export function resetState() {
  localStorage.removeItem(KEY);
  return freshState();
}

// --- Perhitungan ---

export function monthTransactions(state, monthKey = '2026-11') {
  return state.transactions.filter((t) => t.date.startsWith(monthKey));
}

export function totals(state, monthKey = '2026-11') {
  const tx = monthTransactions(state, monthKey);
  let income = 0;
  let spent = 0;
  for (const t of tx) {
    if (t.type === 'in') income += t.amount;
    else spent += t.amount;
  }
  return { income, spent, left: income - spent, count: tx.length };
}

export function spentByCategory(state, monthKey = '2026-11') {
  const out = {};
  for (const t of monthTransactions(state, monthKey)) {
    if (t.type !== 'out') continue;
    out[t.category] = (out[t.category] || 0) + t.amount;
  }
  return out;
}

export function budgetTotal(state) {
  return Object.values(state.budgets).reduce((a, b) => a + b, 0);
}

// Status tiap kategori: anggaran, terpakai, persen, dan apakah lewat.
export function budgetStatus(state, monthKey = '2026-11') {
  const spent = spentByCategory(state, monthKey);
  return CATEGORIES.map((c) => {
    const budget = state.budgets[c.id] || 0;
    const used = spent[c.id] || 0;
    const pct = budget > 0 ? Math.round((used / budget) * 100) : 0;
    return { ...c, budget, used, pct, over: used > budget, left: budget - used };
  });
}

export function goalsTotal(state) {
  let saved = 0;
  let target = 0;
  for (const g of state.goals) {
    saved += g.saved;
    target += g.target;
  }
  return { saved, target, pct: target > 0 ? Math.round((saved / target) * 100) : 0 };
}

// Ringkasan bulanan untuk laporan; bulan berjalan dihitung dari transaksi.
export function monthlySummary(state) {
  const now = totals(state, '2026-11');
  return state.monthly.map((m) =>
    m.key === '2026-11' ? { ...m, income: now.income, spent: now.spent } : m,
  );
}

export function nextId(state) {
  return 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}
