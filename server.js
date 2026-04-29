// ═══════════════════════════════════════════════════════
//  Munny Academy — Server Locale per il Pannello Admin
//  Avvio:  npm start   (oppure:  node server.js)
//  URL:    http://localhost:3000/admin/
// ═══════════════════════════════════════════════════════

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

// ─── Middleware ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve tutti i file statici del sito (HTML, CSS, JS, immagini…)
app.use(express.static(path.join(__dirname), {
  index: 'index.html'
}));

// ─── Multer: gestione upload foto → cartella assets/ ───
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, 'assets');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    // Mantieni il nome originale, ma rimuovi caratteri problematici
    const safe = file.originalname.replace(/[^a-zA-Z0-9._\-\s]/g, '').replace(/\s+/g, '_');
    // Se esiste già, aggiungi timestamp
    const dest = path.join(__dirname, 'assets', safe);
    if (fs.existsSync(dest)) {
      const ext  = path.extname(safe);
      const base = path.basename(safe, ext);
      cb(null, `${base}_${Date.now()}${ext}`);
    } else {
      cb(null, safe);
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // max 15 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo file immagine (JPG, PNG, WEBP…)'));
  }
});

// ═══════════════════  API  ═══════════════════

// ── GET /api/content → leggi content.json ──
app.get('/api/content', (_req, res) => {
  const p = path.join(__dirname, 'content.json');
  if (!fs.existsSync(p)) return res.json({});
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Errore lettura content.json: ' + e.message });
  }
});

// ── POST /api/content → salva content.json ──
app.post('/api/content', (req, res) => {
  const p = path.join(__dirname, 'content.json');
  try {
    fs.writeFileSync(p, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Errore salvataggio content.json: ' + e.message });
  }
});

// ── GET /api/css → leggi style.css ──
app.get('/api/css', (_req, res) => {
  const p = path.join(__dirname, 'style.css');
  try {
    res.type('text/plain').send(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    res.status(500).json({ error: 'Errore lettura style.css: ' + e.message });
  }
});

// ── POST /api/css → salva style.css ──
app.post('/api/css', (req, res) => {
  const p = path.join(__dirname, 'style.css');
  try {
    fs.writeFileSync(p, req.body.css, 'utf-8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Errore salvataggio style.css: ' + e.message });
  }
});

// ── POST /api/upload → carica foto in assets/ ──
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nessun file ricevuto' });
  const assetPath = 'assets/' + req.file.filename;
  res.json({ ok: true, path: assetPath, filename: req.file.filename });
});

// ── POST /api/upload-multiple → carica più foto in assets/ ──
app.post('/api/upload-multiple', upload.array('photos', 20), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Nessun file ricevuto' });
  const files = req.files.map(f => ({
    path: 'assets/' + f.filename,
    filename: f.filename
  }));
  res.json({ ok: true, files });
});

// ── GET /api/assets → lista delle foto in assets/ ──
app.get('/api/assets', (_req, res) => {
  const dir = path.join(__dirname, 'assets');
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(f))
    .map(f => ({
      name: f,
      path: 'assets/' + f,
      size: fs.statSync(path.join(dir, f)).size
    }));
  res.json(files);
});

// ═══════════════════  AVVIO  ═══════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║                                              ║');
  console.log('  ║   🎓  Munny Academy — Server Locale          ║');
  console.log('  ║                                              ║');
  console.log(`  ║   🌐  Sito:    http://localhost:${PORT}/          ║`);
  console.log(`  ║   🔧  Admin:   http://localhost:${PORT}/admin/    ║`);
  console.log('  ║                                              ║');
  console.log('  ║   Premi Ctrl+C per spegnere il server        ║');
  console.log('  ║                                              ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
