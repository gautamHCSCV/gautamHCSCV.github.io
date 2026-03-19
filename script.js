const USERNAME = "gautamHCSCV";
const CURATED_REPOS = [
  "Image-Anonymization-using-Adversarial-Attacks",
  "Number_Plate_detection-using-YOLO-v7",
  "Telmedicine-chatbot-for-disease-prediction",
  "Transformers-Applications",
];

// Elements
const els = {
  year: document.getElementById("year"),
  grid: document.getElementById("projectsGrid"),
  state: document.getElementById("projectsState"),
  sortMode: document.getElementById("sortMode"),
  menuBtn: document.getElementById("menuBtn"),
  nav: document.getElementById("nav"),
  header: document.querySelector(".site-header"),
  cards: document.querySelectorAll(".glass-card"),
  reveals: document.querySelectorAll(".reveal"),
  numbers: document.querySelectorAll(".stat-number"),
};

// Set Year
els.year.textContent = new Date().getFullYear();

// -----------------------------------------------------------------------------
// UI Enhancements
// -----------------------------------------------------------------------------

// Mouse tracking for glass cards (glow effect)
els.cards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

// Scroll Reveal Observer
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.getAttribute("data-delay") || 0;
      setTimeout(() => {
        entry.target.classList.add("active");
        
        // Trigger number animation if it's a stat card
        if(entry.target.classList.contains('stat-card')) {
          const numEl = entry.target.querySelector('.stat-number');
          if(numEl && !numEl.classList.contains('counted')) {
            animateValue(numEl, 0, parseFloat(numEl.getAttribute('data-count')), 1500);
            numEl.classList.add('counted');
          }
        }
      }, delay);
      // Optional: stop observing once revealed
      // revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

els.reveals.forEach((reveal) => revealObserver.observe(reveal));

// Number Counter Animation
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const isFloat = end % 1 !== 0;
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Ease out quad
    const easeOut = progress * (2 - progress);
    
    const current = start + easeOut * (end - start);
    obj.innerHTML = isFloat ? current.toFixed(1) : Math.floor(current);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end; // Ensure exact final value
    }
  };
  window.requestAnimationFrame(step);
}

// Sticky Header blur on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    els.header.style.background = "rgba(6, 8, 15, 0.85)";
    els.header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
  } else {
    els.header.style.background = "rgba(6, 8, 15, 0.7)";
    els.header.style.boxShadow = "none";
  }
});

// Mobile Menu Toggle
if (els.menuBtn && els.nav) {
  els.menuBtn.addEventListener("click", () => {
    const isOpen = els.nav.classList.toggle("open");
    els.menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  els.nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      els.nav.classList.remove("open");
      els.menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// -----------------------------------------------------------------------------
// GitHub API fetching
// -----------------------------------------------------------------------------

let repos = [];

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
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
  const desc = r.description || "View repository on GitHub for more details.";
  const topics = Array.isArray(r.topics) ? r.topics.slice(0, 4) : [];

  const article = document.createElement("article");
  article.className = "repo glass-card";
  
  // Re-attach mousemove for injected cards
  article.addEventListener("mousemove", (e) => {
    const rect = article.getBoundingClientRect();
    article.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    article.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  });

  article.innerHTML = `
    <div class="card-glow" aria-hidden="true"></div>
    <div class="repo-top">
      <a class="title" href="${r.html_url}" target="_blank" rel="noreferrer">
        ${escapeHtml(r.name).replace(/-/g, ' ')}
      </a>
      <span class="pill" title="Primary language">${escapeHtml(lang)}</span>
    </div>

    <p class="desc">${escapeHtml(desc)}</p>

    ${topics.length ? `
      <div class="tags">
        ${topics.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>
    ` : ""}

    <div class="repo-footer">
      <span title="Stars">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ${stars}
      </span>
      <span title="Forks">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 18v-5M12 13V8M12 13c-3 0-6-1-6-4V2M12 13c3 0 6-1 6-4V2M12 22a2 2 0 100-4 2 2 0 000 4z"/></svg>
        ${forks}
      </span>
      <span title="Last updated">Upd: ${fmtDate(r.updated_at)}</span>
    </div>
  `;
  return article;
}

function renderRepos(reposToRender) {
  els.grid.innerHTML = "";
  els.state.classList.remove("loading");
  
  if (!reposToRender.length) {
    els.state.innerHTML = "<span>No repositories could be loaded.</span>";
    return;
  }
  
  els.state.innerHTML = `<span>Showing ${reposToRender.length} repositories.</span>`;
  
  reposToRender.forEach((r, idx) => {
    const card = repoCard(r);
    // Add staggered animation delay
    card.style.animationDelay = `${idx * 100}ms`;
    card.style.animation = `fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
    card.style.opacity = "0";
    els.grid.appendChild(card);
  });
}

// Add keyframe for repo fade in dynamically
const styleExt = document.createElement('style');
styleExt.innerHTML = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleExt);

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

  renderRepos(arr);
}

async function fetchCuratedRepos() {
  els.state.classList.add("loading");
  els.state.querySelector("span").textContent = "Loading GitHub APIs...";

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
    console.error("Failed fetching repos", err);
    els.state.classList.remove("loading");
    els.state.innerHTML = "<span>Check your connection. Unabled to load GitHub APIs.</span>";
  }
}

if(els.sortMode) {
  els.sortMode.addEventListener("change", applySort);
}

// Pre-fill mouse track variables for existing cards
els.cards.forEach(card => {
  card.style.setProperty('--mouse-x', '-1000px');
  card.style.setProperty('--mouse-y', '-1000px');
});

// Custom Cursor Animation
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (cursorDot && cursorRing) {
  let mouseX = -100, mouseY = -100; // Start off-screen
  let ringX = -100, ringY = -100;
  const speed = 0.15; // Spring smoothness

  window.addEventListener('mousemove', (e) => {
    // Show cursor on first move
    if (cursorDot.style.opacity === '0' || cursorDot.style.opacity === '') {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot moves instantly
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  const renderCursor = () => {
    // Ring interpolates to mouse position smoothly
    ringX += (mouseX - ringX) * speed;
    ringY += (mouseY - ringY) * speed;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);

  // Magnetic/Grow effect on interactive elements delegation
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, select, input, .glass-card')) {
      cursorDot.classList.add('hovering');
      cursorRing.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, select, input, .glass-card')) {
      cursorDot.classList.remove('hovering');
      cursorRing.classList.remove('hovering');
    }
  });
}

// -----------------------------------------------------------------------------
// Scroll Progress Indicator
// -----------------------------------------------------------------------------
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0) {
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = scrolled + '%';
    }
  });
}

fetchCuratedRepos();
