const USERNAME = "gautamHCSCV";

// Optional: curate your best work here (repo names exactly as on GitHub).
// If empty, the site will still show repos based on sorting mode.
const FEATURED = [
  // "my-best-repo",
  // "robotics-project",
];

const els = {
  year: document.getElementById("year"),
  grid: document.getElementById("projectsGrid"),
  state: document.getElementById("projectsState"),
  sortMode: document.getElementById("sortMode"),
  toggleForks: document.getElementById("toggleForks"),
};

els.year.textContent = new Date().getFullYear();

let allRepos = [];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function repoCard(r) {
  const stars = r.stargazers_count ?? 0;
  const forks = r.forks_count ?? 0;
  const lang = r.language ?? "—";
  const desc = r.description ? r.description : "No description yet — add one in GitHub to improve your portfolio.";

  const topics = Array.isArray(r.topics) ? r.topics.slice(0, 6) : [];

  const el = document.createElement("article");
  el.className = "repo";

  el.innerHTML = `
    <div class="repo-top">
      <a class="title" href="${r.html_url}" target="_blank" rel="noreferrer">${r.name}</a>
      <span class="tag" title="Primary language">${lang}</span>
    </div>

    <p class="desc">${escapeHtml(desc)}</p>

    <div class="tags">
      ${topics.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
    </div>

    <div class="repo-footer">
      <span title="Stars">★ ${stars}</span>
      <span title="Forks">⑂ ${forks}</span>
      <span title="Last updated">Updated: ${fmtDate(r.updated_at)}</span>
      ${r.homepage ? `<a class="tag" href="${r.homepage}" target="_blank" rel="noreferrer">Live</a>` : ""}
    </div>
  `;

  return el;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyFiltersAndSort() {
  const showForks = els.toggleForks.checked;
  const mode = els.sortMode.value;

  let repos = allRepos.slice();

  if (!showForks) repos = repos.filter(r => !r.fork);

  // Featured mode: show curated first, then a small “best of rest”
  if (mode === "featured") {
    const featuredSet = new Set(FEATURED);
    const featured = repos
      .filter(r => featuredSet.has(r.name))
      .sort((a, b) => FEATURED.indexOf(a.name) - FEATURED.indexOf(b.name));

    const rest = repos
      .filter(r => !featuredSet.has(r.name))
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 9 - featured.length);

    repos = [...featured, ...rest];
  }

  if (mode === "stars") {
    repos.sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));
  } else if (mode === "updated") {
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } else if (mode === "name") {
    repos.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderRepos(repos);
}

function renderRepos(repos) {
  els.grid.innerHTML = "";
  if (!repos.length) {
    els.state.textContent = "No repositories to show (try enabling forks or changing sort).";
    return;
  }
  els.state.textContent = `Showing ${repos.length} repositories.`;
  repos.forEach(r => els.grid.appendChild(repoCard(r)));
}

async function fetchRepos() {
  // Use per_page=100 to fetch up to 100 repos; enough for most portfolios.
  // Topics require a preview header in older APIs, but GitHub returns them in many cases now.
  const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;

  els.state.textContent = "Loading repositories…";

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
      }
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    allRepos = Array.isArray(data) ? data : [];

    // If FEATURED list is empty, default to “Most starred” so it looks strong immediately
    if (!FEATURED.length) {
      els.sortMode.value = "stars";
    }

    applyFiltersAndSort();
  } catch (err) {
    console.error(err);
    els.state.textContent = "Couldn’t load repositories. Try again later.";
  }
}

els.sortMode.addEventListener("change", applyFiltersAndSort);
els.toggleForks.addEventListener("change", applyFiltersAndSort);

fetchRepos();
