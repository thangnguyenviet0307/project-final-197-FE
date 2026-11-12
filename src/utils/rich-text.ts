import DOMPurify from 'dompurify';

export function sanitizeDescription(html: string): string {
  const fragment = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'ol',
      'ul',
      'li',
      'blockquote',
      'a',
      'span',
      'img',
    ],
    ALLOWED_ATTR: [
      'href',
      'class',
      'data-list',
      'src',
      'alt',
      'width',
      'height',
    ],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  });
  for (const node of fragment.querySelectorAll('[class]')) {
    const classes = [...node.classList].filter((name) =>
      /^(ql-align-(center|right|justify)|ql-indent-[1-8]|ql-size-(small|large|huge)|ql-direction-rtl|ql-ui)$/.test(
        name
      )
    );
    if (classes.length) node.setAttribute('class', classes.join(' '));
    else node.removeAttribute('class');
  }
  for (const image of fragment.querySelectorAll('img')) {
    try {
      const url = new URL(image.getAttribute('src') ?? '');
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new Error('Unsafe image');
      image.setAttribute('src', url.href);
      for (const name of ['width', 'height']) {
        const value = image.getAttribute(name);
        if (value && !/^\d{1,4}$/.test(value)) image.removeAttribute(name);
      }
    } catch {
      image.remove();
    }
  }
  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
}

export function descriptionToHtml(value: string): string {
  if (!value) return '';
  if (/<\/?[a-z][^>]*>/i.test(value)) return sanitizeDescription(value);
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return `<p>${escaped.replace(/\r?\n/g, '<br>')}</p>`;
}

export function richTextValue(html: string) {
  const safe = sanitizeDescription(html);
  const node = document.createElement('div');
  node.innerHTML = safe;
  return node.textContent?.trim() || node.querySelector('img') ? safe : '';
}
