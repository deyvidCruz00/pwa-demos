/**
 * Demo 9 – Multitouch (Touch Events)
 * Detecta y visualiza múltiples puntos de contacto simultáneos.
 * Soporte: todos los navegadores móviles modernos.
 */
(function () {

  const touchArea = document.getElementById('touch-area');
  const statusEl  = document.getElementById('touch-status');

  // Mapa de puntos activos: identifier → elemento DOM
  const activeDots = new Map();

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  // ── Verificar soporte ─────────────────────────────────────────────────
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
    setStatus('⚠️ Touch Events no detectados. Prueba en un dispositivo táctil o activa la emulación en DevTools.');
    touchArea.querySelector('span').textContent = 'Sin soporte táctil detectado';
  } else {
    touchArea.querySelector('span').textContent = 'Toca aquí con varios dedos';
  }

  // ── Crear punto visual ────────────────────────────────────────────────
  function createDot(touch) {
    const rect = touchArea.getBoundingClientRect();
    const dot  = document.createElement('div');
    dot.className = 'touch-dot';
    dot.textContent = touch.identifier + 1;

    updateDotPosition(dot, touch, rect);
    touchArea.appendChild(dot);
    activeDots.set(touch.identifier, dot);
  }

  function updateDotPosition(dot, touch, rect) {
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
  }

  function removeDot(identifier) {
    const dot = activeDots.get(identifier);
    if (dot) {
      dot.remove();
      activeDots.delete(identifier);
    }
  }

  function updateStatus() {
    setStatus(`Puntos activos: ${activeDots.size}`);
  }

  // ── Eventos táctiles ──────────────────────────────────────────────────
  touchArea.addEventListener('touchstart', e => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(createDot);
    updateStatus();
  }, { passive: false });

  touchArea.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = touchArea.getBoundingClientRect();
    Array.from(e.changedTouches).forEach(touch => {
      const dot = activeDots.get(touch.identifier);
      if (dot) updateDotPosition(dot, touch, rect);
    });
  }, { passive: false });

  touchArea.addEventListener('touchend', e => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => removeDot(t.identifier));
    updateStatus();
  }, { passive: false });

  touchArea.addEventListener('touchcancel', e => {
    Array.from(e.changedTouches).forEach(t => removeDot(t.identifier));
    updateStatus();
  });

  // ── Soporte de mouse para pruebas en desktop ──────────────────────────
  let mouseDown = false;
  touchArea.addEventListener('mousedown', e => {
    mouseDown = true;
    const fakeDot = document.createElement('div');
    fakeDot.className = 'touch-dot';
    fakeDot.textContent = '1';
    fakeDot.style.left = (e.offsetX) + 'px';
    fakeDot.style.top  = (e.offsetY) + 'px';
    fakeDot.id = 'mouse-dot';
    touchArea.appendChild(fakeDot);
    setStatus('Puntos activos: 1 (mouse)');
  });

  touchArea.addEventListener('mousemove', e => {
    if (!mouseDown) return;
    const dot = document.getElementById('mouse-dot');
    if (dot) {
      dot.style.left = e.offsetX + 'px';
      dot.style.top  = e.offsetY + 'px';
    }
  });

  touchArea.addEventListener('mouseup', () => {
    mouseDown = false;
    const dot = document.getElementById('mouse-dot');
    if (dot) dot.remove();
    setStatus('Puntos activos: 0');
  });

  touchArea.addEventListener('mouseleave', () => {
    if (mouseDown) {
      mouseDown = false;
      const dot = document.getElementById('mouse-dot');
      if (dot) dot.remove();
      setStatus('Puntos activos: 0');
    }
  });

})();
