/**
 * Demo 8 – Device Motion (DeviceMotionEvent)
 * Muestra la aceleración del dispositivo en los tres ejes y una barra de intensidad.
 * En iOS 13+ se requiere solicitar permiso explícito.
 */
(function () {

  const btn      = document.getElementById('motion-btn');
  const xEl      = document.getElementById('mot-x');
  const yEl      = document.getElementById('mot-y');
  const zEl      = document.getElementById('mot-z');
  const barEl    = document.getElementById('motion-bar');
  const statusEl = document.getElementById('motion-status');

  let active = false;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  function onMotion(e) {
    const acc = e.accelerationIncludingGravity || e.acceleration || {};

    const x = acc.x !== null && acc.x !== undefined ? acc.x.toFixed(2) : 'N/A';
    const y = acc.y !== null && acc.y !== undefined ? acc.y.toFixed(2) : 'N/A';
    const z = acc.z !== null && acc.z !== undefined ? acc.z.toFixed(2) : 'N/A';

    xEl.textContent = x;
    yEl.textContent = y;
    zEl.textContent = z;

    // Calcular magnitud del vector de aceleración para la barra
    const mag = Math.sqrt(
      Math.pow(parseFloat(x) || 0, 2) +
      Math.pow(parseFloat(y) || 0, 2) +
      Math.pow(parseFloat(z) || 0, 2)
    );

    // Normalizar: la gravedad terrestre es ~9.8 m/s², usamos 30 como máximo visual
    const pct = Math.min((mag / 30) * 100, 100).toFixed(1);
    barEl.style.width = pct + '%';
  }

  async function activar() {

    // iOS 13+ requiere permiso explícito
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {

      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== 'granted') {
          setStatus('⚠️ Permiso de movimiento denegado.', 'err');
          return;
        }
      } catch (err) {
        setStatus('❌ Error al solicitar permiso: ' + err.message, 'err');
        return;
      }
    }

    if (!('DeviceMotionEvent' in window)) {
      setStatus('⚠️ DeviceMotionEvent no está soportado en este navegador.', 'err');
      return;
    }

    if (!active) {
      window.addEventListener('devicemotion', onMotion, true);
      active = true;
      btn.textContent = 'Desactivar movimiento';
      setStatus('🟢 Movimiento activo – mueve el dispositivo.', 'ok');
    } else {
      window.removeEventListener('devicemotion', onMotion, true);
      active = false;
      btn.textContent = 'Activar movimiento';
      xEl.textContent = yEl.textContent = zEl.textContent = '–';
      barEl.style.width = '0%';
      setStatus('⏹ Movimiento desactivado.');
    }
  }

  btn.addEventListener('click', activar);

})();
