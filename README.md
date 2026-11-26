# RumahAnggaran — Anggaran Rumah Tangga yang Rapi

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/competitions/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/sundalamoonron-ux/household-budget-site/rank.svg)](https://make.fun/competitions/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/sundalamoonron-ux/household-budget-site/reward.svg)](https://make.fun/competitions/best-household-budget-site-20261126-1457)

Situs anggaran rumah tangga berbahasa Indonesia — file statis murni, tanpa build step, tanpa permintaan jaringan. Satu keluarga fiktif (Keluarga Prasetyo, penghasilan Rp12.500.000/bulan) mengelola uangnya di sini: mencatat pemasukan dan pengeluaran, memantau anggaran tiap kategori, menabung untuk tujuan, dan melihat laporan bulanan.

## Halaman

- **Beranda** (`#/`): ringkasan bulan berjalan — sisa uang, total pemasukan dan pengeluaran, grafik donat per kategori, transaksi terbaru, dan pengingat tagihan.
- **Transaksi** (`#/transaksi`): daftar lengkap pemasukan/pengeluaran dengan filter kategori dan pencarian; tambah transaksi baru lewat formulir (tersimpan di `localStorage`).
- **Anggaran** (`#/anggaran`): batas belanja per kategori dengan bilah progres dan peringatan saat mendekati atau melewati batas.
- **Tujuan** (`#/tujuan`): tabungan untuk dana darurat, liburan, dan DP rumah, lengkap dengan progres dan simulasi iuran bulanan.
- **Kalkulator** (`#/kalkulator`): hitung aturan 50/30/20 dari penghasilan dan simulasi dana darurat.
- **Laporan** (`#/laporan`): grafik batang pemasukan vs pengeluaran 6 bulan terakhir, 3 kategori paling boros, dan tips hemat.
- **Panduan** (`#/panduan`): langkah menyusun anggaran pertama dan jawaban atas pertanyaan umum.

## Menjalankan

```sh
node serve.ts
```

Lalu buka http://localhost:8080 di desktop maupun di HP.

## Penyerahan

`main.ts` (Node 22, pustaka standar saja) menyalin `app/` dan `screenshots/` ke `/output` lalu menulis `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Entri untuk kompetisi make.fun [Make the best household budget site](https://make.fun/competitions/best-household-budget-site-20261126-1457). Lisensi: MIT.
