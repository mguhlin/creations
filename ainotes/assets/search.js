
(function () {
  const dataElement = document.getElementById("searchData");
  if (!dataElement) return;
  const items = JSON.parse(dataElement.textContent);
  const input = document.getElementById("searchInput");
  const filter = document.getElementById("sectionFilter");
  const results = document.getElementById("searchResults");
  const meta = document.getElementById("resultMeta");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function score(item, terms) {
    const title = item.title.toLowerCase();
    const section = item.section.toLowerCase();
    const source = item.source.toLowerCase();
    const headings = item.headings.join(" ").toLowerCase();
    const text = `${item.excerpt} ${item.text}`.toLowerCase();
    let total = 0;
    for (const term of terms) {
      if (!term) continue;
      if (title.includes(term)) total += 8;
      if (section.includes(term)) total += 4;
      if (source.includes(term)) total += 3;
      if (headings.includes(term)) total += 3;
      if (text.includes(term)) total += 1;
    }
    return total;
  }

  function render() {
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const section = filter.value;
    let matches = items
      .filter((item) => !section || item.section === section)
      .map((item) => ({ item, score: terms.length ? score(item, terms) : 1 }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, terms.length ? 60 : 24);

    meta.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"} shown`;
    results.innerHTML = matches.map(({ item }) => `
      <article class="note-card">
        <a href="${escapeHtml(item.url)}">
          <span class="section-pill">${escapeHtml(item.section)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt || item.source)}</p>
          <small>${escapeHtml(item.source)}</small>
        </a>
      </article>
    `).join("");
  }

  input.addEventListener("input", render);
  filter.addEventListener("change", render);
  render();
})();
