/* ============================================
   출발합니다 — index.js
   인터랙션 & 애니메이션
   ============================================ */

// ---- 파티클 시스템 ----
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#4d9fff', '#a855f7', '#22d3ee', '#ffffff'];

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size = Math.random() * 4 + 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const duration = Math.random() * 10 + 8;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      bottom: 0;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    container.appendChild(p);
  }
}

// ---- 스크롤 리빌 ----
function initReveal() {
  const targets = document.querySelectorAll('.card, .mission-inner > *, .launch-inner > *');
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

// ---- 네비게이션 스크롤 효과 ----
function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(5, 6, 15, 0.92)';
    } else {
      nav.style.background = 'rgba(5, 6, 15, 0.6)';
    }
  });
}

// ---- 카운트다운 타이머 ----
function initCountdown() {
  // 목표: 지금으로부터 7일 후
  const target = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return;

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);

    document.getElementById('c-days').textContent  = pad(days);
    document.getElementById('c-hours').textContent = pad(hours);
    document.getElementById('c-mins').textContent  = pad(mins);
    document.getElementById('c-secs').textContent  = pad(secs);
  }

  update();
  setInterval(update, 1000);
}

// ---- 로켓 호버 불꽃 ----
function initRocketHover() {
  const rocketWrap = document.getElementById('hero-rocket');
  const flame = document.getElementById('rocket-flame');
  const rocketImg = document.getElementById('rocket-img');

  rocketWrap.addEventListener('mouseenter', () => {
    flame.classList.add('active');
    rocketImg.style.animation = 'none';
    rocketImg.style.filter = 'drop-shadow(0 30px 80px rgba(77, 159, 255, 0.7))';
  });

  rocketWrap.addEventListener('mouseleave', () => {
    flame.classList.remove('active');
    rocketImg.style.animation = 'rocketFloat 4s ease-in-out infinite';
    rocketImg.style.filter = 'drop-shadow(0 20px 60px rgba(77, 159, 255, 0.4))';
  });
}

// ---- 발사 버튼 ----
function triggerLaunch() {
  const overlay = document.getElementById('launch-overlay');
  const rocketImg = document.getElementById('rocket-img');
  const flame = document.getElementById('rocket-flame');

  // 불꽃 활성화
  flame.classList.add('active');
  rocketImg.style.transition = 'transform 1.2s cubic-bezier(0.2, 0, 0.4, 1), opacity 1s ease';
  rocketImg.style.transform = 'translateY(-120vh) rotate(5deg)';
  rocketImg.style.opacity = '0';

  // 오버레이 표시
  setTimeout(() => {
    overlay.classList.add('active');
  }, 800);

  // 2.5초 후 리셋
  setTimeout(() => {
    overlay.classList.remove('active');
    flame.classList.remove('active');
    rocketImg.style.transition = 'none';
    rocketImg.style.transform = '';
    rocketImg.style.opacity = '1';
    // 플로트 애니메이션 재활성화
    setTimeout(() => {
      rocketImg.style.transition = '';
      rocketImg.style.animation = 'rocketFloat 4s ease-in-out infinite';
    }, 100);
  }, 2800);
}

// ---- 이메일 폼 ----
function handleSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('email-form');
  const success = document.getElementById('success-msg');
  form.style.display = 'none';
  success.style.display = 'block';
}

// ---- 마우스 시차 효과 (로켓) ----
function initParallax() {
  const rocket = document.getElementById('hero-rocket');
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    rocket.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`;
  });
}

// ---- "더 알아보기" 부드러운 스크롤 ----
document.addEventListener('DOMContentLoaded', () => {
  const learnBtn = document.getElementById('btn-learn');
  if (learnBtn) {
    learnBtn.addEventListener('click', () => {
      document.getElementById('mission').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 오버레이 클릭 시 닫기
  const overlay = document.getElementById('launch-overlay');
  overlay.addEventListener('click', () => overlay.classList.remove('active'));

  createParticles();
  initReveal();
  initNav();
  initCountdown();
  initRocketHover();
  initParallax();
});
