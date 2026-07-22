// ==========================================================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================================================
const CORRECT_PASSKEY = "0724";
let isMusicPlaying = false;

// BOUQUET STATE
let selectedFlowers = [];
let selectedWrapperStyle = { label: 'Pink Silk 🎀', class: 'wrap-pink' };
let currentFlowerData = null;

document.addEventListener("DOMContentLoaded", () => {
  initContinuousFlowers();
  initVaultFilters();
  initEventListeners();
});

// ==========================================================================
// STEP 1: PASSKEY LOCK SCREEN
// ==========================================================================
function movePinFocus(currentIdx) {
  const currentInput = document.getElementById(`pin-${currentIdx}`);
  
  if (currentInput.value.length === 1 && currentIdx < 4) {
    document.getElementById(`pin-${currentIdx + 1}`).focus();
  }
  
  if (currentIdx === 4 && currentInput.value.length === 1) {
    checkPasskey();
  }
}

function checkPasskey() {
  const pin1 = document.getElementById("pin-1").value;
  const pin2 = document.getElementById("pin-2").value;
  const pin3 = document.getElementById("pin-3").value;
  const pin4 = document.getElementById("pin-4").value;
  
  const enteredPin = pin1 + pin2 + pin3 + pin4;

  if (enteredPin === CORRECT_PASSKEY) {
    showScreen("welcome-screen");
  } else {
    // Shake animation + vibration
    const container = document.getElementById("pinContainer");
    container.classList.remove("shake");
    // Force reflow
    void container.offsetWidth;
    container.classList.add("shake");
    
    // Vibration API if available
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    document.getElementById("dog-modal").classList.remove("hidden");
    for (let i = 1; i <= 4; i++) {
      document.getElementById(`pin-${i}`).value = "";
    }
    document.getElementById("pin-1").focus();
  }
}

function closeDogModal() {
  document.getElementById("dog-modal").classList.add("hidden");
}

// ==========================================================================
// STEP 2: ENVELOPE WELCOME SCREEN
// ==========================================================================
function openEnvelope() {
  showScreen("menu-screen");
}

// ==========================================================================
// NAVIGATION (SCREEN SWITCHING)
// ==========================================================================
function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => screen.classList.add("hidden"));

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove("hidden");
  }
}

// ==========================================================================
// STEP 5: GARDEN ROW & BOUQUET CREATION LOGIC
// ==========================================================================
function showFlowerDescription(flowerName, emoji, description) {
  currentFlowerData = { name: flowerName, emoji: emoji };
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(flowerName);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }

  document.getElementById('desc-flower-emoji').textContent = emoji;
  document.getElementById('desc-flower-name').textContent = flowerName;
  document.getElementById('desc-flower-text').textContent = description;
  document.getElementById('flower-desc-modal').classList.remove('hidden');
}

function addFlowerToBouquetFromDesc() {
  if (currentFlowerData) {
    addFlowerToBouquet(currentFlowerData.emoji, currentFlowerData.name);
    document.getElementById('flower-desc-modal').classList.add('hidden');
    currentFlowerData = null;
  }
}

function addFlowerToBouquet(emoji, name) {
  triggerFallingFlowerEffect(emoji);
  selectedFlowers.push({ emoji, name });

  const bouquetBox = document.getElementById("assembled-flowers");
  const placeholder = bouquetBox.querySelector(".placeholder-text");
  if (placeholder) {
    placeholder.style.display = "none";
  }

  const flowerBadge = document.createElement("span");
  flowerBadge.className = "bouquet-flower-item";
  flowerBadge.innerHTML = `${emoji} ${name}`;
  bouquetBox.appendChild(flowerBadge);
}

function triggerFallingFlowerEffect(emoji) {
  const container = document.getElementById("popup-flower-effect-container");
  const flower = document.createElement("div");
  flower.className = "big-falling-flower";
  flower.innerText = emoji;
  
  const randomX = Math.random() * 80 + 10;
  flower.style.left = randomX + "vw";
  
  container.appendChild(flower);

  setTimeout(() => {
    flower.remove();
  }, 2800);
}

