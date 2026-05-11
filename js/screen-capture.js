/**
 * Demo 5 – Screen Capture API (getDisplayMedia)
 * Captura la pantalla, una ventana o una pestaña del navegador.
 * Soporte: Chrome 72+, Firefox 66+, Safari 13+.
 */
(function () {

  const startBtn  = document.getElementById('screen-start-btn');
  const stopBtn   = document.getElementById('screen-stop-btn');
  const shotBtn   = document.getElementById('screen-shot-btn');
  const videoEl   = document.getElementById('screen-video');
  const imgEl     = document.getElementById('screen-img');
  const statusEl  = document.getElementById('screen-status');

  let stream = null;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  // ── Verificar soporte ─────────────────────────────────────────────────
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    setStatus('⚠️ Screen Capture API no está soportada en este navegador.', 'err');
    startBtn.disabled = true;
    return;
  }

  // ── Iniciar captura ───────────────────────────────────────────────────
  startBtn.addEventListener('click', async () => {

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      videoEl.srcObject = stream;
      videoEl.style.display = 'block';
      imgEl.style.display   = 'none';

      startBtn.disabled = true;
      stopBtn.disabled  = false;
      shotBtn.disabled  = false;
      setStatus('🟢 Captura de pantalla activa.', 'ok');

      // Detectar cuando el usuario detiene desde el navegador
      stream.getVideoTracks()[0].addEventListener('ended', stopCapture);

    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        setStatus('❌ Error al iniciar captura: ' + err.message, 'err');
      } else {
        setStatus('⚠️ Permiso denegado por el usuario.', 'err');
      }
    }
  });

  // ── Detener captura ───────────────────────────────────────────────────
  stopBtn.addEventListener('click', stopCapture);

  function stopCapture() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    videoEl.srcObject = null;
    videoEl.style.display = 'none';
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    shotBtn.disabled  = true;
    setStatus('⏹ Captura detenida.');
  }

  // ── Tomar screenshot ──────────────────────────────────────────────────
  shotBtn.addEventListener('click', () => {

    if (!stream) return;

    const canvas = document.createElement('canvas');
    canvas.width  = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    imgEl.src           = dataURL;
    imgEl.style.display = 'block';

    // Ofrecer descarga
    const a    = document.createElement('a');
    a.href     = dataURL;
    a.download = `screenshot-${Date.now()}.png`;
    a.click();

    setStatus('📸 Screenshot guardado.', 'ok');
  });

})();
