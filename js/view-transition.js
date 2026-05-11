/**
 * Demo 10 – View Transitions API
 * Anima el cambio entre vistas usando la API nativa de transiciones.
 * Soporte nativo: Chrome 111+. Fallback con animaciones CSS para otros navegadores.
 */
(function () {

  const btn1     = document.getElementById('vt-btn1');
  const btn2     = document.getElementById('vt-btn2');
  const btn3     = document.getElementById('vt-btn3');
  const vtView   = document.getElementById('vt-view');
  const statusEl = document.getElementById('vt-status');

  const views = {
    1: {
      class: 'vt-view-1',
      html: `<h3>🏠 Vista 1</h3>
             <p>Contenido de la primera vista. Haz clic en los botones para ver la transición animada.</p>`
    },
    2: {
      class: 'vt-view-2',
      html: `<h3>🌿 Vista 2</h3>
             <p>Segunda vista con un fondo verde. La transición usa la <strong>View Transitions API</strong>.</p>`
    },
    3: {
      class: 'vt-view-3',
      html: `<h3>⭐ Vista 3</h3>
             <p>Tercera vista con fondo amarillo. En navegadores sin soporte se usa una animación CSS de respaldo.</p>`
    }
  };

  let currentView = 1;

  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  // ── Actualizar botones activos ────────────────────────────────────────
  function updateButtons(active) {
    [btn1, btn2, btn3].forEach((b, i) => {
      b.classList.toggle('active-vt', i + 1 === active);
    });
  }

  // ── Cambiar vista ─────────────────────────────────────────────────────
  function changeView(num) {
    if (num === currentView) return;

    const view = views[num];

    const doChange = () => {
      // Quitar clases de color anteriores
      vtView.className = 'vt-view ' + view.class;
      vtView.innerHTML = view.html;
      currentView = num;
      updateButtons(num);
    };

    // Usar View Transitions API si está disponible
    if (document.startViewTransition) {
      const transition = document.startViewTransition(doChange);
      transition.ready
        .then(() => setStatus('✅ Transición nativa (View Transitions API).', 'ok'))
        .catch(() => setStatus('⚠️ Transición con error.', 'err'));
    } else {
      // Fallback: animación CSS manual
      vtView.classList.add('vt-leave');

      vtView.addEventListener('animationend', function handler() {
        vtView.removeEventListener('animationend', handler);
        vtView.classList.remove('vt-leave');
        doChange();
        vtView.classList.add('vt-enter');
        vtView.addEventListener('animationend', function h2() {
          vtView.removeEventListener('animationend', h2);
          vtView.classList.remove('vt-enter');
        });
      });

      setStatus('ℹ️ Transición con fallback CSS (View Transitions API no disponible).');
    }
  }

  btn1.addEventListener('click', () => changeView(1));
  btn2.addEventListener('click', () => changeView(2));
  btn3.addEventListener('click', () => changeView(3));

  // Mostrar soporte al cargar
  if (document.startViewTransition) {
    setStatus('✅ View Transitions API soportada en este navegador.', 'ok');
  } else {
    setStatus('ℹ️ View Transitions API no disponible – usando fallback CSS.');
  }

})();
