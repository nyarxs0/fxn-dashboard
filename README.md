# FxN Dashboard

🔗 **Live Demo (GitHub Pages, statis):** https://nyarxs0.github.io/fxn-dashboard/
📂 **Repo:** https://github.com/nyarxs0/fxn-dashboard

> Catatan: link Live Demo di atas aktif setelah GitHub Pages diaktifkan sekali secara manual di Settings > Pages (branch `main`, folder `/docs`). Lihat `DEPLOY.md` untuk detail.

Fullstack dashboard untuk belajar baca news market forex & dampaknya ke XAU/USD (gold), kalender bank sentral, dan data historis 30 hari.

## Struktur

```
fxn-dashboard/
├── server.js          # Express server + REST API (versi backend/self-host)
├── data/              # Sumber data JSON (kalender, rate, histori, sesi, dll)
├── public/            # Frontend fullstack (fetch ke API Express)
├── docs/              # Versi statis untuk GitHub Pages (fetch JSON lokal)
├── Dockerfile
├── docker-compose.yml
├── DEPLOY.md          # Panduan self-hosting (Docker & GitHub Pages)
└── package.json
```

## Menjalankan secara lokal

```bash
npm install
npm start
```

Server berjalan di `http://localhost:3000`.

Atau pakai Docker:

```bash
docker compose up -d --build
```

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/summary` | Ringkasan insight dashboard + odds Fed |
| GET | `/api/calendar` | Kalender event high-impact s.d Desember 2026 |
| GET | `/api/rates` | Rate bank sentral (Fed, ECB, BOE, BOJ, dst) |
| GET | `/api/history` | Histori harga XAU/USD 30 hari terakhir |
| GET | `/api/sessions` | Jam sesi pasar (Sydney/Tokyo/London/NY) |
| GET | `/api/xauusd` | Mekanisme dampak news ke XAU/USD |
| GET | `/api/feed` | Feed studi kasus/update pasar terbaru |
| POST | `/api/surprise` | Hitung Surprise% dari `{forecast, actual}` |
| POST | `/api/xau-scenario` | Estimasi arah gold dari `{scenario}` |

## Data

Semua angka (harga gold, rate bank sentral, tanggal FOMC/ECB/BOE/BOJ) adalah data per 12-13 September 2026 dan kalender resmi Fed/ECB/BOE/BOJ/BLS. Update berkala di folder `data/` (versi backend) atau `docs/data/` (versi GitHub Pages) sesuai kebutuhan.

## Deploy / Self-Host

Lihat `DEPLOY.md` untuk panduan lengkap:
- **Opsi A:** Self-host Docker/pm2 di server sendiri (backend penuh aktif).
- **Opsi B:** GitHub Pages gratis dari GitHub sendiri (statis, tanpa server).

Bisa juga langsung deploy ke Render/Railway/Vercel (Node runtime) — start command `npm start`, port dari `process.env.PORT`.
