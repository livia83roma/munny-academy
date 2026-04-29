// ===== CONFIG =====
const ADMIN_PASSWORD = 'munny2026';
const API_BASE = '/api';

let content = {};

const PALETTES = {
  gold:    { yellow:'#E8B800', dark:'#1A2744', text:'#2D3748', muted:'#64748B', bg:'#ffffff', bgLight:'#F5F7FA' },
  emerald: { yellow:'#10B981', dark:'#064E3B', text:'#1F2937', muted:'#6B7280', bg:'#ffffff', bgLight:'#F0FDF4' },
  royal:   { yellow:'#6366F1', dark:'#1E1B4B', text:'#1F2937', muted:'#6B7280', bg:'#ffffff', bgLight:'#EEF2FF' },
  coral:   { yellow:'#F97316', dark:'#7C2D12', text:'#292524', muted:'#78716C', bg:'#ffffff', bgLight:'#FFF7ED' },
  sky:     { yellow:'#0EA5E9', dark:'#0C4A6E', text:'#1E293B', muted:'#64748B', bg:'#ffffff', bgLight:'#F0F9FF' },
  rose:    { yellow:'#F43F5E', dark:'#4C0519', text:'#1C1917', muted:'#78716C', bg:'#ffffff', bgLight:'#FFF1F2' }
};

// ===== AUTH =====
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  if (document.getElementById('login-pwd').value === ADMIN_PASSWORD) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    loadContent();
    initColors();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-pwd').value = '';
});

// ===== NAVIGATION =====
const HINTS = {
  colors: 'Cambia i colori principali del sito con un clic',
  hero: 'Modifica il banner principale della homepage',
  services: 'Gestisci i servizi mostrati in homepage',
  gallery: 'Aggiungi o rimuovi foto dalla galleria',
  team: 'Modifica le schede dei tutor',
  about: 'Modifica il testo Chi Siamo',
  blog: 'Gestisci gli articoli del blog',
  testimonials: 'Gestisci le recensioni dei clienti',
  site: 'Modifica contatti e informazioni del sito'
};

document.querySelectorAll('.snav').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const sec = link.getAttribute('data-section');
    document.querySelectorAll('.snav').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('section-' + sec)?.classList.add('active');
    document.getElementById('section-title').textContent = link.textContent;
    document.getElementById('section-hint').textContent = HINTS[sec] || '';
  });
});

// ===== LOAD CONTENT =====
async function loadContent() {
  try {
    const res = await fetch(API_BASE + '/content');
    content = await res.json();
    renderAll();
  } catch(e) {
    alert('Errore nel caricamento dei contenuti: ' + e.message);
  }
}

function renderAll() {
  renderHero(); renderServices(); renderGallery(); renderTeam();
  renderAbout(); renderBlog(); renderTestimonials(); renderSite();
}

// ===== COLORS =====
const COLOR_FIELDS = [
  { id: 'yellow', label: 'Colore Principale', cssVar: '--yellow' },
  { id: 'dark',   label: 'Colore Scuro',      cssVar: '--dark' },
  { id: 'text',   label: 'Testo',             cssVar: '--text' },
  { id: 'muted',  label: 'Testo Secondario',  cssVar: '--muted' },
  { id: 'bg',     label: 'Sfondo',            cssVar: '--bg' },
  { id: 'bgLight',label: 'Sfondo Sezioni',    cssVar: '--bg-light' }
];

function initColors() {
  COLOR_FIELDS.forEach(({ id }) => {
    const picker = document.getElementById('color-' + id);
    const hex    = document.getElementById('color-' + id + '-hex');
    const prev   = document.getElementById('prev-' + id);
    if (!picker || !hex || !prev) return;
    prev.style.background = picker.value;
    picker.addEventListener('input', () => {
      hex.value = picker.value.toUpperCase();
      prev.style.background = picker.value;
    });
    hex.addEventListener('input', () => {
      const val = hex.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        picker.value = val;
        prev.style.background = val;
      }
    });
  });
}

