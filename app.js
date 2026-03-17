// ===== THEME =====
const themeBtn = document.getElementById('themeBtn');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('theme') || 'light');

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNav();
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ===== STATS COUNTER =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) statsObserver.observe(statsSection);

// ===== FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      // Use display instead of hidden class to avoid conflict with scroll animation inline styles
      card.style.display = match ? '' : 'none';
      // Re-trigger visible state for scroll-animated cards that are being shown
      if (match) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
    });
  });
});

// ===== MODAL =====
function openModal(btn) {
  const card = btn.closest('.project-card');
  document.getElementById('modalTitle').textContent = card.dataset.title;
  document.getElementById('modalDesc').textContent = card.dataset.desc;
  document.getElementById('modalImg').src = card.dataset.img;
  document.getElementById('modalImg').alt = card.dataset.title;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e === null || e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal(null);
});

// ===== EMAILJS CONFIG — replace these three values =====
const EMAILJS_PUBLIC_KEY  = 'IumooHYaPH5TcI8Xi';
const EMAILJS_SERVICE_ID  = 'service_81is7hf';
const EMAILJS_TEMPLATE_ID = 'template_g9g0lqd';

emailjs.init(EMAILJS_PUBLIC_KEY);

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let valid = true;

  const fields = [
    { id: 'name',    errId: 'nameErr',    msg: 'Please enter your name.' },
    { id: 'email',   errId: 'emailErr',   msg: 'Please enter a valid email.', isEmail: true },
    { id: 'subject', errId: 'subjectErr', msg: 'Please enter a subject.' },
    { id: 'message', errId: 'messageErr', msg: 'Please enter your message.' }
  ];

  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    el.classList.remove('error');
    err.textContent = '';
    const val = el.value.trim();
    let fieldValid = val.length > 0;
    if (f.isEmail && fieldValid) fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!fieldValid) {
      el.classList.add('error');
      err.textContent = f.msg;
      valid = false;
    }
  });

  if (!valid) return;

  const btn       = document.getElementById('submitBtn');
  const btnText   = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const formSuccess = document.getElementById('formSuccess');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';
  formSuccess.classList.remove('show');
  formSuccess.style.background = '';
  formSuccess.style.color = '';
  formSuccess.style.borderColor = '';

  // Build template params — keys must match your EmailJS template variables
  const templateParams = {
    from_name:    document.getElementById('name').value.trim(),
    from_email:   document.getElementById('email').value.trim(),
    subject:      document.getElementById('subject').value.trim(),
    message:      document.getElementById('message').value.trim(),
    reply_to:     document.getElementById('email').value.trim()
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      btn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      formSuccess.textContent = '✅ Message sent! We\'ll get back to you soon.';
      formSuccess.classList.add('show');
      this.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      btn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
      formSuccess.textContent = '❌ Failed to send. Please try again or email directly.';
      formSuccess.style.background = '#fee2e2';
      formSuccess.style.color = '#dc2626';
      formSuccess.style.borderColor = '#fca5a5';
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    });
});

// ===== CHAT =====
const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');

function toggleChat() {
  chatBox.classList.toggle('open');
  if (chatBox.classList.contains('open')) chatInput.focus();
}

chatInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendChat();
});

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Sanitize text to prevent XSS
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function appendMsg(text, type) {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerHTML = `<div class="msg-text">${sanitize(text)}</div><div class="msg-time">${getTime()}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  appendMsg(text, 'user');

  const loading = appendMsg('Thinking...', 'bot');
  loading.querySelector('.msg-text').style.fontStyle = 'italic';
  loading.querySelector('.msg-text').style.opacity = '0.6';

  const context = "I am Narendra Modi, the 14th Prime Minister of India, born 17 September 1950 in Vadnagar, Gujarat. I served as Chief Minister of Gujarat 2001-2014. As PM since 2014, I launched Digital India, Swachh Bharat, Make in India, Jan Dhan Yojana, GST, PM Awas Yojana, Ujjwala Yojana, Startup India, Atmanirbhar Bharat, and Bharatmala. I believe in Viksit Bharat — a developed, self-reliant India.";

  try {
    const apiKey = "AIzaSyBOa3SFdb_AJ2y8QMld7iwjlsMJhmRNaLA";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `User asks: "${text}". Reply as Narendra Modi himself, in first person, warm and confident. Use context if relevant: ${context}. Keep reply concise (2-4 sentences).` }] }]
      })
    });
    loading.remove();
    if (!res.ok) throw new Error();
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Jai Hind! I'm having trouble responding right now. Please try again.";
    appendMsg(reply, 'bot');
  } catch {
    loading.remove();
    appendMsg("Jai Hind! I'm having a little trouble connecting right now. Please try again shortly.", 'bot');
  }
}

// ===== SCROLL ANIMATIONS =====
// Cache sections for active nav (avoid querying every scroll)
const navSections = Array.from(document.querySelectorAll('section[id]'));
const navLinkEls = Array.from(document.querySelectorAll('.nav-link'));

function updateActiveNav() {
  let current = '';
  navSections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinkEls.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      observer.unobserve(e.target); // stop watching once visible
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .stat-card, .tl-card, .contact-link').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease';
  observer.observe(el);
});
