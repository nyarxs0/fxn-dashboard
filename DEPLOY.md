# Panduan Self-Hosting FxN Dashboard

Ada 2 cara menjalankan FxN Dashboard tanpa numpang PaaS pihak ketiga.

## Opsi A — Self-host pakai Docker (rekomendasi, full backend aktif)

Jalan di server/VPS/home server kamu sendiri, backend Express + API tetap hidup.

```bash
git clone https://github.com/nyarxs0/fxn-dashboard.git
cd fxn-dashboard
docker compose up -d --build
```

Akses di `http://<ip-server-kamu>:3000`. Untuk update setelah ada perubahan kode:

```bash
git pull
docker compose up -d --build
```

Tanpa Docker (pakai Node langsung + pm2 agar tetap hidup setelah SSH ditutup):

```bash
git clone https://github.com/nyarxs0/fxn-dashboard.git
cd fxn-dashboard
npm install
npm install -g pm2
pm2 start server.js --name fxn-dashboard
pm2 save
```

## Opsi B — Hosting gratis dari GitHub sendiri (GitHub Pages, tanpa backend)

Versi statis di folder `docs/` sudah disiapkan — semua data JSON di-fetch langsung dari file lokal (bukan API), dan kalkulator dihitung di browser (client-side), jadi tidak butuh server Node menyala.

Langkah aktivasi (satu kali, manual di GitHub — tidak bisa diotomatisasi lewat API):

1. Buka repo di GitHub → tab **Settings** → menu **Pages** (sidebar kiri).
2. Di bagian **Build and deployment** → Source pilih **Deploy from a branch**.
3. Branch pilih **main**, folder pilih **/docs**, klik **Save**.
4. Tunggu 1-2 menit, situs akan online di `https://nyarxs0.github.io/fxn-dashboard/`.

Keuntungan: gratis selamanya, tidak perlu server nyala, langsung dari infrastruktur GitHub. Kekurangan: kalkulator surprise%/gold scenario dihitung di browser (client-side), bukan lewat backend Express seperti versi Docker.

## Update data

- Versi Docker/backend: edit file di folder `data/`, lalu restart server.
- Versi GitHub Pages: edit file yang sama di folder `docs/data/`, commit, GitHub Pages auto-redeploy dalam 1-2 menit.