function applyPalette(el) {
  const key = el.getAttribute('data-palette');
  const pal = PALETTES[key];
  if (!pal) return;
  document.querySelectorAll('.palette-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const map = { yellow: pal.yellow, dark: pal.dark, text: pal.text, muted: pal.muted, bg: pal.bg, 'bg-light': pal.bgLight };
  Object.entries(map).forEach(([id, val]) => {
    const safeId = id.replace('-', '');
    const picker = document.getElementById('color-' + (id === 'bg-light' ? 'bgLight' : safeId));
    const hex    = document.getElementById('color-' + (id === 'bg-light' ? 'bgLight' : safeId) + '-hex');
    const prev   = document.getElementById('prev-'  + (id === 'bg-light' ? 'bgLight' : safeId));
    if (picker) { picker.value = val; }
    if (hex)    { hex.value = val.toUpperCase(); }
    if (prev)   { prev.style.background = val; }
  });
}

function buildCssFromColors(originalCss) {
  const vals = {
    '--yellow':    document.getElementById('color-yellow')?.value   || '#E8B800',
    '--dark':      document.getElementById('color-dark')?.value     || '#1A2744',
    '--text':      document.getElementById('color-text')?.value     || '#2D3748',
    '--muted':     document.getElementById('color-muted')?.value    || '#64748B',
    '--bg':        document.getElementById('color-bg')?.value       || '#ffffff',
    '--bg-light':  document.getElementById('color-bgLight')?.value  || '#F5F7FA',
  };
  // Derive yellow-hover (darken ~15%)
  vals['--yellow-hover'] = darken(vals['--yellow'], 0.15);
  vals['--yellow-light'] = lighten(vals['--yellow'], 0.85);
  vals['--dark-2']       = darken(vals['--dark'], 0.2);

  let css = originalCss;
  Object.entries(vals).forEach(([varName, val]) => {
    const re = new RegExp(`(${varName.replace('-', '\\-').replace('-', '\\-')}:\\s*)([^;]+)(;)`, 'g');
    css = css.replace(re, `$1${val}$3`);
  });
  return css;
}

function darken(hex, amount) {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(Math.round(r*(1-amount)), Math.round(g*(1-amount)), Math.round(b*(1-amount)));
}
function lighten(hex, amount) {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(Math.round(r+(255-r)*amount), Math.round(g+(255-g)*amount), Math.round(b+(255-b)*amount));
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
function rgbToHex(r,g,b) {
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}

// ===== SAVE =====
document.getElementById('save-btn').addEventListener('click', saveAll);

async function saveAll() {
  collectAll();
  const status = document.getElementById('save-status');
  if (status) {
    status.textContent = '⏳ Salvataggio...';
    status.className = 'save-status-sidebar saving';
  }

  try {
    // Salva content.json via API
    await saveContent();

    // Salva style.css con i colori aggiornati
    const cssRes = await fetch(API_BASE + '/css');
    const originalCss = await cssRes.text();
    const updatedCss = buildCssFromColors(originalCss);
    await fetch(API_BASE + '/css', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ css: updatedCss })
    });

    if (status) {
      status.textContent = '✅ Salvato!';
      status.className = 'save-status-sidebar saved';
    }
    showToast('✅ Tutte le modifiche sono state salvate!');
  } catch(e) {
    if (status) {
      status.textContent = '❌ Errore!';
      status.className = 'save-status-sidebar';
    }
    showToast('❌ Errore nel salvataggio: ' + e.message, 5000);
  }
  if (status) setTimeout(() => { status.textContent = ''; status.className = 'save-status-sidebar'; }, 4000);
}

