let breathingInterval = null;
let currentStep = 0;
let totalCyclesRemaining = 0;
let currentSlide = 0;
let totalMeditationTime = 0;
let totalSessions = 0;
let isDarkTheme = true;
let themeToggle = null;
let statsBtn = null;
let statsModal = null;
let circularMenu = null;
let menuOverlay = null;
let menuCenter = null;
let initLoadingBtn = null;
let menuBtn = null;

document.addEventListener('DOMContentLoaded', function() {
  console.log('Скрипт загружен');

  function safeLocalStorage(action, key, value) {
    try {
      if (action === 'get') {
        return localStorage.getItem(key);
      } else if (action === 'set') {
        localStorage.setItem(key, value);
        return true;
      } else if (action === 'remove') {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.warn('localStorage недоступен:', e.message);
      return null;
    }
  }

  function loadStats() {
    const stats = safeLocalStorage('get', 'meditationStats');
    const sessions = safeLocalStorage('get', 'meditationSessions');
    const theme = safeLocalStorage('get', 'theme');

    if (stats) totalMeditationTime = parseInt(stats, 10) || 0;
    if (sessions) totalSessions = parseInt(sessions, 10) || 0;
    if (theme) {
      isDarkTheme = theme === 'dark';
    }
  }

  function saveStats() {
    safeLocalStorage('set', 'meditationStats', totalMeditationTime.toString());
    safeLocalStorage('set', 'meditationSessions', totalSessions.toString());
  }

  loadStats();

  themeToggle = document.getElementById('theme-toggle');
  statsBtn = document.getElementById('stats-btn');
  statsModal = document.getElementById('stats-modal');
  circularMenu = document.getElementById('circular-menu');
  menuOverlay = document.getElementById('menu-overlay');
  menuCenter = document.getElementById('menu-center');
  initLoadingBtn = document.getElementById('init-loading-btn');
  menuBtn = document.getElementById('menu-btn');
  const closeStatsBtn = document.getElementById('close-stats-modal');
  const clearStatsBtn = document.getElementById('clear-stats-btn');
  const logo = document.querySelector('.logo');
  const pages = document.querySelectorAll('.page-section');

  // THEME
  function applyTheme() {
    if (isDarkTheme) {
      document.body.classList.remove('light-theme');
      if (themeToggle) themeToggle.innerText = 'Луна';
      safeLocalStorage('set', 'theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      if (themeToggle) themeToggle.innerText = 'Солнце';
      safeLocalStorage('set', 'theme', 'light');
    }
  }

  applyTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      isDarkTheme = !isDarkTheme;
      applyTheme();
    });
  }

  // CIRCULAR MENU
  function openMenu() {
    circularMenu.classList.add('active');
    menuOverlay.classList.add('active');
  }

  function closeMenu() {
    circularMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
  }

  if (initLoadingBtn) {
    initLoadingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMenu();
    });
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMenu();
    });
  }

  if (menuCenter) {
    menuCenter.addEventListener('click', closeMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  // LOGO вернуться в главное меню
  if (logo) {
    logo.addEventListener('click', () => {
      pages.forEach(page => page.classList.remove('active'));
      document.getElementById('page-home').classList.add('active');
      updateMenuButtonVisibility();
    });
  }

  // NAVIGATION
  const menuItems = document.querySelectorAll('.menu-btn-item');

  function switchPage(targetId) {
    pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(targetId);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    if (targetId !== 'page-breathing' && breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
      const breathingSetup = document.getElementById('breathing-setup');
      const breathingSandbox = document.getElementById('breathing-sandbox');
      if (breathingSetup) breathingSetup.style.display = 'block';
      if (breathingSandbox) breathingSandbox.style.display = 'none';
    }

    closeMenu();
    updateMenuButtonVisibility();
  }

  function updateMenuButtonVisibility() {
    const activePage = document.querySelector('.page-section.active');
    const isHomePage = activePage && activePage.id === 'page-home';
    
    if (menuBtn) {
      menuBtn.style.display = isHomePage ? 'none' : 'block';
    }
  }

  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      const targetId = this.getAttribute('data-page');
      switchPage(targetId);
    });
  });

  // STATS
  function updateStatsDisplay() {
    const minutes = Math.floor(totalMeditationTime / 60);
    const timeEl = document.getElementById('total-meditation-time');
    const sessionsEl = document.getElementById('total-sessions');
    const levelEl = document.getElementById('user-level');

    if (timeEl) timeEl.innerText = `${minutes} мин`;
    if (sessionsEl) sessionsEl.innerText = totalSessions;

    const profile = safeLocalStorage('get', 'userProfile');
    if (profile && levelEl) {
      try {
        const data = JSON.parse(profile);
        const levelMap = {
          'beginner': 'Базовый',
          'middle': 'Продвинутый',
          'pro': 'Root-доступ'
        };
        levelEl.innerText = levelMap[data.userLevel] || data.userLevel || '-';
      } catch (e) {
        console.warn('Ошибка парсинга профиля:', e.message);
        levelEl.innerText = '-';
      }
    }
  }

  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      updateStatsDisplay();
      if (statsModal) statsModal.classList.add('show');
    });
  }

  if (closeStatsBtn) {
    closeStatsBtn.addEventListener('click', () => {
      if (statsModal) statsModal.classList.remove('show');
    });
  }

  if (clearStatsBtn) {
    clearStatsBtn.addEventListener('click', () => {
      totalMeditationTime = 0;
      totalSessions = 0;
      saveStats();
      updateStatsDisplay();
      alert('Статистика очищена');
    });
  }

  if (statsModal) {
    statsModal.addEventListener('click', (e) => {
      if (e.target === statsModal) {
        statsModal.classList.remove('show');
      }
    });
  }

  // POPUP
  const popupTrigger = document.getElementById('init-loading-btn');
  const popupText = document.getElementById('home-popup');

  if (popupTrigger && popupText) {
    popupTrigger.addEventListener('mouseenter', () => popupText.classList.add('show'));
    popupTrigger.addEventListener('mouseleave', () => popupText.classList.remove('show'));
  }

  // ACCORDION
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach(button => {
    button.addEventListener('click', function() {
      const isAlreadyActive = this.classList.contains('active');
      
      accordions.forEach(btn => {
        btn.classList.remove('active');
        const panel = btn.nextElementSibling;
        if (panel && panel.classList.contains('panel')) {
          panel.style.maxHeight = null;
        }
      });

      if (!isAlreadyActive) {
        this.classList.add('active');
        const panel = this.nextElementSibling;
        if (panel && panel.classList.contains('panel')) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      }
    });
  });

  // BREATHING
  const startBreathingBtn = document.getElementById('start-breathing-btn');
  const stopBreathingBtn = document.getElementById('stop-breathing-btn');
  const breathingSetup = document.getElementById('breathing-setup');
  const breathingSandbox = document.getElementById('breathing-sandbox');
  const breathingShape = document.getElementById('breathing-shape');
  const breathingStatus = document.getElementById('breathing-status');
  const cyclesLeftSpan = document.getElementById('cycles-left');
  const cyclesInput = document.getElementById('breathing-cycles');

  function executeBreathingPhase() {
    const phases = [
      { text: "Вдыхайте", scale: "2.4", color: "#00f5d4" },
      { text: "Задержка", scale: "2.4", color: "#bc55ec" },
      { text: "Выдыхайте", scale: "1.0", color: "#ff007f" },
      { text: "Задержка", scale: "1.0", color: "#333333" }
    ];

    const phase = phases[currentStep];
    if (breathingStatus) breathingStatus.innerText = phase.text;
    if (breathingShape) {
      breathingShape.style.transform = `scale(${phase.scale})`;
      breathingShape.style.background = phase.color;
    }

    currentStep++;

    if (currentStep > 3) {
      currentStep = 0;
      totalCyclesRemaining--;
      if (cyclesLeftSpan) cyclesLeftSpan.innerText = totalCyclesRemaining;

      if (totalCyclesRemaining <= 0) {
        const completedCycles = parseInt(cyclesInput.value, 10) || 4;
        totalMeditationTime += completedCycles * 16;
        totalSessions++;
        saveStats();
        endBreathingPractice('Протокол завершен!');
      }
    }
  }

  function endBreathingPractice(message) {
    if (breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
    }

    if (breathingShape) {
      breathingShape.style.transform = "scale(1)";
      breathingShape.style.background = "#bc55ec";
    }

    alert(message);

    if (breathingSetup) breathingSetup.style.display = 'block';
    if (breathingSandbox) breathingSandbox.style.display = 'none';
    if (startBreathingBtn) startBreathingBtn.innerText = 'Запуск протокола';
  }

  if (startBreathingBtn) {
    startBreathingBtn.addEventListener('click', () => {
      totalCyclesRemaining = parseInt(cyclesInput.value, 10) || 4;
      if (totalCyclesRemaining < 1 || totalCyclesRemaining > 20) {
        alert('Циклов должно быть от 1 до 20');
        return;
      }

      if (cyclesLeftSpan) cyclesLeftSpan.innerText = totalCyclesRemaining;
      currentStep = 0;

      if (breathingSetup) breathingSetup.style.display = 'none';
      if (breathingSandbox) breathingSandbox.style.display = 'block';
      if (startBreathingBtn) startBreathingBtn.innerText = 'Пауза';

      executeBreathingPhase();
      breathingInterval = setInterval(executeBreathingPhase, 4000);
    });
  }

  if (stopBreathingBtn) {
    stopBreathingBtn.addEventListener('click', () => {
      endBreathingPractice('Протокол остановлен');
    });
  }

  // CAROUSEL
  const track = document.getElementById('carousel-track');
  const slides = track ? track.querySelectorAll('.image-wrapper') : [];
  const dotsContainer = document.getElementById('carousel-dots');
  const totalSlides = slides.length;

  if (dotsContainer && totalSlides > 0) {
    for (let i = 0; i < totalSlides; i++) {
              const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        currentSlide = i;
        updateCarouselView();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarouselView() {
    if (!track || totalSlides === 0) return;

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
    updateCarouselView();
  }

  function prevSlide() {
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : totalSlides - 1;
    updateCarouselView();
  }

  const nextBtn = document.querySelector('.carousel-btn.next');
  const prevBtn = document.querySelector('.carousel-btn.prev');

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // PRACTICE
  const practiceButtons = document.querySelectorAll('.btn-practice-try');
  practiceButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const meditationTypes = [
        'I. Наблюдение\n\nЗакройте глаза и начните наблюдать за своими мыслями.\n\n(15-20 минут)',
        'II. Доверие\n\nЗакройте глаза и доверьте все мысли Миру.\n\n(15-20 минут)',
        'III. Кошки-мышки\n\nЗакройте глаза и спросите: "Какая будет моя следующая мысль?"\n\n(10-15 минут)',
        'IV. Молчание\n\nЗакройте глаза и просто сидите. Ничего не делайте.\n\n(20-30 минут)'
      ];

      alert(`Медитация ${index + 1}\n\n${meditationTypes[index]}`);
    });
  });

  // FORM
  const leadForm = document.getElementById('lead-form');
  const nameField = document.getElementById('form-name-field');
  const resultBox = document.getElementById('registration-result');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (leadForm && nameField) {
    nameField.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const group = nameField.parentElement;

      if (val.length > 0 && val.length < 3) {
        group.classList.add('invalid');
      } else {
        group.classList.remove('invalid');
      }
    });

    const emailInput = leadForm.querySelector('input[name="userEmail"]');
    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const group = emailInput.parentElement;

        if (val.length > 0 && !emailRegex.test(val)) {
          group.classList.add('invalid');
        } else {
          group.classList.remove('invalid');
        }
      });
    }

    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = nameField.value.trim();
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const nameGroup = nameField.parentElement;
      const emailGroup = emailInput ? emailInput.parentElement : null;

      let isValid = true;

      if (nameVal.length < 3) {
        nameGroup.classList.add('invalid');
        isValid = false;
      } else {
        nameGroup.classList.remove('invalid');
      }

      if (emailVal.length === 0 || !emailRegex.test(emailVal)) {
        if (emailGroup) emailGroup.classList.add('invalid');
        isValid = false;
      } else {
        if (emailGroup) emailGroup.classList.remove('invalid');
      }

      if (!isValid) {
        alert('Исправьте ошибки в форме');
        return;
      }

      const formData = {
        userName: nameVal,
        userEmail: emailVal,
        userLevel: leadForm.querySelector('select[name="userLevel"]').value,
        registeredAt: new Date().toISOString()
      };

      safeLocalStorage('set', 'userProfile', JSON.stringify(formData));

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `Профиль синхронизирован:\n${JSON.stringify(formData, null, 2)}`;
      }

      leadForm.reset();
      nameGroup.classList.remove('invalid');
      if (emailGroup) emailGroup.classList.remove('invalid');

      setTimeout(() => updateStatsDisplay(), 100);
    });

    leadForm.addEventListener('reset', () => {
      if (resultBox) resultBox.style.display = 'none';
      nameField.parentElement.classList.remove('invalid');
      if (emailInput) emailInput.parentElement.classList.remove('invalid');
    });
  }

  // KEYBOARD
  const globalCircle = document.getElementById('global-circle');
  const footerLog = document.getElementById('global-keyboard-log');

  document.addEventListener('keydown', (e) => {
    if (footerLog) {
      footerLog.innerText = `Терминал: [${e.key.toUpperCase()}]`;
    }

    if (e.key === 'Enter') {
      if (globalCircle) globalCircle.classList.add('active');
    } else if (e.key === 'Escape') {
      if (globalCircle) globalCircle.classList.remove('active');
      if (statsModal) statsModal.classList.remove('show');
      closeMenu();
    }

    const inspPage = document.getElementById('page-inspiration');
    if (inspPage && inspPage.classList.contains('active')) {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    }
  });

  // Инициализация видимости кнопки меню
  updateMenuButtonVisibility();

  console.log('Все системы инициализированы!');
});