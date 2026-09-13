# FxN Dashboard

Fullstack dashboard untuk belajar baca news market forex & dampaknya ke XAU/USD (gold), kalender bank sentral, dan data historis 30 hari.

## Struktur

```
fxn-dashboard/
├── server.js          # Express server + REST API
├── data/              # Sumber data JSON (kalender, rate, histori, sesi, dll)
├── public/            # Frontend statis (HTML, CSS, JS) yang fetch ke API
└── package.json
```

## Menjalankan secara lokal

```bash
npm install
npm start
```

Server berjalan di `http://localhost:3000`.

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

Semua angka (harga gold, rate bank sentral, tanggal FOMC/ECB/BOE/BOJ) adalah data per 12-13 September 2026 dan kalender resmi Fed/ECB/BOE/BOJ/BLS. Update berkala di folder `data/` sesuai kebutuhan.

## Deploy

Bisa langsung deploy ke Render/Railway/Vercel (Node runtime) — start command `npm start`, port dari `process.env.PORT`.
