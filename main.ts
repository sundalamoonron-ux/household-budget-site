// RumahAnggaran — program penyerahan (Node 22, pustaka standar saja).
//
// Situsnya adalah file statis di app/ (tanpa build step): dibuka dari app/index.html
// dan bekerja tanpa jaringan. Program ini menyerahkan situs itu: menyalin app/ dan
// screenshots/ dari samping file ini ke /output, lalu menulis /output/dossier.json
// dengan pustaka make.fun yang divendor di vendor/makefun-frontend.ts — pustaka itu
// jangan diubah, karena scorer membangun ulang dossier dengan salinannya sendiri
// dan membandingkan byte demi byte.
//
// Di luar kontainer grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Batas yang dipakai scorer (lihat RULES.txt): teks dossier dibatasi 160 KiB,
// paling banyak 4 screenshot @ 256 KiB, app/ paling banyak 993 entri / 16 MiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
