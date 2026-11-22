// 8-Bit Casino: shared script for every page (Step 7: gallery lightbox).
// Classic script (not a module) so pages work when opened straight from the file system.

/**
 * Wrap a gallery index so "next" after the last image goes to the first, and
 * "previous" before the first goes to the last. Pure function: tested in tests/script.test.js.
 * @param {number} index  index after moving (may be -1 or length)
 * @param {number} length number of images (> 0)
 * @returns {number} an index in 0..length-1
 */
function wrapIndex(index, length) {
  // JS % keeps the sign (-1 % 6 === -1), so add length before the second %.
  return ((index % length) + length) % length;
}

/** Gallery state: the thumbnail <img> elements and which one the lightbox shows. */
let galleryImages = [];
let currentIndex = 0;

/**
 * Show image number `index` in the lightbox: copy its src and alt, and use the alt as the caption.
 * @param {number} index
 */
function showImage(index) {
  const source = galleryImages[index];
  const image = document.getElementById("lightbox-image");
  currentIndex = index;
  image.src = source.src; // .src is the resolved full URL of the thumbnail
  image.alt = source.alt;
  document.getElementById("lightbox-caption").textContent =
    `${source.alt} (${index + 1} of ${galleryImages.length})`;
}

/**
 * Open the lightbox on image `index`.
 * @param {number} index
 */
function openLightbox(index) {
  showImage(index);
  // showModal(): backdrop, focus trap, Esc closes, and focus returns to the thumbnail on close.
  document.getElementById("lightbox").showModal();
}

/** Close the lightbox. */
function closeLightbox() {
  document.getElementById("lightbox").close();
}

/**
 * Move by `step` (+1 next, -1 previous), wrapping around.
 * @param {number} step
 */
function moveBy(step) {
  showImage(wrapIndex(currentIndex + step, galleryImages.length));
}

/** Wire up the gallery. Does nothing on pages without one (Home, About). */
function initGallery() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const buttons = document.querySelectorAll(".gallery-item");
  galleryImages = Array.from(buttons, (button) => button.querySelector("img"));

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => openLightbox(index));
  });

  document.getElementById("lightbox-prev").addEventListener("click", () => moveBy(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => moveBy(1));
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);

  // Arrow keys only fire here while the dialog is open, since it is the only thing focusable then.
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveBy(-1);
    if (event.key === "ArrowRight") moveBy(1);
  });

  // Close on a click on the dark backdrop. Backdrop clicks target the <dialog> itself, but so do
  // clicks on its padding, so also check the click landed outside the dialog's box.
  lightbox.addEventListener("click", (event) => {
    if (event.target !== lightbox) return;
    const box = lightbox.getBoundingClientRect();
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    if (outside) closeLightbox();
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initGallery);
}

// Lets `npm test` (Node) load the pure function; ignored in the browser.
if (typeof module !== "undefined") {
  module.exports = { wrapIndex };
}
