const PAGE_SIZE = 12;
const MG_URL = "https://public-api.wordpress.com/rest/v1.1/sites/mguhlin.org/posts/";
const TCEA_POSTS_URL = "https://blog.tcea.org/wp-json/wp/v2/posts";
const TCEA_PAGES_URL = "https://blog.tcea.org/wp-json/wp/v2/pages";
const TCEA_AUTHOR_ID = 29;
const BLOGGER_POSTS_URL = "https://mguhlin.blogspot.com/feeds/posts/default";
const FALLBACK_IMAGE = "./fallback-image.svg";
const SPECIAL_SEARCHES = {
  nspa: {
    variants: ["NSPA:", "NSPA1", "NSPA2", "NSPA3", "NSPA4"],
    exactPattern: /\bNSPA(?::|[1-4]\b)/i,
  },
};

const form = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const sourceSelect = document.querySelector("#source-select");
const typeSelect = document.querySelector("#type-select");
const sortSelect = document.querySelector("#sort-select");
const statusEl = document.querySelector("#api-status");
const countEl = document.querySelector("#results-count");
const messageEl = document.querySelector("#message");
const resultsList = document.querySelector("#results-list");
const quickSearchButtons = document.querySelectorAll("[data-search]");
const recentButton = document.querySelector("#recent-button");
const rssButton = document.querySelector("#rss-button");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const pageLabel = document.querySelector("#page-label");

let state = {
  query: "",
  queryVariants: [],
  exactPattern: null,
  exactTerm: "",
  source: "all",
  type: "any",
  sort: "relevance",
  page: 1,
  found: 0,
  loading: false,
  currentPosts: [],
};

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  configureQuery(params.get("q") || "");
  state.source = params.get("source") || "all";
  state.type = params.get("type") || "any";
  state.sort = params.get("sort") || "relevance";
  state.page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);

  searchInput.value = state.query;
  sourceSelect.value = state.source;
  typeSelect.value = state.type;
  sortSelect.value = state.sort;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildExactTermPattern(term) {
  const escapedTerm = escapeRegExp(term.trim()).replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^A-Za-z0-9])${escapedTerm}([^A-Za-z0-9]|$)`, "i");
}

function configureQuery(query, variants = [], exactTerm = "") {
  const normalizedQuery = query.trim();
  const specialSearch = SPECIAL_SEARCHES[normalizedQuery.replace(/^#/, "").toLowerCase()];

  state.query = normalizedQuery;
  state.queryVariants = variants;
  state.exactPattern = null;
  state.exactTerm = exactTerm.trim();

  if (!variants.length && specialSearch) {
    state.queryVariants = specialSearch.variants;
    state.exactPattern = specialSearch.exactPattern;
  } else if (state.exactTerm) {
    state.exactPattern = buildExactTermPattern(state.exactTerm);
  }
}

function writeUrlState() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.source !== "all") params.set("source", state.source);
  if (state.type !== "any") params.set("type", state.type);
  if (state.sort !== "relevance") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));

  const nextUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
}

function setLoading(isLoading) {
  state.loading = isLoading;
  form.querySelector("button").disabled = isLoading;
  recentButton.disabled = isLoading;
  rssButton.disabled = isLoading || !state.currentPosts.length;
  prevButton.disabled = isLoading || state.page <= 1;
  nextButton.disabled = isLoading || state.page >= totalPages();
  statusEl.textContent = isLoading ? "Searching" : "Ready";
}

function setMessage(text = "") {
  messageEl.textContent = text;
  messageEl.hidden = !text;
}

function totalPages() {
  if (!state.found) return 1;
  return Math.max(Math.ceil(state.found / PAGE_SIZE), 1);
}

function buildMguhlinUrl(perPage, page, query = state.query) {
  const url = new URL(MG_URL);
  url.searchParams.set("number", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("type", state.type);
  url.searchParams.set("fields", "ID,title,URL,date,modified,excerpt,tags,categories,type,featured_image,post_thumbnail");

  if (query) {
    url.searchParams.set("search", query);
  }

  if (state.sort === "title") {
    url.searchParams.set("order_by", "title");
    url.searchParams.set("order", "ASC");
  } else if (state.sort === "modified") {
    url.searchParams.set("order_by", "modified");
    url.searchParams.set("order", "DESC");
  } else if (state.sort === "date" || !state.query) {
    url.searchParams.set("order_by", "date");
    url.searchParams.set("order", "DESC");
  }

  return url;
}

function buildTceaUrl(baseUrl, perPage, page, query = state.query) {
  const url = new URL(baseUrl);
  url.searchParams.set("author", String(TCEA_AUTHOR_ID));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_embed", "1");

  if (query) {
    url.searchParams.set("search", query);
  }

  if (state.sort === "title") {
    url.searchParams.set("orderby", "title");
    url.searchParams.set("order", "asc");
  } else if (state.sort === "modified") {
    url.searchParams.set("orderby", "modified");
    url.searchParams.set("order", "desc");
  } else if (state.sort === "date" || !state.query) {
    url.searchParams.set("orderby", "date");
    url.searchParams.set("order", "desc");
  }

  return url;
}

function buildBloggerUrl(perPage, page, query = state.query) {
  const url = new URL(BLOGGER_POSTS_URL);
  url.searchParams.set("alt", "json-in-script");
  url.searchParams.set("max-results", String(perPage));
  url.searchParams.set("start-index", String((page - 1) * perPage + 1));

  if (query) {
    url.searchParams.set("q", query);
  }

  return url;
}

function fetchJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `bloggerSearchCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Blogger returned a script loading error"));
    };

    url.searchParams.set("callback", callbackName);
    script.src = url.toString();
    document.body.append(script);
  });
}

function stripHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent.replace(/\s+/g, " ").trim();
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function openShareWindow(url) {
  window.open(url, "_blank", "noopener,noreferrer,width=720,height=640");
}

async function copyShareLink(post) {
  const text = `${stripHtml(post.title)}\n${post.url}`;

  try {
    await navigator.clipboard.writeText(text);
    setMessage("Share link copied to your clipboard.");
  } catch {
    setMessage("Copy failed. Open the entry and copy the link from your browser.");
  }
}

function sharePost(post, target) {
  const title = stripHtml(post.title);
  const encodedUrl = encodeURIComponent(post.url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} ${post.url}`);

  const shareUrls = {
    mastodon: `https://mastodon.social/share?text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    lemmy: `https://lemmy.world/create_post?url=${encodedUrl}&title=${encodedTitle}`,
  };

  if (target === "native" && navigator.share) {
    navigator.share({ title, url: post.url }).catch(() => {});
    return;
  }

  if (target === "copy" || target === "instagram") {
    copyShareLink(post);
    return;
  }

  if (shareUrls[target]) {
    openShareWindow(shareUrls[target]);
  }
}

function renderShareButtons(post) {
  const sharePanel = document.createElement("div");
  sharePanel.className = "share-actions";
  sharePanel.setAttribute("aria-label", `Share ${stripHtml(post.title)}`);

  const options = [
    ["mastodon", "Mastodon"],
    ["linkedin", "LinkedIn"],
    ["x", "X"],
    ["lemmy", "Lemmy"],
    ["instagram", "Instagram"],
    ["copy", "Copy"],
  ];

  if (navigator.share) {
    options.unshift(["native", "Share"]);
  }

  options.forEach(([target, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "share-button";
    button.textContent = label;
    button.addEventListener("click", () => sharePost(post, target));
    sharePanel.append(button);
  });

  return sharePanel;
}

function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function currentSearchLabel() {
  return state.query ? `Search results for ${state.query}` : "Recent entries";
}

function buildRssFeed(posts) {
  const pageUrl = window.location.href;
  const updated = new Date().toUTCString();
  const items = posts.map((post) => {
    const title = stripHtml(post.title) || "Untitled entry";
    const description = stripHtml(post.excerpt) || "";
    const pubDate = post.date ? new Date(post.date).toUTCString() : updated;

    return `    <item>
      <title>${xmlEscape(title)}</title>
      <link>${xmlEscape(post.url)}</link>
      <guid isPermaLink="true">${xmlEscape(post.url)}</guid>
      <pubDate>${xmlEscape(pubDate)}</pubDate>
      <source>${xmlEscape(post.source)}</source>
      <description>${xmlEscape(description)}</description>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(`Miguel's Writings - ${currentSearchLabel()}`)}</title>
    <link>${xmlEscape(pageUrl)}</link>
    <description>${xmlEscape("Generated RSS feed for the currently displayed search results.")}</description>
    <lastBuildDate>${xmlEscape(updated)}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function downloadRssFeed() {
  if (!state.currentPosts.length) return;

  const blob = new Blob([buildRssFeed(state.currentPosts)], {
    type: "application/rss+xml;charset=utf-8",
  });
  const link = document.createElement("a");
  const slug = (state.query || "recent")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "results";

  link.href = URL.createObjectURL(blob);
  link.download = `miguel-writings-${slug}.rss`;
  document.body.append(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

function termNames(terms = {}) {
  return Object.values(terms)
    .map((term) => term && term.name)
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeMguhlinPost(post) {
  const title = post.title || "";
  const excerpt = post.excerpt || "";
  const imageUrl = post.post_thumbnail && post.post_thumbnail.URL
    ? post.post_thumbnail.URL
    : post.featured_image || FALLBACK_IMAGE;

  return {
    id: `mguhlin-${post.ID}`,
    sourceKey: "mguhlin",
    source: "mguhlin.org",
    type: post.type || "post",
    title,
    url: post.URL,
    date: post.date,
    modified: post.modified,
    excerpt,
    imageUrl,
    searchableText: stripHtml(`${title} ${excerpt} ${post.URL}`),
    terms: [...termNames(post.categories), ...termNames(post.tags)],
  };
}

function normalizeTceaPost(post) {
  const title = post.title && post.title.rendered ? post.title.rendered : "";
  const excerpt = post.excerpt && post.excerpt.rendered ? post.excerpt.rendered : "";
  const content = post.content && post.content.rendered ? post.content.rendered : "";
  const media = post._embedded && post._embedded["wp:featuredmedia"]
    ? post._embedded["wp:featuredmedia"][0]
    : null;
  const mediaSizes = media && media.media_details ? media.media_details.sizes : {};
  const contentImageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  const imageUrl = mediaSizes.medium_large && mediaSizes.medium_large.source_url
    ? mediaSizes.medium_large.source_url
    : mediaSizes.medium && mediaSizes.medium.source_url
      ? mediaSizes.medium.source_url
      : media && media.source_url
        ? media.source_url
        : contentImageMatch
          ? contentImageMatch[1]
          : FALLBACK_IMAGE;

  return {
    id: `tcea-${post.id}`,
    sourceKey: "tcea",
    source: "TCEA",
    type: post.type || "post",
    title,
    url: post.link,
    date: post.date,
    modified: post.modified,
    excerpt,
    imageUrl,
    searchableText: stripHtml(`${title} ${excerpt} ${post.link}`),
    terms: ["Miguel Guhlin"],
  };
}

function normalizeBloggerPost(entry) {
  const title = entry.title && entry.title.$t ? entry.title.$t : "";
  const content = entry.content && entry.content.$t ? entry.content.$t : "";
  const alternateLink = (entry.link || []).find((link) => link.rel === "alternate");
  const url = alternateLink ? alternateLink.href : "";
  const labels = (entry.category || []).map((category) => category.term).filter(Boolean);
  const imageUrl = entry.media$thumbnail && entry.media$thumbnail.url
    ? entry.media$thumbnail.url.replace(/\/s72-[^/]+\//, "/s400/")
    : FALLBACK_IMAGE;

  return {
    id: `blogger-${entry.id && entry.id.$t ? entry.id.$t : url}`,
    sourceKey: "blogger",
    source: "Blogger",
    type: "post",
    title,
    url,
    date: entry.published && entry.published.$t ? entry.published.$t : entry.updated.$t,
    modified: entry.updated && entry.updated.$t ? entry.updated.$t : "",
    excerpt: content,
    imageUrl,
    searchableText: stripHtml(`${title} ${content} ${url} ${labels.join(" ")}`),
    terms: labels,
  };
}

function uniquePosts(posts) {
  return [...new Map(posts.map((post) => [post.url, post])).values()];
}

function flattenResults(results) {
  return results.reduce((posts, result) => posts.concat(result.posts), []);
}

function sortPosts(posts) {
  if (state.sort === "title") {
    return posts.sort((a, b) => stripHtml(a.title).localeCompare(stripHtml(b.title)));
  }

  const dateField = state.sort === "modified" ? "modified" : "date";
  return posts.sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]));
}

async function fetchMguhlinPosts(perPage, page, query = state.query) {
  const response = await fetch(buildMguhlinUrl(perPage, page, query));
  if (!response.ok) {
    throw new Error(`mguhlin.org returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return {
    found: Number(data.found || 0),
    posts: (data.posts || []).map(normalizeMguhlinPost),
  };
}

async function fetchTceaFromEndpoint(baseUrl, perPage, page, query = state.query) {
  const response = await fetch(buildTceaUrl(baseUrl, perPage, page, query));
  if (!response.ok) {
    throw new Error(`TCEA returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return {
    found: Number(response.headers.get("x-wp-total") || data.length || 0),
    posts: data.map(normalizeTceaPost),
  };
}

async function fetchTceaPosts(perPage, page, query = state.query) {
  const requests = [];

  if (state.type === "post" || state.type === "any") {
    requests.push(fetchTceaFromEndpoint(TCEA_POSTS_URL, perPage, page, query));
  }

  if (state.type === "page" || state.type === "any") {
    requests.push(fetchTceaFromEndpoint(TCEA_PAGES_URL, perPage, page, query));
  }

  const results = await Promise.all(requests);
  return {
    found: results.reduce((total, result) => total + result.found, 0),
    posts: uniquePosts(flattenResults(results)),
  };
}

async function fetchBloggerPosts(perPage, page, query = state.query) {
  if (state.type === "page") {
    return { found: 0, posts: [] };
  }

  const data = await fetchJsonp(buildBloggerUrl(perPage, page, query));
  const feed = data.feed || {};
  const entries = feed.entry || [];
  const total = feed.openSearch$totalResults && feed.openSearch$totalResults.$t
    ? Number(feed.openSearch$totalResults.$t)
    : entries.length;

  return {
    found: total,
    posts: entries.map(normalizeBloggerPost),
  };
}

async function fetchPosts() {
  const queries = state.queryVariants.length ? state.queryVariants : [state.query];
  const requests = [];

  queries.forEach((query) => {
    if (state.source === "all" || state.source === "mguhlin") {
      requests.push(fetchMguhlinPosts(PAGE_SIZE, state.page, query));
    }

    if (state.source === "all" || state.source === "tcea") {
      requests.push(fetchTceaPosts(PAGE_SIZE, state.page, query));
    }

    if (state.source === "all" || state.source === "blogger") {
      requests.push(fetchBloggerPosts(PAGE_SIZE, state.page, query));
    }
  });

  const results = await Promise.all(requests);
  let posts = uniquePosts(flattenResults(results));

  if (state.exactPattern) {
    posts = posts.filter((post) => state.exactPattern.test(post.searchableText));
  }

  state.found = state.queryVariants.length
    ? posts.length
    : results.reduce((total, result) => total + result.found, 0);

  return sortPosts(posts).slice(0, PAGE_SIZE);
}

function renderResults(posts) {
  resultsList.innerHTML = "";
  state.currentPosts = posts;
  rssButton.disabled = !posts.length;

  if (!posts.length) {
    countEl.textContent = state.query
      ? `No entries matched "${state.query}".`
      : "No recent entries were returned.";
    return;
  }

  countEl.textContent = state.query
    ? `${state.found.toLocaleString()} result${state.found === 1 ? "" : "s"} for "${state.query}".`
    : `${state.found.toLocaleString()} recent entr${state.found === 1 ? "y" : "ies"}.`;

  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = `result-card result-card-${post.sourceKey}`;

    const imageLink = document.createElement("a");
    imageLink.href = post.url;
    imageLink.target = "_blank";
    imageLink.rel = "noreferrer";
    imageLink.className = "result-image-link";

    const image = document.createElement("img");
    image.className = "result-image";
    image.src = post.imageUrl || FALLBACK_IMAGE;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.src = FALLBACK_IMAGE;
    }, { once: true });
    imageLink.append(image);

    const body = document.createElement("div");
    body.className = "result-body";

    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = post.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = stripHtml(post.title) || "Untitled entry";
    title.append(link);

    const date = document.createElement("p");
    date.className = "result-date";
    date.innerHTML = `<span class="source-badge"></span> <span class="type-badge"></span> | ${formatDate(post.date)}${post.modified && post.modified !== post.date ? ` | updated ${formatDate(post.modified)}` : ""}`;
    date.querySelector(".source-badge").textContent = post.source;
    date.querySelector(".type-badge").textContent = post.type;

    const excerpt = document.createElement("p");
    excerpt.className = "result-excerpt";
    excerpt.textContent = stripHtml(post.excerpt) || "No excerpt available.";

    body.append(title, date, excerpt);

    if (post.terms.length) {
      const tagList = document.createElement("div");
      tagList.className = "result-tags";
      post.terms.slice(0, 6).forEach((name) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = name;
        tagList.append(tag);
      });
      body.append(tagList);
    }

    body.append(renderShareButtons(post));
    card.append(imageLink, body);
    fragment.append(card);
  });

  resultsList.append(fragment);
}

async function runSearch() {
  setLoading(true);
  setMessage("");
  writeUrlState();

  try {
    renderResults(await fetchPosts());
  } catch (error) {
    state.found = 0;
    resultsList.innerHTML = "";
    countEl.textContent = "Search failed.";
    setMessage(`${error.message}. If this happens from a local file, run a local web server and open the site through http://localhost.`);
  } finally {
    pageLabel.textContent = `Page ${state.page} of ${totalPages()}`;
    setLoading(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  configureQuery(searchInput.value);
  state.source = sourceSelect.value;
  state.type = typeSelect.value;
  state.sort = sortSelect.value;
  state.page = 1;
  runSearch();
});

recentButton.addEventListener("click", () => {
  configureQuery("");
  state.sort = "date";
  state.page = 1;
  searchInput.value = "";
  sortSelect.value = "date";
  runSearch();
});

rssButton.addEventListener("click", downloadRssFeed);

quickSearchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const variants = button.dataset.searchVariants
      ? button.dataset.searchVariants.split("|").map((query) => query.trim()).filter(Boolean)
      : [];
    configureQuery(button.dataset.search, variants, button.dataset.exactTerm || "");
    state.source = sourceSelect.value;
    state.type = typeSelect.value;
    state.sort = sortSelect.value;
    state.page = 1;
    searchInput.value = state.query;
    runSearch();
  });
});

prevButton.addEventListener("click", () => {
  if (state.page <= 1) return;
  state.page -= 1;
  runSearch();
});

nextButton.addEventListener("click", () => {
  if (state.page >= totalPages()) return;
  state.page += 1;
  runSearch();
});

readUrlState();
if (state.query) {
  runSearch();
}
