document.addEventListener('DOMContentLoaded', function() {
  // --- CONFIG ---
  const TARGET_DATE = new Date(2026, 6, 24); // 7/24/2026 (month is 0-indexed)
  const OVERRIDE_PASSWORD = "111023";
  let isUnlocked = false;
  let isMusicPlaying = false;
  let selectedFlowers = [];
  let selectedWrapperStyle = { label: 'Pink Silk 🎀', class: 'wrap-pink' };
  let currentFlowerData = null;
  let typingInterval = null;
  let letterTyped = false;
  let isTransitioning = false;
  let cakeState = { lit: true, wishCount: 0 };

  // --- DOM refs ---
  const $ = id => document.getElementById(id);
  const clockDays = $('clockDays');
  const clockHours = $('clockHours');
  const clockMinutes = $('clockMinutes');
  const clockSeconds = $('clockSeconds');
  const clockStatus = $('clockStatus');
  const overrideInput = $('overrideInput');
  const overrideBtn = $('overrideBtn');
  const overrideError = $('overrideError');
  const dogModal = $('dog-modal');
  const retryBtn = $('retryBtn');
  const envelopeBox = $('envelopeBox');
  const waxSealBtn = $('waxSealBtn');
  const lightboxModal = $('lightbox-modal');
  const birthdayPopup = $('birthdayPopup');
  const finalBouquetModal = $('final-bouquet-modal');
  const flowerDescModal = $('flower-desc-modal');

  // --- Helpers ---
  function triggerFallingFlowerEffect(emoji) {
    const container = $('popup-flower-effect-container');
    if (!container) return;
    const f = document.createElement('div');
    f.className = 'big-falling-flower';
    f.innerText = emoji;
    f.style.left = (10 + Math.random() * 80) + 'vw';
    f.style.fontSize = (2.4 + Math.random() * 2.4) + 'rem';
    const dur = 2.2 + Math.random() * 1.2;
    f.style.animationDuration = dur + 's';
    container.appendChild(f);
    setTimeout(() => f.remove(), dur * 1000 + 200);
  }

  function launchBloomBurst() {
    const container = $('popup-flower-effect-container');
    if (!container) return;
    const flowerEmojis = ['🌸', '🌷', '🌹', '🌺', '🌻', '🪷', '💐', '🌼'];
    const sparkleEmojis = ['✨', '⭐', '🌟', '💖', '🌸', '🌺', '💕', '🌷'];
    for (let i = 0; i < 26; i++) {
      const f = document.createElement('div');
      f.className = 'big-falling-flower';
      f.innerText = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
      f.style.left = (10 + Math.random() * 80) + 'vw';
      f.style.fontSize = (3.2 + Math.random() * 3.2) + 'rem';
      const d = Math.random() * 0.8;
      f.style.animationDelay = d + 's';
      container.appendChild(f);
      setTimeout(() => f.remove(), 2800 + d * 1000);
    }
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('div');
      s.className = 'big-falling-flower';
      s.innerText = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
      s.style.left = (5 + Math.random() * 90) + 'vw';
      s.style.fontSize = (1.2 + Math.random() * 1.8) + 'rem';
      const d = 0.1 + Math.random() * 0.6;
      s.style.animationDelay = d + 's';
      container.appendChild(s);
      setTimeout(() => s.remove(), 2600 + d * 1000);
    }
  }

  function showScreen(screenId) {
    const target = document.getElementById(screenId);
    if (!target) return;
    const current = document.querySelector('.screen:not(.hidden)');
    if (!current) { reveal(target, screenId); return; }
    if (current === target) return;
    if (isTransitioning) return;
    isTransitioning = true;
    current.classList.add('fade-out');
    setTimeout(() => {
      current.classList.add('hidden');
      current.classList.remove('fade-out');
      reveal(target, screenId);
      isTransitioning = false;
    }, 380);
  }

  function reveal(target, screenId) {
    target.classList.remove('hidden');
    target.classList.add('fade-in-start');
    void target.offsetWidth;
    target.classList.remove('fade-in-start');
    if (screenId === 'message-screen' && !letterTyped) startTypingAnimation();
  }

  function startTypingAnimation() {
    if (letterTyped) return;
    letterTyped = true;
    const container = $('letterContent');
    if (!container) return;
    const fullText =
      "Dearest Birthday Star,\n\nHappy Birthday! Today is all about celebrating you, your kindness, and all the beautiful light you bring into every room you step into.\n\nLooking back at all our shared moments, I feel so lucky for every laugh, every late-night chat, and every quiet adventure we have created together. You have a rare gift of making even ordinary days feel special.\n\nMay this coming year bring you endless happiness, health, fulfillment, and all the dreams you're quietly working toward. Never forget how genuinely appreciated and loved you are.\n\nWith all my love and best wishes,\nForever & Always 💕";
    const paras = fullText.split(/\n\n/);
    let paraIdx = 0,
      charIdx = 0;
    const els = [];
    for (let i = 0; i < paras.length; i++) {
      const p = document.createElement('p');
      p.className = 'letter-p';
      if (i === paras.length - 1) p.classList.add('letter-closing');
      p.textContent = '';
      container.appendChild(p);
      els.push(p);
    }

    function type() {
      if (paraIdx >= paras.length) { const c = container.querySelector('.typing-cursor'); if (c) c.remove(); return; }
      const curr = paras[paraIdx];
      const el = els[paraIdx];
      if (charIdx === 0) el.textContent = '';
      const ch = curr[charIdx];
      if (ch) { el.textContent += ch;
        charIdx++; }
      if (charIdx >= curr.length) {
        paraIdx++;
        charIdx = 0;
        const c = container.querySelector('.typing-cursor');
        if (c) c.remove();
        if (paraIdx < paras.length) { const span = document.createElement('span');
          span.className = 'typing-cursor';
          els[paraIdx].appendChild(span); }
      } else {
        const c = container.querySelector('.typing-cursor');
        if (c) c.remove();
        const span = document.createElement('span');
        span.className = 'typing-cursor';
        el.appendChild(span);
      }
      const body = $('letterBody');
      if (body) body.scrollTop = body.scrollHeight;
    }
    if (typingInterval) clearInterval(typingInterval);
    const firstCursor = document.createElement('span');
    firstCursor.className = 'typing-cursor';
    els[0].appendChild(firstCursor);
    typingInterval = setInterval(type, 25);
  }

  function openLightbox(imgSrc, caption) {
    const img = $('lightbox-img');
    const cap = $('lightbox-caption');
    img.src = imgSrc;
    cap.innerText = caption;
    lightboxModal.classList.remove('hidden');
    img.style.animation = 'none';
    cap.style.animation = 'none';
    void lightboxModal.offsetWidth;
    img.style.animation = '';
    cap.style.animation = '';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function closeBirthdayPopup() {
    birthdayPopup.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function addFlowerToBouquet(emoji, name) {
    triggerFallingFlowerEffect(emoji);
    selectedFlowers.push({ emoji, name });
    const box = $('assembled-flowers');
    const ph = box.querySelector('.placeholder-text');
    if (ph) ph.style.display = 'none';
    const badge = document.createElement('span');
    badge.className = 'bouquet-flower-item';
    badge.innerHTML = `${emoji} ${name}`;
    box.appendChild(badge);
  }

  function resetBouquet() {
    selectedFlowers = [];
    const box = $('assembled-flowers');
    box.innerHTML = '<span class="placeholder-text">Click flowers above to start assembling your custom bouquet!</span>';
  }

  function confirmAndBuildBouquet() {
    if (selectedFlowers.length === 0) { alert('Please select at least one flower before creating your bouquet! 🌸'); return; }
    const cluster = $('final-blooms-cluster');
    cluster.innerHTML = '';
    selectedFlowers.forEach(f => { const s = document.createElement('span');
      s.innerText = f.emoji;
      cluster.appendChild(s); });
    const paper = $('final-wrapper-paper');
    paper.className = `bouquet-wrapper-paper ${selectedWrapperStyle.class}`;
    $('final-ribbon-tag').innerText = selectedWrapperStyle.label;
    for (let i = 0; i < 8; i++) setTimeout(() => { const r = selectedFlowers[Math.floor(Math.random() * selectedFlowers
        .length)].emoji;
      triggerFallingFlowerEffect(r); }, i * 200);
    finalBouquetModal.classList.remove('hidden');
  }

  function initVaultFilters() {
    const btns = document.querySelectorAll('.vault-tags .filter-btn');
    const items = document.querySelectorAll('.vault-grid .vault-item');
    const count = $('vault-count-text');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        btns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        const filter = b.dataset.filter;
        let visible = 0;
        items.forEach(item => {
          const cat = item.dataset.category;
          if (filter === 'all' || filter === cat) { item.classList.remove('hide');
            visible++; } else { item.classList.add('hide'); }
        });
        if (count) count.innerHTML = `<i class="fa-solid fa-database"></i> ${visible} Memories Stored`;
      });
    });
  }

  function initContinuousFlowers() {
    const container = $('falling-flowers-container');
    const emojis = ['🌸', '🌷', '🌺', '🌻', '💐', '🌹', '🪷'];
    setInterval(() => {
      const f = document.createElement('div');
      f.className = 'bg-flower';
      f.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      f.style.left = Math.random() * 100 + 'vw';
      f.style.animationDuration = (Math.random() * 4 + 6) + 's';
      f.style.fontSize = (Math.random() * 1.2 + 1.2) + 'rem';
      container.appendChild(f);
      setTimeout(() => f.remove(), 10000);
    }, 700);
  }

  // --- Cake functions ---
  function makeWish() {
    if (!cakeState.lit) {
      $('cakeMessage').innerHTML =
        '🕯️ The candles are out! <span class="highlight">Click "Relight"</span> to make another wish! ✨';
      return;
    }
    cakeState.wishCount++;
    const wishes = [
      '✨ Your wish has been sent to the stars! ✨',
      '🌟 May all your dreams come true! 🌟',
      '💫 You are magical and wonderful! 💫',
      '🌸 Happiness is following you everywhere! 🌸',
      '🎉 Your birthday wish is on its way! 🎉',
      '💕 You are loved more than you know! 💕',
      '🌺 Every day is a gift, just like you! 🌺',
      '🌟 The universe is conspiring for you! 🌟'
    ];
    const wishText = $('cakeWishText');
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    wishText.innerHTML = `<span class="wish-emoji">💫</span> ${randomWish}`;
    $('cakeMessage').innerHTML =
      `🎂 You made a wish! <span class="highlight">${cakeState.wishCount} wishes</span> so far! 💕`;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const emojis = ['🌸', '🌷', '🌹', '🌺', '🌻', '🪷', '💐', '🎉', '✨', '⭐'];
        triggerFallingFlowerEffect(emojis[Math.floor(Math.random() * emojis.length)]);
      }, i * 150);
    }
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function blowCandles() {
    if (!cakeState.lit) {
      $('cakeMessage').innerHTML =
        '🕯️ The candles are already blown out! Click <span class="highlight">"Relight"</span> to light them again!';
      return;
    }
    cakeState.lit = false;
    const flame = $('candleFlame');
    flame.classList.add('hidden');
    $('cakeMessage').innerHTML = '💨 You blew out the candles! <span class="highlight">🎉 Happy Birthday!</span> ✨';
    $('cakeWishText').innerHTML = '<span class="wish-emoji">🎂</span> Candles are out! Click "Relight" to make another wish!';
    birthdayPopup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const emojis = ['🌸', '🌷', '🌹', '🌺', '🌻', '🪷', '💐', '🎉', '✨', '⭐', '🎂', '🕯️', '🎈', '🎁'];
        triggerFallingFlowerEffect(emojis[Math.floor(Math.random() * emojis.length)]);
      }, i * 120);
    }
    const birthdayAudio = $('birthday-song');
    if (birthdayAudio) { birthdayAudio.currentTime = 0;
      birthdayAudio.play().catch(e => console.log('Audio play blocked:', e)); }
    if (navigator.vibrate) navigator.vibrate(50);
  }

  function relightCandles() {
    cakeState.lit = true;
    const flame = $('candleFlame');
    flame.classList.remove('hidden');
    $('cakeMessage').innerHTML = '🕯️ The candles are lit! <span class="highlight">Tap the cake</span> to make a wish! ✨';
    $('cakeWishText').innerHTML = '<span class="wish-emoji">💫</span> Make a wish, and it might come true!';
    for (let i = 0; i < 4; i++) setTimeout(() => triggerFallingFlowerEffect('🎉'), i * 150);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  // --- UPDATE CLOCK ---
  function updateClock() {
    const now = new Date();
    const diff = TARGET_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      clockDays.textContent = '00';
      clockHours.textContent = '00';
      clockMinutes.textContent = '00';
      clockSeconds.textContent = '00';
      clockStatus.textContent = '🎉 Today is the day! Unlocked!';
      clockStatus.className = 'clock-status unlocked';
      if (!isUnlocked) {
        isUnlocked = true;
        showScreen('welcome-screen');
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    clockDays.textContent = String(days).padStart(2, '0');
    clockHours.textContent = String(hours).padStart(2, '0');
    clockMinutes.textContent = String(minutes).padStart(2, '0');
    clockSeconds.textContent = String(seconds).padStart(2, '0');
    clockStatus.textContent = '🔒 Waiting for 7/24/2026';
    clockStatus.className = 'clock-status locked';
  }

  // --- UNLOCK ACTION ---
  function performUnlock() {
    if (isUnlocked) return;
    isUnlocked = true;
    showScreen('welcome-screen');
    const container = $('popup-flower-effect-container');
    if (container) {
      const emojis = ['🌸', '🌷', '🌹', '🌺', '🌻', '🪷', '💐', '🎉', '✨', '⭐'];
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const f = document.createElement('div');
          f.className = 'big-falling-flower';
          f.innerText = emojis[Math.floor(Math.random() * emojis.length)];
          f.style.left = (10 + Math.random() * 80) + 'vw';
          f.style.fontSize = (2.4 + Math.random() * 2.4) + 'rem';
          f.style.position = 'absolute';
          f.style.top = '-80px';
          f.style.animation = 'bigFlowerFall 2.8s cubic-bezier(0.25,1,0.5,1) forwards';
          f.style.filter = 'drop-shadow(0 12px 20px rgba(0,0,0,0.08))';
          container.appendChild(f);
          setTimeout(() => f.remove(), 3000);
        }, i * 150);
      }
    }
    const audio = $('birthday-song');
    if (audio) { audio.currentTime = 0;
      audio.play().catch(e => console.log('audio blocked')); }
  }

  // --- CHECK OVERRIDE ---
  function checkOverride() {
    const val = overrideInput.value.trim();
    if (val === OVERRIDE_PASSWORD) {
      overrideError.textContent = '';
      performUnlock();
    } else {
      overrideError.textContent = '❌ Incorrect override code';
      dogModal.classList.remove('hidden');
      overrideInput.value = '';
      overrideInput.focus();
    }
  }

  // --- EVENT BINDINGS ---
  overrideBtn.addEventListener('click', checkOverride);
  overrideInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') checkOverride();
  });

  retryBtn.addEventListener('click', function() {
    dogModal.classList.add('hidden');
    overrideInput.focus();
  });
  dogModal.addEventListener('click', function(e) {
    if (e.target === this) { this.classList.add('hidden');
      overrideInput.focus(); }
  });

  // Envelope
  function openEnvelope() {
    if (!envelopeBox) return;
    if (envelopeBox.classList.contains('open')) return;
    const birthdayAudio = $('birthday-song');
    if (birthdayAudio) { birthdayAudio.currentTime = 0;
      birthdayAudio.play().catch(e => console.log(e)); }
    envelopeBox.classList.add('open');
    const hint = document.querySelector('.envelope-hint');
    if (hint) { hint.style.transition = 'opacity 0.6s ease';
      hint.style.opacity = '0.3'; }
    launchBloomBurst();
    for (let i = 0; i < 6; i++) setTimeout(() => {
      const emojis = ['🌸', '🌷', '🌹', '🌺', '🌻', '🪷', '💐', '🌼'];
      triggerFallingFlowerEffect(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 200 + i * 150);
    setTimeout(() => showScreen('menu-screen'), 1500);
  }
  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', function(e) { e.stopPropagation();
      openEnvelope(); });
  }
  if (envelopeBox) {
    envelopeBox.addEventListener('click', function(e) {
      if (!e.target.closest('.wax-seal-btn')) openEnvelope();
    });
  }

  // Menu cards
  document.querySelectorAll('.menu-card[data-screen]').forEach(c => c.addEventListener('click', function() { showScreen(
      this.dataset.screen); }));
  document.querySelectorAll('.back-btn[data-back]').forEach(b => b.addEventListener('click', function() { showScreen(this
      .dataset.back); }));
  document.querySelectorAll('.album-card[data-screen]').forEach(c => c.addEventListener('click', function() { showScreen(
      this.dataset.screen); }));

  // Flowers
  document.querySelectorAll('.flower-item').forEach(item => item.addEventListener('click', function() {
    const name = this.dataset.flower;
    const emoji = this.dataset.emoji;
    const desc = this.dataset.desc;
    currentFlowerData = { name, emoji };
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(name);
      u.rate = 0.9;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u); }
    $('desc-flower-emoji').textContent = emoji;
    $('desc-flower-name').textContent = name;
    $('desc-flower-text').textContent = desc;
    flowerDescModal.classList.remove('hidden');
  }));

  $('addToBouquetFromDesc').addEventListener('click', function() {
    if (currentFlowerData) { addFlowerToBouquet(currentFlowerData.emoji, currentFlowerData.name);
      flowerDescModal.classList.add('hidden');
      currentFlowerData = null; }
  });
  $('closeFlowerDescBtn').addEventListener('click', function() { flowerDescModal.classList.add('hidden'); });
  flowerDescModal.addEventListener('click', function(e) { if (e.target === this) this.classList.add('hidden'); });

  // Bouquet
  $('resetBouquetBtn').addEventListener('click', resetBouquet);
  $('createBouquetBtn').addEventListener('click', confirmAndBuildBouquet);
  $('closeFinalBouquetBtn').addEventListener('click', function() { finalBouquetModal.classList.add('hidden'); });
  $('keepBouquetBtn').addEventListener('click', function() { finalBouquetModal.classList.add('hidden'); });
  finalBouquetModal.addEventListener('click', function(e) { if (e.target === this) this.classList.add('hidden'); });

  document.querySelectorAll('.wrapper-btn').forEach(b => b.addEventListener('click', function() {
    selectedWrapperStyle = { label: this.dataset.wrapper, class: this.dataset.class };
    document.querySelectorAll('.wrapper-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
  }));

  // Vinyl / Music
  $('vinyl-record').addEventListener('click', function() {
    const audio = $('bg-music');
    const status = $('vinyl-status');
    if (isMusicPlaying) {
      audio.pause();
      this.classList.remove('spinning');
      status.innerText = 'Music Paused ⏸️ Click record to play';
      isMusicPlaying = false;
    } else {
      audio.play().then(() => { this.classList.add('spinning');
        status.innerText = 'Playing melody... 🎶 Click to pause';
        isMusicPlaying = true; }).catch(e => console.log(e));
    }
  });
  $('song-select').addEventListener('change', function() {
    const audio = $('bg-music');
    audio.src = this.value;
    if (isMusicPlaying) audio.play();
  });

  // Photos lightbox
  document.querySelectorAll('.photo-card[data-img]').forEach(c => c.addEventListener('click', function() { openLightbox(
      this.dataset.img, this.dataset.caption); }));
  document.querySelectorAll('.vault-item').forEach(item => item.addEventListener('click', function() { openLightbox(this
      .dataset.img, this.dataset.caption); }));
  $('closeLightboxBtn').addEventListener('click', closeLightbox);
  lightboxModal.addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });

  // Birthday popup
  $('birthdayPopupClose').addEventListener('click', closeBirthdayPopup);
  $('birthdayPopupBtn').addEventListener('click', closeBirthdayPopup);
  birthdayPopup.addEventListener('click', function(e) { if (e.target === this) closeBirthdayPopup(); });

  // Cake
  $('cakeEmoji').addEventListener('click', makeWish);
  $('cakeWishBtn').addEventListener('click', makeWish);
  $('cakeBlowBtn').addEventListener('click', blowCandles);
  $('cakeResetBtn').addEventListener('click', relightCandles);

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dogModal.classList.add('hidden');
      flowerDescModal.classList.add('hidden');
      finalBouquetModal.classList.add('hidden');
      closeLightbox();
      closeBirthdayPopup();
    }
  });

  // --- INIT ---
  updateClock();
  setInterval(updateClock, 1000);

  const now = new Date();
  if (now.getTime() >= TARGET_DATE.getTime()) {
    isUnlocked = true;
    setTimeout(() => {
      showScreen('welcome-screen');
      clockStatus.textContent = '🎉 Today is the day! Unlocked!';
      clockStatus.className = 'clock-status unlocked';
    }, 100);
  }

  initContinuousFlowers();
  initVaultFilters();

  console.log('🌸 Her Special Day · 7.24.2026');
  console.log('🔑 Override code: 111023');
  console.log('💕 Enjoy your special birthday experience!');
});