// Salva solo content.json (usato anche dopo upload foto)
async function saveContent() {
  const res = await fetch(API_BASE + '/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });
  return res.json();
}

// ===== COLLECT ALL =====
function collectAll() {
  content.hero = { badge: v('hero-badge'), title: v('hero-title'), subtitle: v('hero-subtitle'), image: v('hero-image'), btn1: content.hero?.btn1||'Prenota la tua lezione', btn2: content.hero?.btn2||'I nostri servizi' };
  content.about = { image: v('about-image'), title: v('about-title'), sections: collectAboutSections() };
  content.site = { name: v('site-name'), phone: v('site-phone'), email: v('site-email'), address: v('site-address'), hours: v('site-hours') };
  content.gallery = Array.from(document.querySelectorAll('.gal-src')).map(el => el.value).filter(Boolean);
}

function v(id) { return document.getElementById(id)?.value?.trim() || ''; }
function sv(id, val) { const el = document.getElementById(id); if(el) el.value = val || ''; }
function esc(str) { return (str||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function updatePreview(inputId, imgId) { const src = document.getElementById(inputId)?.value; const img = document.getElementById(imgId); if(src && img){ img.src='/'+src; img.style.display='block'; } }

// ===== HERO =====
function renderHero() {
  const h = content.hero || {};
  sv('hero-badge', h.badge); sv('hero-title', h.title); sv('hero-subtitle', h.subtitle); sv('hero-image', h.image);
  if (h.image) {
    const prev = document.getElementById('hero-img-preview');
    const ph = document.getElementById('hero-upload-ph');
    if(prev){ prev.src='/'+h.image; prev.style.display='block'; }
    if(ph) ph.style.display='none';
  }
  document.getElementById('hero-image-file').addEventListener('change', e => handleFile(
    e,
    (blobUrl, assetPath) => { // anteprima immediata
      const prev = document.getElementById('hero-img-preview');
      const ph   = document.getElementById('hero-upload-ph');
      if(prev){ prev.src = blobUrl; prev.style.display='block'; }
      if(ph)  ph.style.display='none';
      sv('hero-image', assetPath);
    },
    (assetPath) => { sv('hero-image', assetPath); } // path finale su disco
  ));
}

// ===== SERVICES =====
function renderServices() {
  const list = document.getElementById('services-list');
  list.innerHTML = '';
  (content.services || []).forEach((s, i) => list.appendChild(makeServiceCard(s, i)));
}

function makeServiceCard(s, i) {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `
    <div class="admin-card-header">
      <h3>📚 Servizio ${i+1}: ${esc(s.title)}</h3>
      <div class="card-actions"><button class="btn btn-sm btn-danger" onclick="removeService(${i})">🗑 Elimina</button></div>
    </div>
    <div class="admin-card-body">
      <div class="field-group full"><label>Titolo</label><input type="text" class="svc-title" value="${esc(s.title)}"></div>
      <div class="field-group full"><label>Descrizione</label><textarea class="svc-desc" rows="2">${esc(s.description)}</textarea></div>
      <div class="field-group full"><label>🖼️ Foto</label>
        <div class="img-upload-row">
          <img class="img-preview svc-prev" src="/${s.image}" onerror="this.src=''">
          <div>
            <input type="text" class="svc-img" value="${esc(s.image)}">
            <input type="file" class="file-input svc-file" accept="image/*">
            <button class="btn btn-outline btn-sm mt-1" onclick="this.previousElementSibling.click()">📁 Scegli foto</button>
          </div>
        </div>
      </div>
    </div>`;
  card.querySelector('.svc-title').addEventListener('input', e => { content.services[i].title = e.target.value; card.querySelector('h3').textContent = `📚 Servizio ${i+1}: ${e.target.value}`; });
  card.querySelector('.svc-desc').addEventListener('input', e => content.services[i].description = e.target.value);
  card.querySelector('.svc-img').addEventListener('input', e => { content.services[i].image = e.target.value; card.querySelector('.svc-prev').src = '/'+e.target.value; });
  card.querySelector('.svc-file').addEventListener('change', e => handleFile(
    e,
    (blobUrl, assetPath) => { card.querySelector('.svc-img').value = assetPath; card.querySelector('.svc-prev').src = blobUrl; content.services[i].image = assetPath; },
    (assetPath) => { card.querySelector('.svc-img').value = assetPath; content.services[i].image = assetPath; }
  ));
  return card;
}

function removeService(i) { content.services.splice(i, 1); renderServices(); }
document.getElementById('add-service-btn').addEventListener('click', () => {
  content.services = content.services || [];
  content.services.push({id:'s'+Date.now(), title:'Nuovo Servizio', description:'', image:''});
  renderServices();
});

// ===== GALLERY =====
function renderGallery() {
  const grid = document.getElementById('gallery-list');
  grid.innerHTML = '';
  (content.gallery || []).forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'gal-admin-item';
    item.innerHTML = `<img src="/${src}" onerror="this.src=''"><input type="hidden" class="gal-src" value="${src}"><button class="gal-remove" onclick="removeGallery(${i})">✕</button>`;
    grid.appendChild(item);
  });
  const inp = document.getElementById('gallery-file-input');
  const newInp = inp.cloneNode(true);
  inp.parentNode.replaceChild(newInp, inp);
  newInp.addEventListener('change', e => {
    Array.from(e.target.files).forEach(file => {
      const blobUrl   = URL.createObjectURL(file);
      const tempPath  = 'assets/' + file.name;
      content.gallery = content.gallery || [];
      const idx = content.gallery.length;
      content.gallery.push(tempPath); // path temporaneo, verrà aggiornato dopo l'upload
      // Aggiungi anteprima immediata nella griglia
      const item = document.createElement('div');
      item.className = 'gal-admin-item';
      item.innerHTML = `<img src="${blobUrl}"><input type="hidden" class="gal-src" value="${tempPath}"><button class="gal-remove" onclick="removeGallery(${idx})">✕</button>`;
      document.getElementById('gallery-list').appendChild(item);
      // Upload su disco e aggiorna il path reale
      handleFile({ target: { files: [file] } },
        null,
        (realPath) => {
          // Aggiorna il path nel content con il nome reale del file salvato dal server
          content.gallery[idx] = realPath;
          item.querySelector('.gal-src').value = realPath;
        }
      );
    });
    e.target.value = '';
  });
}

function removeGallery(i) { content.gallery.splice(i, 1); renderGallery(); }

// ===== TEAM =====
function renderTeam() {
  const list = document.getElementById('team-list');
  list.innerHTML = '';
  (content.team || []).forEach((m, i) => list.appendChild(makeMemberCard(m, i)));
}

function makeMemberCard(m, i) {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `
    <div class="admin-card-header">
      <h3>👤 ${esc(m.name)}</h3>
      <div class="card-actions"><button class="btn btn-sm btn-danger" onclick="removeMember(${i})">🗑 Elimina</button></div>
    </div>
    <div class="admin-card-body">
      <div class="field-group"><label>Nome</label><input type="text" class="mem-name" value="${esc(m.name)}"></div>
      <div class="field-group"><label>Materie insegnate</label><input type="text" class="mem-subj" value="${esc(m.subjects)}"></div>
      <div class="field-group full"><label>Biografia</label><textarea class="mem-bio" rows="3">${esc(m.bio)}</textarea></div>
      <div class="field-group full"><label>📷 Foto profilo</label>
        <div class="img-upload-row">
          <img class="img-preview mem-prev" src="/${m.photo}" onerror="this.src=''">
          <div>
            <input type="text" class="mem-photo" value="${esc(m.photo)}">
            <input type="file" class="file-input mem-file" accept="image/*">
            <button class="btn btn-outline btn-sm mt-1" onclick="this.previousElementSibling.click()">📁 Scegli foto</button>
          </div>
        </div>
      </div>
    </div>`;
  card.querySelector('.mem-name').addEventListener('input', e => { content.team[i].name = e.target.value; card.querySelector('h3').textContent = '👤 ' + e.target.value; });
  card.querySelector('.mem-subj').addEventListener('input', e => content.team[i].subjects = e.target.value);
  card.querySelector('.mem-bio').addEventListener('input', e => content.team[i].bio = e.target.value);
  card.querySelector('.mem-photo').addEventListener('input', e => { content.team[i].photo = e.target.value; card.querySelector('.mem-prev').src = '/'+e.target.value; });
  card.querySelector('.mem-file').addEventListener('change', e => handleFile(
    e,
    (blobUrl, assetPath) => { card.querySelector('.mem-photo').value = assetPath; card.querySelector('.mem-prev').src = blobUrl; content.team[i].photo = assetPath; },
    (assetPath) => { card.querySelector('.mem-photo').value = assetPath; content.team[i].photo = assetPath; }
  ));
  return card;
}

function removeMember(i) { content.team.splice(i, 1); renderTeam(); }
document.getElementById('add-member-btn').addEventListener('click', () => {
  content.team = content.team || [];
  content.team.push({id:'t'+Date.now(), name:'Nuovo Tutor', subjects:'', bio:'', photo:''});
  renderTeam();
});

// ===== ABOUT =====
function renderAbout() {
  const a = content.about || {};
  sv('about-title', a.title); sv('about-image', a.image);
  if (a.image) {
    const prev = document.getElementById('about-img-preview');
    const ph = document.getElementById('about-upload-ph');
    if(prev){ prev.src='/'+a.image; prev.style.display='block'; }
    if(ph) ph.style.display='none';
  }
  document.getElementById('about-image-file').addEventListener('change', e => handleFile(
    e,
    (blobUrl, assetPath) => {
      const prev = document.getElementById('about-img-preview');
      const ph   = document.getElementById('about-upload-ph');
      if(prev){ prev.src = blobUrl; prev.style.display='block'; }
      if(ph)  ph.style.display='none';
      sv('about-image', assetPath);
    },
    (assetPath) => { sv('about-image', assetPath); }
  ));
  const list = document.getElementById('about-sections-list');
  list.innerHTML = '';
  (a.sections || []).forEach((sec, i) => {
    const div = document.createElement('div');
    div.className = 'admin-card';
    div.innerHTML = `<div class="field-group full"><label>Titolo paragrafo ${i+1}</label><input type="text" class="about-sec-h" value="${esc(sec.heading)}"></div>
      <div class="field-group full" style="margin-top:.75rem"><label>Testo</label><textarea class="about-sec-t" rows="3">${esc(sec.text)}</textarea></div>`;
    div.querySelector('.about-sec-h').addEventListener('input', e => content.about.sections[i].heading = e.target.value);
    div.querySelector('.about-sec-t').addEventListener('input', e => content.about.sections[i].text = e.target.value);
    list.appendChild(div);
  });
}

function collectAboutSections() {
  return Array.from(document.querySelectorAll('.about-sec-h')).map((el, i) => ({
    heading: el.value,
    text: document.querySelectorAll('.about-sec-t')[i]?.value || ''
  }));
}

// ===== BLOG =====
const BLOG_COLORS = ['bg-blue','bg-green','bg-amber','bg-rose'];

function renderBlog() {
  const list = document.getElementById('blog-list');
  list.innerHTML = '';
  (content.blog || []).forEach((post, i) => list.appendChild(makeBlogCard(post, i)));
}

function makeBlogCard(post, i) {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `
    <div class="admin-card-header">
      <h3>📝 ${esc(post.title)}</h3>
      <div class="card-actions"><button class="btn btn-sm btn-danger" onclick="removePost(${i})">🗑 Elimina</button></div>
    </div>
    <div class="admin-card-body">
      <div class="field-group"><label>Categoria</label><input type="text" class="post-cat" value="${esc(post.category)}"></div>
      <div class="field-group"><label>Data</label><input type="date" class="post-date" value="${esc(post.date)}"></div>
      <div class="field-group full"><label>Titolo</label><input type="text" class="post-title" value="${esc(post.title)}"></div>
      <div class="field-group full"><label>Estratto (anteprima)</label><textarea class="post-exc" rows="2">${esc(post.excerpt)}</textarea></div>
      <div class="field-group full"><label>Testo completo</label><textarea class="post-body" rows="4">${esc(post.content||'')}</textarea></div>
      <div class="field-group full"><label>Colore card</label>
        <div class="color-options">${BLOG_COLORS.map(c => `<span class="color-opt ${c}${post.color===c?' selected':''}" data-color="${c}">${c.replace('bg-','')}</span>`).join('')}</div>
      </div>
    </div>`;
  const sync = () => {
    content.blog[i] = { id: post.id, category: card.querySelector('.post-cat').value, title: card.querySelector('.post-title').value, excerpt: card.querySelector('.post-exc').value, content: card.querySelector('.post-body').value, color: content.blog[i]?.color||'bg-blue', date: card.querySelector('.post-date').value };
    card.querySelector('h3').textContent = '📝 ' + card.querySelector('.post-title').value;
  };
  card.querySelectorAll('input,textarea').forEach(el => el.addEventListener('input', sync));
  card.querySelectorAll('.color-opt').forEach(opt => opt.addEventListener('click', () => {
    card.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    content.blog[i].color = opt.getAttribute('data-color');
  }));
  return card;
}

function removePost(i) { content.blog.splice(i, 1); renderBlog(); }
document.getElementById('add-post-btn').addEventListener('click', () => {
  content.blog = content.blog || [];
  content.blog.push({id:'b'+Date.now(), category:'Categoria', title:'Nuovo Articolo', excerpt:'', content:'', color:'bg-blue', date:new Date().toISOString().split('T')[0]});
  renderBlog();
});

// ===== TESTIMONIALS =====
function renderTestimonials() {
  const list = document.getElementById('testi-list');
  list.innerHTML = '';
  (content.testimonials || []).forEach((t, i) => list.appendChild(makeTestiCard(t, i)));
}

function makeTestiCard(t, i) {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `
    <div class="admin-card-header">
      <h3>⭐ Recensione di ${esc(t.author)}</h3>
      <div class="card-actions"><button class="btn btn-sm btn-danger" onclick="removeTesti(${i})">🗑 Elimina</button></div>
    </div>
    <div class="admin-card-body">
      <div class="field-group"><label>Nome cliente</label><input type="text" class="testi-author" value="${esc(t.author)}"></div>
      <div class="field-group full"><label>Testo recensione</label><textarea class="testi-quote" rows="3">${esc(t.quote)}</textarea></div>
    </div>`;
  card.querySelector('.testi-author').addEventListener('input', e => { content.testimonials[i].author = e.target.value; card.querySelector('h3').textContent = '⭐ Recensione di ' + e.target.value; });
  card.querySelector('.testi-quote').addEventListener('input', e => content.testimonials[i].quote = e.target.value);
  return card;
}

function removeTesti(i) { content.testimonials.splice(i, 1); renderTestimonials(); }
document.getElementById('add-testi-btn').addEventListener('click', () => {
  content.testimonials = content.testimonials || [];
  content.testimonials.push({id:'r'+Date.now(), author:'Nome Cliente', quote:''});
  renderTestimonials();
});

// ===== SITE =====
function renderSite() {
  const s = content.site || {};
  sv('site-name', s.name); sv('site-phone', s.phone);
  sv('site-email', s.email); sv('site-address', s.address); sv('site-hours', s.hours);
}

// ===== FILE HELPER =====

/**
 * Gestisce il caricamento di una foto:
 * 1. Mostra anteprima immediata (blob URL)
 * 2. Carica il file sul server via API → viene salvato in assets/
 */
async function handleFile(e, onPreview, onSaved) {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Anteprima immediata
  const blobUrl = URL.createObjectURL(file);
  const tempPath = 'assets/' + file.name;
  if (onPreview) onPreview(blobUrl, tempPath);

  // 2. Upload al server
  try {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(API_BASE + '/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      if (onSaved) onSaved(data.path);
      // Aggiorna anteprima con il path definitivo
      if (onPreview) onPreview('/' + data.path, data.path);
      showToast('✅ Foto "' + data.filename + '" caricata!');
      // Auto-salva content.json così la foto è subito visibile sul sito
      collectAll();
      await saveContent();
    } else {
      showToast('❌ Errore upload: ' + (data.error || 'sconosciuto'), 5000);
    }
  } catch (err) {
    showToast('❌ Errore di rete durante l\'upload', 5000);
  }
}

// Toast di notifica
function showToast(msg, duration = 3500) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#1A2744;color:#fff;padding:.85rem 1.4rem;border-radius:.75rem;font-size:.88rem;font-weight:600;z-index:10000;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:opacity .3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}
