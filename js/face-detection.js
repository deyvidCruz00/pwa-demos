/**
 * Demo 3 – Face Detection con face-api.js (TensorFlow.js)
 * Usa el modelo TinyFaceDetector que corre 100% en el navegador,
 * sin depender de la Shape Detection API experimental.
 */
(function () {

  const startBtn  = document.getElementById('face-start-btn');
  const stopBtn   = document.getElementById('face-stop-btn');
  const video     = document.getElementById('face-video');
  const canvas    = document.getElementById('face-canvas');
  const statusEl  = document.getElementById('face-status');
  const ctx       = canvas.getContext('2d');

  let stream        = null;
  let rafId         = null;
  let running       = false;
  let modelsLoaded  = false;
  let lastFaceCount = -1;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  // ── Cargar modelos al arrancar la página ──────────────────────────────
  async function loadModels() {
    try {
      setStatus('⏳ Cargando modelo de detección…', '');
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
      modelsLoaded = true;
      setStatus('✅ Modelo listo. Pulsa "Iniciar cámara".', 'ok');
    } catch (err) {
      setStatus('❌ Error cargando modelo: ' + err.message, 'err');
      console.error('[FaceDetection] Error cargando modelos:', err);
    }
  }

  loadModels();

  // ── Iniciar ───────────────────────────────────────────────────────────
  startBtn.addEventListener('click', async () => {
    if (!modelsLoaded) {
      setStatus('⏳ El modelo aún se está cargando, espera un momento…', '');
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });

      video.srcObject = stream;
      await video.play();

      running = true;
      lastFaceCount = -1;
      startBtn.disabled = true;
      stopBtn.disabled  = false;
      setStatus('🟢 Cámara activa – detectando rostros…', 'ok');

      detectLoop();

    } catch (err) {
      setStatus('❌ Error al acceder a la cámara: ' + err.message, 'err');
    }
  });

  // ── Detener ───────────────────────────────────────────────────────────
  stopBtn.addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(rafId);
    if (stream) stream.getTracks().forEach(t => t.stop());
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    lastFaceCount = -1;
    setStatus('⏹ Cámara detenida.');
  });

  // ── Loop de detección ─────────────────────────────────────────────────
  async function detectLoop() {
    if (!running) return;

    // Sincronizar tamaño del canvas con el video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const detections = await faceapi.detectAllFaces(video, options);
      const count = detections.length;

      // Escalar detecciones al tamaño real del canvas
      const resized = faceapi.resizeResults(detections, {
        width: canvas.width,
        height: canvas.height
      });

      resized.forEach((det, i) => {
        const { x, y, width, height } = det.box;
        const score = (det.score * 100).toFixed(0);

        // Rectángulo
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth   = 3;
        ctx.strokeRect(x, y, width, height);

        // Fondo de etiqueta
        const label = `Rostro ${i + 1}  (${score}%)`;
        ctx.font = 'bold 13px system-ui';
        const textW = ctx.measureText(label).width + 12;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
        ctx.fillRect(x, y - 24, textW, 22);

        // Texto
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x + 6, y - 7);
      });

      // Actualizar status solo cuando cambia el conteo
      if (count !== lastFaceCount) {
        lastFaceCount = count;
        if (count === 0) {
          setStatus('👀 Detector activo – ningún rostro en cuadro', '');
        } else if (count === 1) {
          setStatus('✅ ¡Rostro detectado! (1 rostro)', 'ok');
        } else {
          setStatus(`✅ ¡${count} rostros detectados!`, 'ok');
        }
        console.log(`[FaceDetection] ${count} rostro(s)`, resized);
      }

    } catch (err) {
      console.warn('[FaceDetection] Error en frame:', err);
    }

    rafId = requestAnimationFrame(detectLoop);
  }

})();
