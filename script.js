const USERNAME = "gautamHCSCV";

// Curated repos only
const CURATED_REPOS = [
  "Image-Anonymization-using-Adversarial-Attacks",
  "Number_Plate_detection-using-YOLO-v7",
  "Telmedicine-chatbot-for-disease-prediction",
  "Transformers-Applications",
];

const els = {
  year: document.getElementById("year"),
  grid: document.getElementById("projectsGrid"),
  state: document.getElementById("projectsState"),
  sortMode: document.getElementById("sortMode"),
  menuBtn: document.getElementById("menuBtn"),
  nav: document.getElementById("nav"),
};

els.year.textContent = new Date().getFullYear();

let repos = [];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function repoCard(r) {
  const stars = r.stargazers_count ?? 0;
  const forks = r.forks_count ?? 0;
  const lang = r.language ?? "—";
  const desc = r.description ? r.description : "Add a GitHub description to improve this card.";
  const topics = Array.isArray(r.topics) ? r.topics.slice(0, 6) : [];

  const el = document.createElement("article");
  el.className = "repo";

  el.innerHTML = `
    <div class="repo-top">
      <a class="title" href="${r.html_url}" target="_blank" rel="noreferrer">${escapeHtml(r.name)}</a>
      <span class="tag" title="Primary language">${escapeHtml(lang)}</span>
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

function render(reposToRender) {
  els.grid.innerHTML = "";
  if (!reposToRender.length) {
    els.state.textContent = "No repositories found (check CURATED_REPOS names).";
    return;
  }
  els.state.textContent = `Showing ${reposToRender.length} selected repositories.`;
  reposToRender.forEach(r => els.grid.appendChild(repoCard(r)));
}

function applySort() {
  const mode = els.sortMode.value;
  const arr = repos.slice();

  if (mode === "curated") {
    arr.sort((a, b) => CURATED_REPOS.indexOf(a.name) - CURATED_REPOS.indexOf(b.name));
  } else if (mode === "updated") {
    arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } else if (mode === "stars") {
    arr.sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));
  } else if (mode === "name") {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }

  render(arr);
}

async function fetchCuratedRepos() {
  els.state.textContent = "Loading selected repositories…";

  try {
    const requests = CURATED_REPOS.map(name =>
      fetch(`https://api.github.com/repos/${USERNAME}/${name}`, {
        headers: { "Accept": "application/vnd.github+json" }
      }).then(async (r) => (r.ok ? r.json() : null))
    );

    const data = await Promise.all(requests);
    repos = data.filter(Boolean);

    applySort();
  } catch (err) {
    console.error(err);
    els.state.textContent = "Couldn’t load repositories right now.";
  }
}

function setupMobileMenu() {
  if (!els.menuBtn || !els.nav) return;

  els.menuBtn.addEventListener("click", () => {
    const isOpen = els.nav.classList.toggle("open");
    els.menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  els.nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      if (els.nav.classList.contains("open")) {
        els.nav.classList.remove("open");
        els.menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  });
}

els.sortMode.addEventListener("change", applySort);

setupMobileMenu();
fetchCuratedRepos();
