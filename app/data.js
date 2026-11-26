// Data contoh RumahAnggaran: keluarga Mahesa (ayah, ibu, dua anak), November 2026.
// Semua angka dalam rupiah. Data ini hanya titik awal: pengguna bisa menambah,
// mengubah, dan menghapusnya dari situs, dan perubahannya tersimpan di localStorage.

export const HOUSEHOLD = {
  name: 'Keluarga Mahesa',
  members: 'Budi, Sari, dan dua anak',
  monthLabel: 'November 2026',
  monthKey: '2026-11',
};

export const CATEGORIES = [
  { id: 'belanja', name: 'Belanja Harian', color: '#2f7d6b', icon: '🛒' },
  { id: 'makan', name: 'Makan di Luar', color: '#e9a13b', icon: '🍜' },
  { id: 'transport', name: 'Transportasi', color: '#3d6e9e', icon: '🚌' },
  { id: 'tagihan', name: 'Tagihan & Utilitas', color: '#6d5a9e', icon: '💡' },
  { id: 'pendidikan', name: 'Pendidikan Anak', color: '#c4503a', icon: '🎒' },
  { id: 'kesehatan', name: 'Kesehatan', color: '#4a9e8a', icon: '🩺' },
  { id: 'hiburan', name: 'Hiburan', color: '#b07d3c', icon: '🎬' },
  { id: 'tabungan', name: 'Tabungan', color: '#1e5240', icon: '🐷' },
  { id: 'lain', name: 'Lain-lain', color: '#8a8f88', icon: '📦' },
];

export const INCOME_SOURCES = [
  { id: 'gaji', name: 'Gaji' },
  { id: 'usaha', name: 'Usaha Sampingan' },
  { id: 'lain-pemasukan', name: 'Pemasukan Lain' },
];

// Anggaran bulanan per kategori (rupiah).
export const SEED_BUDGETS = {
  belanja: 3000000,
  makan: 800000,
  transport: 1200000,
  tagihan: 1500000,
  pendidikan: 1500000,
  kesehatan: 600000,
  hiburan: 500000,
  tabungan: 2000000,
  lain: 400000,
};

