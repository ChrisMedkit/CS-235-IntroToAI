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
  // TODO: return index wrapped into 0..length-1 (watch out: -1 % 6 is -1 in JS)
  throw new Error("Not implemented");
}

/** Gallery state: the <img> elements and which one the lightbox shows. */
let galleryImages = [];
let currentIndex = 0;

/**
 * Show image number `index` in the lightbox: copy its src and alt, set the caption.
 * @param {number} index
 */
function showImage(index) {
  // TODO: currentIndex = index; set #lightbox-image src/alt and #lightbox-caption text
}

/**
 * Open the lightbox on image `index`.
 * @param {number} index
 */
function openLightbox(index) {
  // TODO: showImage(index), then lightbox.showModal()
}

/** Close the lightbox (focus goes back to the thumbnail automatically with <dialog>). */
function closeLightbox() {
  // TODO: lightbox.close()
}

/**
 * Move by `step` (+1 next, -1 previous), wrapping around.
 * @param {number} step
 */
function moveBy(step) {
  // TODO: showImage(wrapIndex(currentIndex + step, galleryImages.length))
}

/** Wire up the gallery. Does nothing on pages without one. */
function initGallery() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  // TODO: galleryImages = the <img> inside each .gallery-item
  // TODO: click on each .gallery-item -> openLightbox(its index)
  // TODO: prev/next/close buttons -> moveBy(-1) / moveBy(1) / closeLightbox()
  // TODO: ArrowLeft / ArrowRight keys while the dialog is open -> moveBy
  // TODO: click on the backdrop (event.target === lightbox) -> closeLightbox()
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initGallery);
}

// Lets `npm test` (Node) load the pure function; ignored in the browser.
if (typeof module !== "undefined") {
  module.exports = { wrapIndex };
}
