/**
 * Demo 6 – Audio Recording (MediaRecorder API)
 * Graba audio desde el micrófono y genera reproductores para cada grabación.
 * Soporte: Chrome 47+, Firefox 25+, Safari 14.1+.
 */
(function () {

  const startBtn  = document.getElementById('audio-start-btn');
  const stopBtn   = document.getElementById('audio-stop-btn');
  const listEl    = document.getElementById('audio-list');
  const statusEl  = document.getElementById('audio-status');

  let mediaRecorder = null;
  let audioChunks   = [];
  let recordCount   = 0;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  // ── Verificar soporte ─────────────────────────────────────────────────
  if (typeof MediaRecorder === 'undefined') {
    setStatus('⚠️ MediaRecorder no está soportado en este navegador.', 'err');
    startBtn.disabled = true;
    return;
  }

  // ── Iniciar grabación ─────────────────────────────────────────────────
  startBtn.addEventListener('click', async () => {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Elegir el mejor tipo MIME disponible
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) || '';

      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      audioChunks   = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Detener el stream del micrófono
        stream.getTracks().forEach(t => t.stop());

        const blob     = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        const url      = URL.createObjectURL(blob);
        recordCount++;

        // Crear elemento de audio con botón de descarga
        const wrapper  = document.createElement('div');
        wrapper.style.cssText = 'display:flex;align-items:center;gap:.5rem;';

        const label    = document.createElement('span');
        label.textContent = `#${recordCount}`;
        label.style.cssText = 'font-size:.8rem;color:#64748b;min-width:24px;';

        const audio    = document.createElement('audio');
        audio.controls = true;
        audio.src      = url;
        audio.style.flex = '1';

        const dlBtn    = document.createElement('a');
        dlBtn.href     = url;
        dlBtn.download = `grabacion-${recordCount}.webm`;
        dlBtn.textContent = '⬇';
        dlBtn.title    = 'Descargar';
        dlBtn.style.cssText = 'font-size:1.1rem;text-decoration:none;';

        wrapper.append(label, audio, dlBtn);
        listEl.prepend(wrapper);

        setStatus(`✅ Grabación #${recordCount} lista.`, 'ok');
      };

      mediaRecorder.start(250);   // recopilar datos cada 250 ms

      startBtn.disabled = true;
      stopBtn.disabled  = false;
      setStatus('🔴 Grabando…', 'ok');

    } catch (err) {
      setStatus('❌ Error al acceder al micrófono: ' + err.message, 'err');
    }
  });

  // ── Detener grabación ─────────────────────────────────────────────────
  stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    startBtn.disabled = false;
    stopBtn.disabled  = true;
  });

})();