// Transaksi contoh November 2026. type: 'in' pemasukan, 'out' pengeluaran.
export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', type: 'in', source: 'gaji', desc: 'Gaji Budi — PT Cahaya Bersama', amount: 9500000 },
  { id: 't02', date: '2026-11-01', type: 'out', category: 'tagihan', desc: 'Listrik PLN', amount: 486000 },
  { id: 't03', date: '2026-11-02', type: 'out', category: 'belanja', desc: 'Belanja mingguan — Pasar Minggu', amount: 612500 },
  { id: 't04', date: '2026-11-02', type: 'out', category: 'transport', desc: 'Bensin motor', amount: 120000 },
  { id: 't05', date: '2026-11-03', type: 'out', category: 'pendidikan', desc: 'SPP anak — SD Harapan Bangsa', amount: 750000 },
  { id: 't06', date: '2026-11-04', type: 'out', category: 'makan', desc: 'Makan siang keluarga — Warteg Bahari', amount: 98500 },
  { id: 't07', date: '2026-11-05', type: 'in', source: 'usaha', desc: 'Pesanan kue — Sari (12 loyang)', amount: 840000 },
  { id: 't08', date: '2026-11-05', type: 'out', category: 'belanja', desc: 'Indomaret — susu, telur, sabun', amount: 214300 },
  { id: 't09', date: '2026-11-06', type: 'out', category: 'transport', desc: 'Gojek — antar anak les', amount: 64000 },
  { id: 't10', date: '2026-11-07', type: 'out', category: 'hiburan', desc: 'Bioskop — 4 tiket + popcorn', amount: 268000 },
  { id: 't11', date: '2026-11-08', type: 'out', category: 'belanja', desc: 'Belanja mingguan — Pasar Minggu', amount: 548700 },
  { id: 't12', date: '2026-11-09', type: 'out', category: 'kesehatan', desc: 'Periksa gigi anak — Klinik Sehat', amount: 185000 },
  { id: 't13', date: '2026-11-10', type: 'out', category: 'tagihan', desc: 'Internet + TV kabel', amount: 385000 },
  { id: 't14', date: '2026-11-11', type: 'out', category: 'transport', desc: 'Servis motor + ganti oli', amount: 235000 },
  { id: 't15', date: '2026-11-12', type: 'in', source: 'usaha', desc: 'Pesanan kue — arisan RT 04', amount: 1160000 },
  { id: 't16', date: '2026-11-12', type: 'out', category: 'makan', desc: 'Makan malam — Ayam Geprek Sambal', amount: 127000 },
  { id: 't17', date: '2026-11-14', type: 'out', category: 'belanja', desc: 'Tokopedia — beras 10 kg + minyak', amount: 342000 },
  { id: 't18', date: '2026-11-15', type: 'out', category: 'pendidikan', desc: 'Buku + alat tulis anak', amount: 214000 },
  { id: 't19', date: '2026-11-16', type: 'out', category: 'tagihan', desc: 'Air PDAM', amount: 142000 },
  { id: 't20', date: '2026-11-17', type: 'out', category: 'belanja', desc: 'Belanja mingguan — Pasar Minggu', amount: 596400 },
  { id: 't21', date: '2026-11-18', type: 'out', category: 'lain', desc: 'Iuran RT + keamanan', amount: 150000 },
  { id: 't22', date: '2026-11-19', type: 'out', category: 'makan', desc: 'Jajan anak sekolah (seminggu)', amount: 175000 },
  { id: 't23', date: '2026-11-20', type: 'out', category: 'transport', desc: 'Bensin mobil', amount: 300000 },
  { id: 't24', date: '2026-11-21', type: 'out', category: 'tabungan', desc: 'Setoran tabungan pendidikan', amount: 1000000 },
  { id: 't25', date: '2026-11-22', type: 'in', source: 'lain-pemasukan', desc: 'Cashback & refund belanja', amount: 86000 },
  { id: 't26', date: '2026-11-23', type: 'out', category: 'belanja', desc: 'Belanja mingguan — Pasar Minggu', amount: 521800 },
  { id: 't27', date: '2026-11-24', type: 'out', category: 'kesehatan', desc: 'Vitamin + obat flu', amount: 96000 },
  { id: 't28', date: '2026-11-25', type: 'out', category: 'hiburan', desc: 'Langganan streaming keluarga', amount: 79000 },
];

// Tujuan tabungan keluarga.
export const SEED_GOALS = [
  { id: 'g1', name: 'Dana Darurat', target: 15000000, saved: 9800000, note: 'Enam kali pengeluaran pokok bulanan — bantalan kalau ada hal tak terduga.' },
  { id: 'g2', name: 'Liburan Keluarga ke Yogyakarta', target: 6000000, saved: 2350000, note: 'Berangkat Juni 2027: kereta, hotel 3 malam, dan jajan.' },
  { id: 'g3', name: 'DP Rumah Kedua', target: 50000000, saved: 12400000, note: 'Target 2028. Disisihkan Rp1.000.000 tiap bulan dari tabungan.' },
  { id: 'g4', name: 'Laptop Baru untuk Anak', target: 7500000, saved: 4100000, note: 'Untuk belajar dan tugas sekolah tahun ajaran baru.' },
];

// Ringkasan enam bulan terakhir (rupiah) untuk halaman laporan.
export const SEED_MONTHLY = [
  { key: '2026-06', label: 'Jun', income: 12100000, spent: 9840000 },
  { key: '2026-07', label: 'Jul', income: 12400000, spent: 10520000 },
  { key: '2026-08', label: 'Agu', income: 11800000, spent: 9600000 },
  { key: '2026-09', label: 'Sep', income: 12600000, spent: 10150000 },
  { key: '2026-10', label: 'Okt', income: 12300000, spent: 9930000 },
  { key: '2026-11', label: 'Nov', income: 11586000, spent: 0 }, // Nov dihitung dari transaksi
];
