/**
 * Chaudhary Almond Slice Cookies - 4K Frame Animation Engine
 * 210 Frames (3840x2160 UHD)
 */

(function () {
  'use strict';

  // CONFIGURATION
  const TOTAL_FRAMES = 210;
  const CANVAS_WIDTH = 3840;
  const CANVAS_HEIGHT = 2160;

  // APPLICATION STATE
  const state = {
    currentFrame: 1,
    fps: 30,
    isPlaying: false,
    direction: 1, // 1: forward, -1: reverse
    loopMode: 'loop', // 'loop', 'pingpong', 'once'
    activeMode: 'player', // 'player' or 'scroll'
    isDraggingScrubber: false,
    isDraggingCanvas: false,
    dragStartX: 0,
    dragStartFrame: 1,
    loadedCount: 0,
    readyToPlay: false
  };

  // FRAME ASSET STORAGE
  const frames = new Array(TOTAL_FRAMES + 1); // 1-indexed

  // DOM ELEMENTS
  const animCanvas = document.getElementById('animCanvas');
  const animCtx = animCanvas.getContext('2d');
  const scrollCanvas = document.getElementById('scrollCanvas');
  const scrollCtx = scrollCanvas.getContext('2d');

  // Preloader elements
  const preloader = document.getElementById('preloader');
  const preloadProgressFill = document.getElementById('preloadProgressFill');
  const preloadPercent = document.getElementById('preloadPercent');
  const preloadFramesText = document.getElementById('preloadFramesText');

  // HUD elements
  const hudFrameTag = document.getElementById('hudFrameTag');
  const hudTimeTag = document.getElementById('hudTimeTag');
  const hudFpsTag = document.getElementById('hudFpsTag');

  // Timeline elements
  const timelineTrack = document.getElementById('timelineTrack');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineBuffered = document.getElementById('timelineBuffered');
  const timelineThumb = document.getElementById('timelineThumb');
  const timelineTooltip = document.getElementById('timelineTooltip');
  const tooltipFrame = document.getElementById('tooltipFrame');
  const tooltipTime = document.getElementById('tooltipTime');

  // Controls
  const btnPlayPause = document.getElementById('btnPlayPause');
  const iconPlay = btnPlayPause.querySelector('.icon-play');
  const iconPause = btnPlayPause.querySelector('.icon-pause');
  const btnStepPrev = document.getElementById('btnStepPrev');
  const btnStepNext = document.getElementById('btnStepNext');
  const btnReverse = document.getElementById('btnReverse');
  const currentTimeText = document.getElementById('currentTimeText');
  const totalTimeText = document.getElementById('totalTimeText');
  const currentFrameTag = document.getElementById('currentFrameTag');
  const speedSelect = document.getElementById('speedSelect');
  const btnLoopCycle = document.getElementById('btnLoopCycle');
  const loopModeLabel = document.getElementById('loopModeLabel');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const canvasWrapper = document.getElementById('canvasWrapper');

  // Mode switcher & navigation
  const btnModePlayer = document.getElementById('btnModePlayer');
  const btnModeScroll = document.getElementById('btnModeScroll');
  const btnBackToPlayer = document.getElementById('btnBackToPlayer');
  const scrollIndicatorBar = document.getElementById('scrollIndicatorBar');
  const scrollIndicatorLabel = document.getElementById('scrollIndicatorLabel');

  // Modal
  const btnKeyboardHelp = document.getElementById('btnKeyboardHelp');
  const shortcutsModal = document.getElementById('shortcutsModal');
  const btnCloseModal = document.getElementById('btnCloseModal');

  // UTILITY: Format timecode
  function formatTime(frameIndex, fps) {
    const totalSeconds = (frameIndex - 1) / fps;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  function getFrameFilename(index) {
    return `ezgif-frame-${String(index).padStart(3, '0')}.jpg`;
  }

  // PRELOADER ENGINE
  function initPreloader() {
    let loaded = 0;
    const batchSize = 12; // load concurrently in balanced batches

    function loadFrame(i) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFrameFilename(i);
        img.onload = () => {
          frames[i] = img;
          loaded++;
          state.loadedCount = loaded;
          updatePreloadProgress(loaded);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load frame ${i}`);
          loaded++;
          resolve();
        };
      });
    }

    // Load first frame immediately to draw preview
    const firstImg = new Image();
    firstImg.src = getFrameFilename(1);
    firstImg.onload = () => {
      frames[1] = firstImg;
      drawFrame(1);
      drawScrollFrame(1);
      loaded = 1;
      updatePreloadProgress(1);

      // Load rest of frames progressively
      loadAllBatched();
    };

    async function loadAllBatched() {
      for (let i = 2; i <= TOTAL_FRAMES; i += batchSize) {
        const batch = [];
        for (let j = i; j < i + batchSize && j <= TOTAL_FRAMES; j++) {
          batch.push(loadFrame(j));
        }
        await Promise.all(batch);

        // Start playback once first 30 frames are ready
        if (!state.readyToPlay && loaded >= 30) {
          state.readyToPlay = true;
          preloader.classList.add('hidden');
          play();
        }
      }

      state.readyToPlay = true;
      preloader.classList.add('hidden');
    }
  }

  function updatePreloadProgress(count) {
    const pct = Math.round((count / TOTAL_FRAMES) * 100);
    preloadProgressFill.style.width = `${pct}%`;
    preloadPercent.textContent = `${pct}%`;
    preloadFramesText.textContent = `${count} / ${TOTAL_FRAMES} frames`;
    timelineBuffered.style.width = `${pct}%`;
  }

  // CANVAS RENDERING
  function drawFrame(index) {
    const clamped = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index)));
    state.currentFrame = clamped;
    const img = frames[clamped];

    if (img && img.complete) {
      animCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    updateUI();
  }

  function drawScrollFrame(index) {
    const clamped = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index)));
    const img = frames[clamped];

    if (img && img.complete) {
      scrollCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  // UPDATE UI CONTROLS
  function updateUI() {
    const f = state.currentFrame;
    const fps = state.fps;

    // HUD
    hudFrameTag.textContent = `FRAME ${String(f).padStart(3, '0')}`;
    hudTimeTag.textContent = `${formatTime(f, fps)} / ${formatTime(TOTAL_FRAMES, fps)}`;
    hudFpsTag.textContent = `${fps} FPS`;

    // Dock Time Display
    currentTimeText.textContent = formatTime(f, fps);
    totalTimeText.textContent = formatTime(TOTAL_FRAMES, fps);
    currentFrameTag.textContent = `(${String(f).padStart(3, '0')}/${TOTAL_FRAMES})`;

    // Scrubber
    const pct = ((f - 1) / (TOTAL_FRAMES - 1)) * 100;
    timelineProgress.style.width = `${pct}%`;
    timelineThumb.style.left = `${pct}%`;
  }

  // ANIMATION LOOP (requestAnimationFrame with high-precision timer)
  let lastTime = 0;
  let frameDuration = 1000 / state.fps;
  let rafId = null;

  function animationLoop(timestamp) {
    if (!state.isPlaying) return;

    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed >= frameDuration) {
      lastTime = timestamp - (elapsed % frameDuration);
      advanceFrame();
    }

    rafId = requestAnimationFrame(animationLoop);
  }

  function advanceFrame() {
    let next = state.currentFrame + state.direction;

    if (state.loopMode === 'loop') {
      if (next > TOTAL_FRAMES) next = 1;
      if (next < 1) next = TOTAL_FRAMES;
    } else if (state.loopMode === 'pingpong') {
      if (next > TOTAL_FRAMES) {
        state.direction = -1;
        next = TOTAL_FRAMES - 1;
      } else if (next < 1) {
        state.direction = 1;
        next = 2;
      }
    } else if (state.loopMode === 'once') {
      if (next > TOTAL_FRAMES) {
        pause();
        return;
      } else if (next < 1) {
        pause();
        return;
      }
    }

    drawFrame(next);
  }

  // PLAYBACK CONTROL METHODS
  function play() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    lastTime = 0;
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
    rafId = requestAnimationFrame(animationLoop);
  }

  function pause() {
    state.isPlaying = false;
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function togglePlay() {
    if (state.isPlaying) {
      pause();
    } else {
      // If at end in once mode, loop back to 1
      if (state.loopMode === 'once' && state.currentFrame >= TOTAL_FRAMES) {
        state.currentFrame = 1;
      }
      play();
    }
  }

  function step(delta) {
    pause();
    let target = state.currentFrame + delta;
    if (target < 1) target = TOTAL_FRAMES;
    if (target > TOTAL_FRAMES) target = 1;
    drawFrame(target);
  }

  function setFrame(targetFrame) {
    const clamped = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(targetFrame)));
    drawFrame(clamped);
  }

  // SCRUBBER INTERACTION
  function handleScrub(e) {
    const rect = timelineTrack.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetFrame = Math.round(1 + pos * (TOTAL_FRAMES - 1));
    setFrame(targetFrame);
  }

  timelineTrack.addEventListener('mousedown', (e) => {
    state.isDraggingScrubber = true;
    pause();
    handleScrub(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (state.isDraggingScrubber) {
      handleScrub(e);
    }

    // Update hover tooltip
    const rect = timelineTrack.getBoundingClientRect();
    if (e.clientY >= rect.top - 30 && e.clientY <= rect.bottom + 20 &&
        e.clientX >= rect.left && e.clientX <= rect.right) {
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const hoverFrame = Math.round(1 + pos * (TOTAL_FRAMES - 1));
      tooltipFrame.textContent = `F: ${String(hoverFrame).padStart(3, '0')}`;
      tooltipTime.textContent = formatTime(hoverFrame, state.fps);
      timelineTooltip.style.left = `${pos * 100}%`;
      timelineTooltip.classList.add('visible');
    } else {
      timelineTooltip.classList.remove('visible');
    }
  });

  window.addEventListener('mouseup', () => {
    state.isDraggingScrubber = false;
  });

  // Touch support for timeline
  timelineTrack.addEventListener('touchstart', (e) => {
    state.isDraggingScrubber = true;
    pause();
    handleScrub(e);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (state.isDraggingScrubber) {
      handleScrub(e);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    state.isDraggingScrubber = false;
  });

  // DIRECT CANVAS DRAG-TO-SCRUB
  canvasWrapper.addEventListener('mousedown', (e) => {
    state.isDraggingCanvas = true;
    state.dragStartX = e.clientX;
    state.dragStartFrame = state.currentFrame;
    pause();
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isDraggingCanvas) return;
    const deltaX = e.clientX - state.dragStartX;
    // 5px of movement = 1 frame
    const frameDelta = Math.round(deltaX / 6);
    let target = state.dragStartFrame + frameDelta;
    while (target < 1) target += TOTAL_FRAMES;
    while (target > TOTAL_FRAMES) target -= TOTAL_FRAMES;
    setFrame(target);
  });

  window.addEventListener('mouseup', () => {
    state.isDraggingCanvas = false;
  });

  // Touch drag for canvas
  canvasWrapper.addEventListener('touchstart', (e) => {
    state.isDraggingCanvas = true;
    state.dragStartX = e.touches[0].clientX;
    state.dragStartFrame = state.currentFrame;
    pause();
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!state.isDraggingCanvas) return;
    const deltaX = e.touches[0].clientX - state.dragStartX;
    const frameDelta = Math.round(deltaX / 6);
    let target = state.dragStartFrame + frameDelta;
    while (target < 1) target += TOTAL_FRAMES;
    while (target > TOTAL_FRAMES) target -= TOTAL_FRAMES;
    setFrame(target);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    state.isDraggingCanvas = false;
  });

  // BUTTON HANDLERS
  btnPlayPause.addEventListener('click', togglePlay);
  btnStepPrev.addEventListener('click', () => step(-1));
  btnStepNext.addEventListener('click', () => step(1));

  btnReverse.addEventListener('click', () => {
    state.direction *= -1;
    btnReverse.classList.toggle('active', state.direction === -1);
  });

  // Speed selection
  speedSelect.addEventListener('change', (e) => {
    state.fps = parseInt(e.target.value, 10);
    frameDuration = 1000 / state.fps;
    updateUI();
  });

  // Loop mode cycling
  btnLoopCycle.addEventListener('click', () => {
    if (state.loopMode === 'loop') {
      state.loopMode = 'pingpong';
      loopModeLabel.textContent = 'Ping-Pong';
    } else if (state.loopMode === 'pingpong') {
      state.loopMode = 'once';
      loopModeLabel.textContent = 'Play Once';
    } else {
      state.loopMode = 'loop';
      loopModeLabel.textContent = 'Loop';
    }
  });

  // Fullscreen
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      canvasWrapper.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // MODE SWITCHING (Player vs. Scrollytelling)
  function setMode(mode) {
    state.activeMode = mode;
    if (mode === 'player') {
      document.body.className = 'mode-player';
      btnModePlayer.classList.add('active');
      btnModeScroll.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      pause();
      document.body.className = 'mode-scroll';
      btnModeScroll.classList.add('active');
      btnModePlayer.classList.remove('active');
      handleScroll();
    }
  }

  btnModePlayer.addEventListener('click', () => setMode('player'));
  btnModeScroll.addEventListener('click', () => setMode('scroll'));
  if (btnBackToPlayer) {
    btnBackToPlayer.addEventListener('click', () => setMode('player'));
  }

  // SCROLL-DRIVEN ANIMATION HANDLER
  function handleScroll() {
    if (state.activeMode !== 'scroll') return;

    const scrollSection = document.getElementById('scrollStoryView');
    const rect = scrollSection.getBoundingClientRect();
    const scrollTop = -rect.top;
    const maxScroll = scrollSection.offsetHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
    const targetFrame = Math.round(1 + progress * (TOTAL_FRAMES - 1));

    drawScrollFrame(targetFrame);

    // Indicator
    const pct = Math.round(progress * 100);
    scrollIndicatorBar.style.setProperty('--scroll-pct', `${pct}%`);
    scrollIndicatorLabel.textContent = `Scroll Progress: ${pct}% (Frame ${targetFrame})`;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // KEYBOARD SHORTCUTS
  window.addEventListener('keydown', (e) => {
    // Avoid triggering if focused on an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        step(e.shiftKey ? -10 : -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        step(e.shiftKey ? 10 : 1);
        break;
      case 'Home':
        e.preventDefault();
        setFrame(1);
        break;
      case 'End':
        e.preventDefault();
        setFrame(TOTAL_FRAMES);
        break;
      case 'KeyP':
        btnLoopCycle.click();
        break;
      case 'KeyR':
        btnReverse.click();
        break;
      case 'KeyF':
        btnFullscreen.click();
        break;
      case 'KeyM':
        setMode(state.activeMode === 'player' ? 'scroll' : 'player');
        break;
      case 'Escape':
        shortcutsModal.classList.remove('active');
        break;
    }
  });

  // MODAL HANDLERS
  btnKeyboardHelp.addEventListener('click', () => shortcutsModal.classList.add('active'));
  btnCloseModal.addEventListener('click', () => shortcutsModal.classList.remove('active'));
  shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) shortcutsModal.classList.remove('active');
  });

  // INITIALIZATION
  initPreloader();
})();
