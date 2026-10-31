const markdownInput = document.getElementById('markdown-input');
const previewOutput = document.getElementById('preview-output');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const readingTimeEl = document.getElementById('reading-time');
const copyHtmlBtn = document.getElementById('copy-html-btn');
const downloadMdBtn = document.getElementById('download-md-btn');
const toolButtons = document.querySelectorAll('.tool-btn');

const DEFAULT_MARKDOWN = `# Добро пожаловать в Markdown Studio! 🚀

Это современный и быстрый редактор заметок с предпросмотром в реальном времени.

## ✨ Возможности
- Поддержка заголовков, списков, цитат и ссылок
- Подсветка и блоки исходного кода
- Автосохранение в **localStorage**
- Экспорт в файл \`.md\` и копирование готового HTML

### Пример кода на JavaScript:
\`\`\`javascript
function greet(name) {
  return \`Привет, \${name}! Добро пожаловать в веб-разработку.\`;
}
console.log(greet("Разработчик"));
\`\`\`

> «Простота — залог надежности.» — Эдсгер Дейкстра

Удалите этот текст и начните творить!
`;

const savedContent = localStorage.getItem('markdown_studio_content');
markdownInput.value = savedContent !== null ? savedContent : DEFAULT_MARKDOWN;

function updatePreview() {
  const text = markdownInput.value;
  localStorage.setItem('markdown_studio_content', text);

  // Marked.js рендеринг
  if (window.marked) {
    previewOutput.innerHTML = marked.parse(text);
  } else {
    previewOutput.innerText = text;
  }

  // Подсчет статистики
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const minutes = Math.ceil(words / 200);

  wordCountEl.innerText = `${words} ${getWordEnding(words, ['слово', 'слова', 'слов'])}`;
  charCountEl.innerText = `${chars} симв.`;
  readingTimeEl.innerText = `~${minutes} мин чтения`;
}

function getWordEnding(number, forms) {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

function insertFormat(tag) {
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  const selectedText = markdownInput.value.substring(start, end);
  let replacement = '';

  switch (tag) {
    case 'bold':
      replacement = `**${selectedText || 'жирный текст'}**`;
      break;
    case 'italic':
      replacement = `*${selectedText || 'курсив'}*`;
      break;
    case 'h1':
      replacement = `\n# ${selectedText || 'Заголовок 1'}\n`;
      break;
    case 'h2':
      replacement = `\n## ${selectedText || 'Заголовок 2'}\n`;
      break;
    case 'link':
      replacement = `[${selectedText || 'текст ссылки'}](https://example.com)`;
      break;
    case 'code':
      replacement = selectedText.includes('\n') 
        ? `\n\`\`\`javascript\n${selectedText}\n\`\`\`\n` 
        : `\`${selectedText || 'код'}\``;
      break;
    case 'list':
      replacement = `\n- ${selectedText || 'Элемент списка'}`;
      break;
    case 'quote':
      replacement = `\n> ${selectedText || 'Цитата'}`;
      break;
  }

  markdownInput.setRangeText(replacement, start, end, 'end');
  markdownInput.focus();
  updatePreview();
}

toolButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tag = btn.getAttribute('data-tag');
    insertFormat(tag);
  });
});

markdownInput.addEventListener('input', updatePreview);

copyHtmlBtn.addEventListener('click', () => {
  const html = previewOutput.innerHTML;
  navigator.clipboard.writeText(html).then(() => {
    const original = copyHtmlBtn.innerText;
    copyHtmlBtn.innerText = 'Скопировано! ✓';
    setTimeout(() => copyHtmlBtn.innerText = original, 2000);
  });
});

downloadMdBtn.addEventListener('click', () => {
  const blob = new Blob([markdownInput.value], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.md';
  a.click();
  URL.revokeObjectURL(url);
});

updatePreview();
