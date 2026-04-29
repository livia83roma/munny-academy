lucide.createIcons();

// ===== LOAD & RENDER CONTENT =====
async function loadContent() {
  try {
    const res = await fetch('content.json?v=' + Date.now());
    const data = await res.json();
    renderSite(data);
    return data;
  } catch(e) {
    console.error('content.json non trovato', e);
    return null;
  }
}

function renderSite(data) {
  if (!data) return;

  // HERO
  if (data.hero) {
    const h = data.hero;
    document.querySelector('.hero-bg-img')?.setAttribute('src', h.image);
    document.querySelector('.hero-badge')?.textContent && (document.querySelector('.hero-badge').textContent = h.badge);
    const h1 = document.querySelector('.hero h1');
    if (h1) h1.textContent = h.title;
    const heroP = document.querySelector('.hero-content > p');
    if (heroP) heroP.textContent = h.subtitle;
  }

  // SERVICES GRID (home)
  const svcGrid = document.querySelector('.svc-grid');
  if (svcGrid && data.services) {
    svcGrid.innerHTML = data.services.map(s => `
      <div class="svc-card">
        <div class="svc-img"><img src="${s.image}" alt="${s.title}" onerror="this.parentElement.style.background='#e2e8f0'"></div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>`).join('');
  }

  // GALLERY
  const galGrid = document.querySelector('.gallery-grid');
  if (galGrid && data.gallery) {
    galGrid.innerHTML = data.gallery.map(src => `
      <img src="${src}" alt="Munny Academy" class="gal-img" onerror="this.style.display='none'">`).join('');
  }

  // TEAM
  const teamGrid = document.querySelector('.team-grid');
  if (teamGrid && data.team) {
    teamGrid.innerHTML = data.team.map(m => `
      <div class="team-card">
        <div class="team-photo-wrap" id="wrap-${m.id}">
          <img src="${m.photo}" alt="${m.name}" class="team-photo"
            onerror="document.getElementById('wrap-${m.id}').classList.add('photo-fallback');this.style.display='none'">
          <div class="photo-initial">${m.name[0]}</div>
        </div>
        <h3>${m.name}</h3>
        <span class="team-subjects">${m.subjects}</span>
        <p>${m.bio}</p>
      </div>`).join('');
  }

  // ABOUT
  if (data.about) {
    const aboutImg = document.querySelector('.about-img');
    if (aboutImg) aboutImg.src = data.about.image;
    const aboutTitle = document.querySelector('.about-text-content h2');
    if (aboutTitle) aboutTitle.textContent = data.about.title;
    const aboutContent = document.querySelector('.about-text-content');
    if (aboutContent && data.about.sections) {
      const h2 = aboutContent.querySelector('h2');
      aboutContent.innerHTML = '';
      if (h2) aboutContent.appendChild(h2);
      data.about.sections.forEach(sec => {
        const h4 = document.createElement('h4');
        h4.textContent = sec.heading;
        const p = document.createElement('p');
        p.textContent = sec.text;
        aboutContent.appendChild(h4);
        aboutContent.appendChild(p);
      });
    }
  }

  // BLOG
  const blogGrid = document.querySelector('.blog-grid');
  if (blogGrid && data.blog) {
    blogGrid.innerHTML = data.blog.map(post => `
      <article class="blog-card">
        <div class="blog-img ${post.color}"></div>
        <div class="blog-body">
          <span class="blog-cat">${post.category}</span>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <a href="#" class="read-more">Leggi articolo <i data-lucide="arrow-right"></i></a>
        </div>
      </article>`).join('');
    lucide.createIcons();
  }

  // TESTIMONIALS
  const testiTrack = document.getElementById('testi-track');
  if (testiTrack && data.testimonials) {
    testiTrack.innerHTML = data.testimonials.map((t, i) => `
      <div class="testi-slide${i===0?' active':''}">
        <blockquote>"${t.quote}"</blockquote>
        <cite>— ${t.author}</cite>
      </div>`).join('');
  }

  // CONTACT INFO
  if (data.site) {
    document.querySelectorAll('.footer-phone').forEach(el => el.textContent = data.site.phone);
    document.querySelectorAll('.footer-email').forEach(el => el.textContent = data.site.email);
  }

  // Re-init after dynamic render
  initTestimonials();
}

// ===== INIT TESTIMONIALS SLIDER =====
function initTestimonials() {
  const slides = document.querySelectorAll('.testi-slide');
  const dotsContainer = document.getElementById('testi-dots');
  if (!slides.length || !dotsContainer) return;
  let current = 0;
  dotsContainer.innerHTML = '';

  function showSlide(n) {
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === n));
    current = n;
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => showSlide(i));
    dotsContainer.appendChild(dot);
  });

  showSlide(0);
  document.getElementById('testi-prev')?.addEventListener('click', () => showSlide((current - 1 + slides.length) % slides.length));
  document.getElementById('testi-next')?.addEventListener('click', () => showSlide((current + 1) % slides.length));
  if (window._testiInterval) clearInterval(window._testiInterval);
  window._testiInterval = setInterval(() => showSlide((current + 1) % slides.length), 5000);
}

