// ============================================
// GRIND & GLOW — Doodle Canvas JavaScript
// Features: Draw, erase, change color/size,
//           clear canvas, download drawing
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- GET CANVAS & CONTEXT ----
  const canvas = document.getElementById('doodleCanvas');
  const ctx = canvas.getContext('2d');

  // ---- STATE ----
  let isDrawing = false;       // Is the mouse/touch currently pressed?
  let currentColor = '#ff7bac'; // Default color: pink
  let brushSize = 5;           // Default brush size in pixels
  let currentTool = 'pen';     // 'pen' or 'eraser'
  let lastX = 0;
  let lastY = 0;

  // ---- SET CANVAS SIZE ----
  // Make canvas fill its container at a good resolution
  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const w = wrapper.clientWidth - 4; // Small offset for border
    const h = Math.round(w * 0.55);    // 16:9-ish ratio

    // Save current drawing before resize
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = w;
    canvas.height = h;

    // Restore drawing
    ctx.putImageData(imageData, 0, 0);

    // Re-apply canvas settings (they reset on resize)
    setCanvasStyle();
  }

  function setCanvasStyle() {
    ctx.lineCap = 'round';   // Smooth rounded brush ends
    ctx.lineJoin = 'round';  // Smooth curves
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = brushSize;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ---- DRAWING EVENTS (Mouse) ----

  canvas.addEventListener('mousedown', function (e) {
    isDrawing = true;
    [lastX, lastY] = getPos(e);
    // Draw a dot if user just clicks without dragging
    ctx.beginPath();
    ctx.arc(lastX, lastY, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentTool === 'eraser' ? getCanvasBg() : currentColor;
    ctx.fill();
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!isDrawing) return;
    draw(e);
  });

  canvas.addEventListener('mouseup',   stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // ---- DRAWING EVENTS (Touch — for mobile) ----

  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault(); // Stop page scrolling
    isDrawing = true;
    const touch = e.touches[0];
    [lastX, lastY] = getPos(touch);
  }, { passive: false });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (!isDrawing) return;
    draw(e.touches[0]);
  }, { passive: false });

  canvas.addEventListener('touchend', stopDrawing);

  // ---- DRAW FUNCTION ----
  function draw(event) {
    const [x, y] = getPos(event);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);   // Start from last position
    ctx.lineTo(x, y);           // Draw to new position

    if (currentTool === 'eraser') {
      ctx.strokeStyle = getCanvasBg();
      ctx.lineWidth = brushSize * 3; // Eraser is bigger
    } else {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Update last position
    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // Get canvas-relative position from mouse or touch event
  function getPos(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
      (event.clientX - rect.left) * scaleX,
      (event.clientY - rect.top) * scaleY
    ];
  }

  // Get canvas background color (for eraser)
  function getCanvasBg() {
    const isDark = document.body.classList.contains('dark');
    return isDark ? '#1a0d14' : '#ffffff';
  }

  // ---- COLOR SWATCHES ----
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      currentColor = swatch.getAttribute('data-color');
      currentTool = 'pen'; // Switch back to pen when picking a color

      // Update active state
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      // Update tool buttons
      updateToolButtons('pen');
    });
  });

  // ---- BRUSH SIZE SLIDER ----
  const sizeSlider = document.getElementById('brushSize');
  const sizeDot = document.getElementById('sizeDot');

  if (sizeSlider) {
    sizeSlider.addEventListener('input', function () {
      brushSize = parseInt(sizeSlider.value);
      // Update the preview dot
      if (sizeDot) {
        sizeDot.style.width  = brushSize + 'px';
        sizeDot.style.height = brushSize + 'px';
      }
    });
  }

  // ---- TOOL BUTTONS (Pen / Eraser) ----
  const penBtn    = document.getElementById('toolPen');
  const eraserBtn = document.getElementById('toolEraser');

  if (penBtn) {
    penBtn.addEventListener('click', function () {
      currentTool = 'pen';
      updateToolButtons('pen');
    });
  }

  if (eraserBtn) {
    eraserBtn.addEventListener('click', function () {
      currentTool = 'eraser';
      updateToolButtons('eraser');
    });
  }

  function updateToolButtons(tool) {
    if (penBtn)    penBtn.classList.toggle('active',    tool === 'pen');
    if (eraserBtn) eraserBtn.classList.toggle('active', tool === 'eraser');
  }

  // ---- CLEAR CANVAS ----
  const clearBtn = document.getElementById('clearCanvas');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (confirm('Clear your doodle? This cannot be undone.')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        showToast('Canvas cleared! Fresh start 🎨');
      }
    });
  }

  // ---- DOWNLOAD DRAWING ----
  const downloadBtn = document.getElementById('downloadCanvas');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      // Create a white-background version for download
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Fill white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw our doodle on top
      tempCtx.drawImage(canvas, 0, 0);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'grind-and-glow-doodle.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();

      showToast('Doodle saved! 💾');
    });
  }

  // ---- SET FIRST SWATCH AS ACTIVE ----
  const firstSwatch = document.querySelector('.color-swatch');
  if (firstSwatch) firstSwatch.classList.add('active');

  // Set initial size dot
  if (sizeDot) {
    sizeDot.style.width = brushSize + 'px';
    sizeDot.style.height = brushSize + 'px';
  }

  // Set pen as active by default
  updateToolButtons('pen');

});

// ---- TOAST ----
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}
