/**
 * Demo 4 – Barcode Detection (Shape Detection API)
 * Escanea códigos QR y de barras desde la cámara trasera.
 * Soporte nativo: Chrome/Edge Android, Chrome Desktop con flag experimental.
 * Fallback: mensaje de no soporte.
 */
(function () {

  const startBtn   = document.getElementById('barcode-start-btn');
  const stopBtn    = document.getElementById('barcode-stop-btn');
  const video      = document.getElementById('barcode-video');
  const canvas     = document.getElementById('barcode-canvas');
  const resultEl   = document.getElementById('barcode-result');
  const ctx        = canvas.getContext('2d');

  let stream   = null;
  let detector = null;
  let rafId    = null;
  let running  = false;

  function setResult(msg, type = '') {
    resultEl.textContent = msg;
    resultEl.className   = 'status ' + type;
  }

  // ── Iniciar ───────────────────────────────────────────────────────────
  startBtn.addEventListener('click', async () => {

    if (typeof BarcodeDetector === 'undefined') {
      setResult('⚠️ BarcodeDetector no está disponible en este navegador. ' +
                'Usa Chrome en Android o activa las flags experimentales en Chrome Desktop.', 'err');
      return;
    }

    // Listar formatos soportados
    const formats = await BarcodeDetector.getSupportedFormats();
    console.log('Formatos de código soportados:', formats);

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },   // cámara trasera en móvil
          width:  { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      video.srcObject = stream;
      await video.play();

      detector = new BarcodeDetector({ formats });

      running = true;
      startBtn.disabled = true;
      stopBtn.disabled  = false;
      setResult('🟢 Escáner activo – apunta a un código QR o de barras…', 'ok');

      scanLoop();

    } catch (err) {
      setResult('❌ Error al acceder a la cámara: ' + err.message, 'err');
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
    setResult('⏹ Escáner detenido.');
  });

  // ── Loop de escaneo ───────────────────────────────────────────────────
  async function scanLoop() {
    if (!running) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const barcodes = await detector.detect(video);

      barcodes.forEach(barcode => {
        const { x, y, width, height } = barcode.boundingBox;

        // Dibujar contorno del código
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth   = 3;
        ctx.strokeRect(x, y, width, height);

        // Dibujar polígono de esquinas si está disponible
        if (barcode.cornerPoints && barcode.cornerPoints.length === 4) {
          ctx.beginPath();
          ctx.moveTo(barcode.cornerPoints[0].x, barcode.cornerPoints[0].y);
          barcode.cornerPoints.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth   = 2;
          ctx.stroke();
        }

        // Mostrar valor decodificado
        ctx.fillStyle = '#f97316';
        ctx.font      = 'bold 14px system-ui';
        ctx.fillText(`${barcode.format}: ${barcode.rawValue}`, x + 4, y - 6);

        setResult(`✅ Código detectado [${barcode.format}]: ${barcode.rawValue}`, 'ok');
      });

    } catch (err) {
      // Ignorar errores de frame vacío
    }

    rafId = requestAnimationFrame(scanLoop);
  }

})();