// ===== MAIN =====
document.addEventListener('DOMContentLoaded', async () => {

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 20));

  // Mobile menu
  const mobileBtn = document.getElementById('mobile-btn');
  const navLinks = document.getElementById('nav-links');
  mobileBtn?.addEventListener('click', () => navLinks?.classList.toggle('show'));

  // SPA Navigation
  const pages = document.querySelectorAll('.page-section');
  const links = document.querySelectorAll('.nav-link[data-target]');

  function navigateTo(targetId) {
    pages.forEach(p => p.classList.remove('section-active'));
    document.getElementById(targetId)?.classList.add('section-active');
    links.forEach(l => l.classList.toggle('active', l.getAttribute('data-target') === targetId));
    navLinks?.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const t = link.getAttribute('data-target');
      if (t) navigateTo(t);
    });
  });

  document.getElementById('logo-link')?.addEventListener('click', e => { e.preventDefault(); navigateTo('home'); });

  // Load content from JSON
  await loadContent();

  // Booking form
  const catSelect = document.getElementById('book-category');
  const subjectSelect = document.getElementById('book-subject');
  const subjectsMap = {
    school: [{v:'mat',t:'Matematica / Fisica'},{v:'sci',t:'Scienze'},{v:'ita',t:'Italiano / Storia'},{v:'met',t:'Metodo di Studio'}],
    language: [{v:'eng',t:'Inglese'},{v:'fra',t:'Francese'},{v:'esp',t:'Spagnolo'},{v:'ita2',t:'Italiano per stranieri'}]
  };

  catSelect?.addEventListener('change', e => {
    subjectSelect.innerHTML = '<option value="" disabled selected>Seleziona una materia</option>';
    subjectSelect.disabled = false;
    (subjectsMap[e.target.value] || []).forEach(s => {
      const o = document.createElement('option');
      o.value = s.v; o.textContent = s.t;
      subjectSelect.appendChild(o);
    });
  });

  let currentStep = 1;
  const updateStepsUI = () => {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.bstep').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${currentStep}`)?.classList.add('active');
    for (let i = 1; i <= currentStep; i++) {
      document.querySelector(`.bstep[data-step="${i}"]`)?.classList.add('active');
    }
    if (currentStep === 3) buildSummary();
  };

  function buildSummary() {
    const sl = document.getElementById('summary-list');
    if (!sl) return;
    const loc = document.getElementById('book-location');
    const type = document.getElementById('book-type');
    sl.innerHTML = `
      <li><span>Servizio:</span><strong>${catSelect?.options[catSelect?.selectedIndex]?.text||''}</strong></li>
      <li><span>Materia:</span><strong>${subjectSelect?.options[subjectSelect?.selectedIndex]?.text||''}</strong></li>
      <li><span>Tipologia:</span><strong>${type?.options[type?.selectedIndex]?.text||''} — ${loc?.options[loc?.selectedIndex]?.text||''}</strong></li>
      <li><span>Data e ora:</span><strong>${document.getElementById('book-date')?.value||''} ore ${document.getElementById('book-time')?.value||''}</strong></li>`;
  }

  document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep === 1 && (!catSelect?.value || !subjectSelect?.value || !document.getElementById('book-location')?.value)) {
        alert('Completa tutti i campi obbligatori.'); return;
      }
      if (currentStep === 2 && (!document.getElementById('book-date')?.value || !document.getElementById('book-time')?.value)) {
        alert('Seleziona data e orario.'); return;
      }
      if (currentStep < 3) { currentStep++; updateStepsUI(); }
    });
  });

  document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => { if (currentStep > 1) { currentStep--; updateStepsUI(); } });
  });

  document.getElementById('booking-form')?.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('booking-form').classList.add('hidden');
    document.querySelector('.booking-steps-bar')?.classList.add('hidden');
    document.getElementById('booking-success')?.classList.remove('hidden');
  });

  // Contact form
  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.textContent = 'Messaggio inviato!';
    btn.disabled = true;
    btn.style.background = '#22c55e';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; e.target.reset(); }, 3500);
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item?.querySelector('.faq-answer');
      const isOpen = item?.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(el => { el.classList.remove('open'); el.querySelector('.faq-answer')?.classList.remove('open'); });
      if (!isOpen) { item.classList.add('open'); answer?.classList.add('open'); }
    });
  });

});
