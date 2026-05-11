/**
 * Demo 7 – Device Orientation (DeviceOrientationEvent)
 * Muestra los ángulos alpha, beta y gamma del dispositivo en tiempo real
 * y los visualiza rotando un emoji de teléfono.
 * En iOS 13+ se requiere solicitar permiso explícito.
 */
(function () {

  const btn       = document.getElementById('orientation-btn');
  const alphaEl   = document.getElementById('ori-alpha');
  const betaEl    = document.getElementById('ori-beta');
  const gammaEl   = document.getElementById('ori-gamma');
  const phoneBox  = document.getElementById('phone-box');
  const statusEl  = document.getElementById('orientation-status');

  let active = false;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  function onOrientation(e) {
    const alpha = e.alpha !== null ? e.alpha.toFixed(1) : 'N/A';
    const beta  = e.beta  !== null ? e.beta.toFixed(1)  : 'N/A';
    const gamma = e.gamma !== null ? e.gamma.toFixed(1) : 'N/A';

    alphaEl.textContent = alpha + '°';
    betaEl.textContent  = beta  + '°';
    gammaEl.textContent = gamma + '°';

    // Rotar el emoji de teléfono según beta (inclinación frontal) y gamma (lateral)
    const bVal = parseFloat(beta)  || 0;
    const gVal = parseFloat(gamma) || 0;
    phoneBox.style.transform = `rotateX(${bVal}deg) rotateZ(${gVal}deg)`;
  }

  async function activar() {

    // iOS 13+ requiere permiso explícito
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {

      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          setStatus('⚠️ Permiso de orientación denegado.', 'err');
          return;
        }
      } catch (err) {
        setStatus('❌ Error al solicitar permiso: ' + err.message, 'err');
        return;
      }
    }

    if (!('DeviceOrientationEvent' in window)) {
      setStatus('⚠️ DeviceOrientationEvent no está soportado en este navegador.', 'err');
      return;
    }

    if (!active) {
      window.addEventListener('deviceorientation', onOrientation, true);
      active = true;
      btn.textContent = 'Desactivar orientación';
      setStatus('🟢 Orientación activa – mueve el dispositivo.', 'ok');
    } else {
      window.removeEventListener('deviceorientation', onOrientation, true);
      active = false;
      btn.textContent = 'Activar orientación';
      alphaEl.textContent = betaEl.textContent = gammaEl.textContent = '–';
      phoneBox.style.transform = '';
      setStatus('⏹ Orientación desactivada.');
    }
  }

  btn.addEventListener('click', activar);

})();
