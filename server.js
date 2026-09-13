const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const summary = require('./data/summary.json');
const calendar = require('./data/calendar.json');
const rates = require('./data/rates.json');
const history = require('./data/history.json');
const sessions = require('./data/sessions.json');
const xauImpact = require('./data/xauImpact.json');
const feed = require('./data/feed.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/summary', (req, res) => res.json(summary));
app.get('/api/calendar', (req, res) => res.json(calendar));
app.get('/api/rates', (req, res) => res.json(rates));
app.get('/api/history', (req, res) => res.json(history));
app.get('/api/sessions', (req, res) => res.json(sessions));
app.get('/api/xauusd', (req, res) => res.json(xauImpact));
app.get('/api/feed', (req, res) => res.json(feed));

app.post('/api/surprise', (req, res) => {
  const { forecast, actual } = req.body;
  const fc = Number(forecast);
  const ac = Number(actual);
  if (Number.isNaN(fc) || Number.isNaN(ac) || fc === 0) {
    return res.status(400).json({ error: 'forecast dan actual harus angka valid, forecast tidak boleh 0' });
  }
  const surprise = ((ac - fc) / Math.abs(fc)) * 100;
  const abs = Math.abs(surprise);
  const strength = abs > 15 ? 'BESAR (50-150 pip)' : abs > 5 ? 'SEDANG (20-60 pip)' : 'KECIL (<20 pip)';
  const direction = surprise > 0 ? 'POSITIF — mata uang MENGUAT jangka pendek' : surprise < 0 ? 'NEGATIF — mata uang MELEMAH jangka pendek' : 'NETRAL';
  res.json({ surprise: Number(surprise.toFixed(2)), direction, strength });
});

const xauScenarios = {
  cpi_high: { arah: 'TERTEKAN', ket: 'Inflasi panas → yield riil naik → opportunity cost gold naik.' },
  cpi_low: { arah: 'MENGUAT', ket: 'Inflasi dingin → rate lebih dovish → gold lebih menarik.' },
  nfp_high: { arah: 'TERTEKAN', ket: 'Employment kuat → USD & yield naik.' },
  nfp_low: { arah: 'MENGUAT', ket: 'Employment lemah → ekspektasi Fed dovish → gold naik.' },
  fomc_hawk: { arah: 'TERTEKAN', ket: 'Hawkish → yield naik tajam, gold bisa turun $30-80/oz.' },
  fomc_dove: { arah: 'MENGUAT', ket: 'Dovish/sinyal cut → yield turun, gold bisa naik signifikan.' },
  riskoff: { arah: 'MENGUAT', ket: 'Permintaan safe-haven naik, bisa decouple dari USD.' }
};

app.post('/api/xau-scenario', (req, res) => {
  const { scenario } = req.body;
  const r = xauScenarios[scenario];
  if (!r) return res.status(400).json({ error: 'scenario tidak valid' });
  res.json(r);
});

app.listen(PORT, () => console.log(`FxN Dashboard server running on port ${PORT}`));
