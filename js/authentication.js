/**
 * Demo 2 – Web Authentication API (WebAuthn / Passkeys)
 * Registra una credencial biométrica/PIN y luego la usa para autenticar.
 * Soporte: Chrome 67+, Firefox 60+, Safari 14+.
 */
(function () {

  const registerBtn = document.getElementById('auth-register-btn');
  const loginBtn    = document.getElementById('auth-login-btn');
  const statusEl    = document.getElementById('auth-status');

  // Almacenamiento en memoria de la credencial registrada
  let storedCredentialId = null;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  // Convierte ArrayBuffer → Base64url (para mostrar IDs)
  function bufToB64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // Genera bytes aleatorios como Uint8Array
  function randomBytes(n) {
    return crypto.getRandomValues(new Uint8Array(n));
  }

  // ── Verificar soporte ─────────────────────────────────────────────────
  if (!window.PublicKeyCredential) {
    setStatus('⚠️ WebAuthn no está soportado en este navegador.', 'err');
    registerBtn.disabled = true;
    loginBtn.disabled    = true;
    return;
  }

  // ── Registrar credencial ──────────────────────────────────────────────
  registerBtn.addEventListener('click', async () => {

    setStatus('⏳ Esperando autenticador…');

    const challenge = randomBytes(32);
    const userId    = randomBytes(16);

    const publicKeyOptions = {
      challenge,
      rp: {
        name: 'PWA Demos Taller',
        id: location.hostname   // debe coincidir con el dominio actual
      },
      user: {
        id:          userId,
        name:        'usuario@demo.com',
        displayName: 'Usuario Demo'
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7  },   // ES256
        { type: 'public-key', alg: -257 }   // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',   // biometría del dispositivo
        userVerification: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    };

    try {
      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });

      storedCredentialId = credential.rawId;
      setStatus(`✅ Credencial registrada. ID: ${bufToB64(credential.rawId).slice(0, 20)}…`, 'ok');

    } catch (err) {
      setStatus('❌ Registro fallido: ' + err.message, 'err');
    }
  });

  // ── Autenticar ────────────────────────────────────────────────────────
  loginBtn.addEventListener('click', async () => {

    if (!storedCredentialId) {
      setStatus('⚠️ Primero registra una credencial.', 'err');
      return;
    }

    setStatus('⏳ Verificando identidad…');

    const challenge = randomBytes(32);

    const publicKeyOptions = {
      challenge,
      rpId: location.hostname,
      allowCredentials: [{
        type: 'public-key',
        id:   storedCredentialId
      }],
      userVerification: 'preferred',
      timeout: 60000
    };

    try {
      const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });
      setStatus(`✅ Autenticación exitosa. Credencial: ${bufToB64(assertion.rawId).slice(0, 20)}…`, 'ok');

    } catch (err) {
      setStatus('❌ Autenticación fallida: ' + err.message, 'err');
    }
  });

})();