function selectWrapper(label, cssClass) {
  selectedWrapperStyle = { label, class: cssClass };

  const wrapperBtns = document.querySelectorAll(".wrapper-btn");
  wrapperBtns.forEach((btn) => {
    const btnLabel = btn.getAttribute('data-wrapper');
    if (btnLabel === label) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function resetBouquet() {
  selectedFlowers = [];
  const bouquetBox = document.getElementById("assembled-flowers");
  bouquetBox.innerHTML = '<span class="placeholder-text">Click flowers above to start assembling your custom bouquet!</span>';
}

function confirmAndBuildBouquet() {
  if (selectedFlowers.length === 0) {
    alert("Please select at least one flower before creating your bouquet! 🌸");
    return;
  }

  const bloomsContainer = document.getElementById("final-blooms-cluster");
  bloomsContainer.innerHTML = "";
  
  selectedFlowers.forEach((flower) => {
    const span = document.createElement("span");
    span.innerText = flower.emoji;
    bloomsContainer.appendChild(span);
  });

  const wrapperPaper = document.getElementById("final-wrapper-paper");
  wrapperPaper.className = `bouquet-wrapper-paper ${selectedWrapperStyle.class}`;
  
  const ribbonTag = document.getElementById("final-ribbon-tag");
  ribbonTag.innerText = selectedWrapperStyle.label;

  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const randomFlower = selectedFlowers[Math.floor(Math.random() * selectedFlowers.length)].emoji;
      triggerFallingFlowerEffect(randomFlower);
    }, i * 200);
  }

  document.getElementById("final-bouquet-modal").classList.remove("hidden");
}

function closeFinalBouquetModal() {
  document.getElementById("final-bouquet-modal").classList.add("hidden");
}

// ==========================================================================
// PHOTO VAULT CATEGORY FILTER
// ==========================================================================
function initVaultFilters() {
  const filterButtons = document.querySelectorAll(".vault-tags .filter-btn");
  const vaultItems = document.querySelectorAll(".vault-grid .vault-item");
  const vaultCountText = document.getElementById("vault-count-text");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");
      let visibleCount = 0;

      vaultItems.forEach((item) => {
        const itemCategory = item.getAttribute("data-category");

        if (filterValue === "all" || filterValue === itemCategory) {
          item.classList.remove("hide");
          visibleCount++;
        } else {
          item.classList.add("hide");
        }
      });

      if (vaultCountText) {
        vaultCountText.innerHTML = `<i class="fa-solid fa-database"></i> ${visibleCount} Memories Stored`;
      }
    });
  });
}

// ==========================================================================
// MUSIC PLAYER & VINYL CONTROL
// ==========================================================================
function toggleMusic() {
  const audio = document.getElementById("bg-music");
  const vinyl = document.getElementById("vinyl-record");
  const statusText = document.getElementById("vinyl-status");

  if (isMusicPlaying) {
    audio.pause();
    vinyl.classList.remove("spinning");
    statusText.innerText = "Music Paused ⏸️ Click record to play";
    isMusicPlaying = false;
  } else {
    audio.play().then(() => {
      vinyl.classList.add("spinning");
      statusText.innerText = "Playing melody... 🎶 Click to pause";
      isMusicPlaying = true;
    }).catch(err => {
      console.log("Audio playback blocked by browser:", err);
    });
  }
}

function changeSong(newSrc) {
  const audio = document.getElementById("bg-music");
  audio.src = newSrc;
  if (isMusicPlaying) {
    audio.play();
  }
}

// ==========================================================================
// LIGHTBOX MODAL FOR IMAGES
// ==========================================================================
function openLightbox(imgSrc, captionText) {
  const lightbox = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  img.src = imgSrc;
  caption.innerText = captionText;
  lightbox.classList.remove("hidden");
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById("lightbox-modal").classList.add("hidden");
  document.body.style.overflow = '';
}

