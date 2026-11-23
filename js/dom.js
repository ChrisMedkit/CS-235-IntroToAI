// Small DOM helpers shared by the page scripts.

/** Build an element: el("a", { href, textContent }, ...children). */
export const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

/** Save text as a file in the visitor's Downloads. */
export function download(filename, text, type) {
  const a = el("a", { href: URL.createObjectURL(new Blob([text], { type })), download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); // revoking at once can cancel the download in Firefox
}
