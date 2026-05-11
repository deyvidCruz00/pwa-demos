/**
 * Demo 1 – File System Access API
 * Permite abrir y guardar archivos de texto directamente en el sistema de archivos.
 * Soporte: Chrome/Edge 86+. Firefox y Safari usan fallback con <input type="file">.
 */
(function () {

  const openBtn    = document.getElementById('fs-open-btn');
  const saveBtn    = document.getElementById('fs-save-btn');
  const contentEl  = document.getElementById('fs-content');
  const statusEl   = document.getElementById('fs-status');

  // Referencia al FileHandle actual (para sobreescribir el mismo archivo)
  let currentFileHandle = null;

  // ── Helpers ──────────────────────────────────────────────────────────
  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className   = 'status ' + type;
  }

  // ── Abrir archivo ─────────────────────────────────────────────────────
  openBtn.addEventListener('click', async () => {

    // Verificar soporte de la API moderna
    if ( 'showOpenFilePicker' in window ) {

      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: 'Archivos de texto', accept: { 'text/*': ['.txt', '.md', '.js', '.html', '.css', '.json'] } }],
          multiple: false
        });

        currentFileHandle = handle;
        const file = await handle.getFile();
        contentEl.value = await file.text();
        setStatus(`✅ Archivo abierto: ${file.name}`, 'ok');

      } catch (err) {
        if (err.name !== 'AbortError') {
          setStatus('❌ Error al abrir: ' + err.message, 'err');
        }
      }

    } else {
      // Fallback: <input type="file"> clásico
      const input = document.createElement('input');
      input.type   = 'file';
      input.accept = 'text/*';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        contentEl.value = await file.text();
        setStatus(`✅ Archivo abierto (fallback): ${file.name}`, 'ok');
      };
      input.click();
    }
  });

  // ── Guardar archivo ───────────────────────────────────────────────────
  saveBtn.addEventListener('click', async () => {

    if ( 'showSaveFilePicker' in window ) {

      try {
        // Si ya tenemos un handle, sobreescribimos; si no, pedimos destino
        const handle = currentFileHandle || await window.showSaveFilePicker({
          suggestedName: 'documento.txt',
          types: [{ description: 'Archivo de texto', accept: { 'text/plain': ['.txt'] } }]
        });

        const writable = await handle.createWritable();
        await writable.write( contentEl.value );
        await writable.close();

        currentFileHandle = handle;
        setStatus('✅ Archivo guardado correctamente.', 'ok');

      } catch (err) {
        if (err.name !== 'AbortError') {
          setStatus('❌ Error al guardar: ' + err.message, 'err');
        }
      }

    } else {
      // Fallback: descarga como blob
      const blob = new Blob([ contentEl.value ], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'documento.txt';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('✅ Archivo descargado (fallback).', 'ok');
    }
  });

})();
