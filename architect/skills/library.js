const status = document.getElementById('copy-status');
document.querySelectorAll('[data-copy]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target.textContent.trim();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(input);input.select();
        const copied = document.execCommand('copy');input.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      status.textContent = 'Copied. Paste it into your AI conversation.';
      const label = button.textContent;button.textContent = 'Copied';
      setTimeout(() => { button.textContent = label; }, 1800);
    } catch {
      status.textContent = 'Select and copy the text below, or download the file.';
      const range = document.createRange();range.selectNodeContents(target);
      const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);
      target.focus();
    }
  });
});
