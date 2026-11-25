// Structure checks for every HTML page (regex only, no DOM library).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export const PAGES = ['index.html', 'model.html', 'games.html', 'play-safe.html'];
const read = (page) => readFileSync(new URL(`../../${page}`, import.meta.url), 'utf8');

for (const page of PAGES) {
  test(`${page}: has semantic landmarks`, () => {
    const html = read(page);
    for (const tag of ['<header', '<nav', '<main', '<footer', '<section']) {
      assert.ok(html.includes(tag), `missing ${tag}`);
    }
  });

  test(`${page}: links shared css and js`, () => {
    const html = read(page);
    assert.ok(html.includes('href="css/style.css"'));
    assert.ok(html.includes('<script type="module" src="js/script.js">'));
  });

  test(`${page}: no inline styles`, () => {
    const html = read(page);
    assert.doesNotMatch(html, /\sstyle=/);
    assert.doesNotMatch(html, /<style/);
  });

  test(`${page}: every img has alt`, () => {
    const imgs = read(page).match(/<img\b[^>]*>/g) ?? [];
    for (const img of imgs) assert.match(img, /alt="[^"]+"/, img);
  });

  test(`${page}: footer disclaimer`, () => {
    assert.ok(read(page).includes('Play money only. No real betting.'));
  });

  test(`${page}: nav links`, () => {
    const html = read(page);
    for (const href of ['index.html', 'model.html', 'games.html', 'play-safe.html']) {
      assert.ok(html.includes(`href="${href}"`), `missing link ${href}`);
    }
  });
}

// The header, nav and footer must match index.html exactly (except aria-current).
const chrome = (html) => {
  const pick = (re) => (html.match(re) ?? [''])[0].replace(/ aria-current="page"/g, '');
  return {
    header: pick(/<header[\s\S]*?<\/header>/),
    nav: pick(/<nav[\s\S]*?<\/nav>/),
    footer: pick(/<footer[\s\S]*?<\/footer>/),
  };
};

for (const page of PAGES) {
  test(`${page}: shared chrome is identical`, () => {
    assert.deepEqual(chrome(read(page)), chrome(read('index.html')));
  });

  test(`${page}: exactly one aria-current, on its own link`, () => {
    const marks = read(page).match(/<a href="([^"]+)" aria-current="page">/g) ?? [];
    assert.equal(marks.length, 1);
    assert.ok(marks[0].includes(`href="${page}"`));
  });
}

test('play-safe: FAQ has at least 5 expandable questions', () => {
  const faq = read('play-safe.html').match(/<section id="faq"[\s\S]*?<\/section>/)[0];
  assert.ok((faq.match(/<details/g) ?? []).length >= 5);
});

test('play-safe: lists the national and Wisconsin helplines', () => {
  const html = read('play-safe.html');
  assert.ok(html.includes('1-800-MY-RESET'));
  assert.ok(html.includes('1-800-426-2535'));
});

test('model: cites its sources and shows the momentum chart', () => {
  const html = read('model.html');
  assert.ok(html.includes('Klaassen'));
  assert.ok(html.includes('Problem C'));
  assert.match(html, /<svg[^>]*class="model-chart"/);
  assert.doesNotMatch(html, /Placeholder/);
});

test('play-safe: no placeholders left', () => {
  assert.doesNotMatch(read('play-safe.html'), /Placeholder/);
});