// ==========================================================================
// BACKGROUND CONTINUOUS FALLING FLOWERS
// ==========================================================================
function initContinuousFlowers() {
  const container = document.getElementById("falling-flowers-container");
  const flowerEmojis = ["🌸", "🌷", "🌺", "🌻", "💐", "🌹", "🪷"];

  setInterval(() => {
    const flower = document.createElement("div");
    flower.className = "bg-flower";
    flower.innerText = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
    
    flower.style.left = Math.random() * 100 + "vw";
    flower.style.animationDuration = (Math.random() * 4 + 6) + "s";
    flower.style.fontSize = (Math.random() * 1.2 + 1.2) + "rem";

    container.appendChild(flower);

    setTimeout(() => {
      flower.remove();
    }, 10000);
  }, 700);
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function initEventListeners() {
  document.getElementById("unlockBtn").addEventListener("click", checkPasskey);
  document.getElementById("retryBtn").addEventListener("click", closeDogModal);
  document.getElementById("envelopeBox").addEventListener("click", openEnvelope);
  
  document.querySelectorAll(".menu-card[data-screen]").forEach(card => {
    card.addEventListener("click", function() {
      showScreen(this.dataset.screen);
    });
  });
  
  document.querySelectorAll(".back-btn[data-back]").forEach(btn => {
    btn.addEventListener("click", function() {
      showScreen(this.dataset.back);
    });
  });
  
  document.querySelectorAll(".album-card[data-screen]").forEach(card => {
    card.addEventListener("click", function() {
      showScreen(this.dataset.screen);
    });
  });
  
  document.querySelectorAll(".flower-item").forEach(item => {
    item.addEventListener("click", function() {
      const name = this.dataset.flower;
      const emoji = this.dataset.emoji;
      const desc = this.dataset.desc;
      showFlowerDescription(name, emoji, desc);
    });
  });
  
  document.getElementById("addToBouquetFromDesc").addEventListener("click", addFlowerToBouquetFromDesc);
  
  document.getElementById("closeFlowerDescBtn").addEventListener("click", function() {
    document.getElementById("flower-desc-modal").classList.add("hidden");
  });
  document.getElementById("flower-desc-modal").addEventListener("click", function(e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });
  
  document.getElementById("resetBouquetBtn").addEventListener("click", resetBouquet);
  document.getElementById("createBouquetBtn").addEventListener("click", confirmAndBuildBouquet);
  
  document.getElementById("closeFinalBouquetBtn").addEventListener("click", closeFinalBouquetModal);
  document.getElementById("keepBouquetBtn").addEventListener("click", closeFinalBouquetModal);
  document.getElementById("final-bouquet-modal").addEventListener("click", function(e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });
  
  document.querySelectorAll(".wrapper-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const label = this.dataset.wrapper;
      const cssClass = this.dataset.class;
      selectWrapper(label, cssClass);
    });
  });
  
  document.getElementById("vinyl-record").addEventListener("click", toggleMusic);
  
  document.getElementById("song-select").addEventListener("change", function() {
    changeSong(this.value);
  });
  
  document.querySelectorAll(".photo-card[data-img]").forEach(card => {
    card.addEventListener("click", function() {
      openLightbox(this.dataset.img, this.dataset.caption);
    });
  });
  
  document.querySelectorAll(".vault-item").forEach(item => {
    item.addEventListener("click", function() {
      openLightbox(this.dataset.img, this.dataset.caption);
    });
  });
  
  document.getElementById("closeLightboxBtn").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-modal").addEventListener("click", function(e) {
    if (e.target === this) closeLightbox();
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDogModal();
      document.getElementById("flower-desc-modal").classList.add("hidden");
      closeFinalBouquetModal();
      closeLightbox();
    }
  });
  
  document.querySelectorAll(".pin-digit").forEach((input, index) => {
    input.addEventListener("input", function() {
      if (this.value.length === 1 && index < 3) {
        document.querySelectorAll(".pin-digit")[index + 1].focus();
      }
      if (index === 3 && this.value.length === 1) {
        checkPasskey();
      }
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Backspace" && this.value.length === 0 && index > 0) {
        document.querySelectorAll(".pin-digit")[index - 1].focus();
      }
    });
  });
}

console.log("🌸 Happy Birthday! Passkey: 0724");
console.log("💕 Enjoy your special birthday experience!");
