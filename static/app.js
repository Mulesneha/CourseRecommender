(() => {
  const CAT_COLOR = {
    "Programming": "#3D5AFE", "Data & AI": "#8E44AD", "Web Development": "#0B7A8A", "Design": "#E4572E",
    "Business": "#C98A00", "Math & Science": "#2E8B57", "Cybersecurity": "#B3294E", "Communication": "#5C6B7A",
  };
  const TOPICS = ["machine learning", "web apps", "design", "startups", "security", "statistics", "writing", "leadership"];
  const METHOD_HELP = {
    hybrid: "Blends what the courses are about with what similar students liked.",
    content: "Matches the words in your interests and liked courses to course topics (TF-IDF).",
    collaborative: "Needs course ratings. Finds courses liked by students who rated like you.",
  };

  const $ = (s) => document.querySelector(s);
  const state = { courses: [], byId: {}, ratings: {}, method: "hybrid", topics: new Set(), picks: [] };

  const colorOf = (c) => CAT_COLOR[c.category] || "#14182B";
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------- boot ----------
  fetch("/api/courses").then((r) => r.json()).then((data) => {
    state.courses = data.courses;
    state.clusters = data.clusters;
    data.courses.forEach((c) => (state.byId[c.id] = c));
    $("#stats").textContent = `${data.stats.courses} courses · ${data.stats.students} students · ${data.stats.ratings} ratings`;
    buildTopics();
    buildLegend(data.categories);
    drawMap();
    $("#method-help").textContent = METHOD_HELP[state.method];
    recommend();
  });

  // ---------- topic chips ----------
  function buildTopics() {
    $("#topics").innerHTML = TOPICS.map((t) => `<button class="chip" aria-pressed="false" data-t="${t}">${t}</button>`).join("");
    $("#topics").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      on ? state.topics.add(b.dataset.t) : state.topics.delete(b.dataset.t);
      schedule();
    });
  }

  // ---------- filters ----------
  $("#interests").addEventListener("input", schedule);
  $("#level").addEventListener("change", schedule);
  $("#weeks").addEventListener("change", schedule);
  document.querySelectorAll(".seg button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-checked", x === b));
      state.method = b.dataset.method;
      $("#method-help").textContent = METHOD_HELP[state.method];
      schedule();
    })
  );

  // ---------- course search / rated list ----------
  const search = $("#search"), dd = $("#search-results");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    if (!q) return (dd.hidden = true);
    const hits = state.courses.filter((c) => !(c.id in state.ratings) && (c.title + " " + c.category).toLowerCase().includes(q)).slice(0, 6);
    dd.innerHTML = hits.length
      ? hits.map((c) => `<li><button data-id="${c.id}">${esc(c.title)}<small>${esc(c.category)} · ${esc(c.level)}</small></button></li>`).join("")
      : `<li><button disabled>No course found</button></li>`;
    dd.hidden = false;
  });
  dd.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if (b) addTaken(+b.dataset.id, 4);
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) dd.hidden = true; });

  function addTaken(id, stars) {
    state.ratings[id] = stars;
    search.value = "";
    dd.hidden = true;
    renderTaken();
    schedule();
  }

  function renderTaken() {
    const ids = Object.keys(state.ratings);
    $("#taken-empty").hidden = ids.length > 0;
    $("#taken").innerHTML = ids.map((id) => {
      const c = state.byId[id], r = state.ratings[id];
      const stars = [1, 2, 3, 4, 5].map((n) => `<button class="star ${n <= r ? "on" : ""}" data-id="${id}" data-n="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("");
      return `<li style="--cat:${colorOf(c)}"><span class="t">${esc(c.title)}</span>
        <button class="rm" data-rm="${id}" aria-label="Remove ${esc(c.title)}">×</button>
        <div class="stars" role="group" aria-label="Your rating for ${esc(c.title)}">${stars}</div></li>`;
    }).join("");
  }
  $("#taken").addEventListener("click", (e) => {
    const s = e.target.closest(".star"), rm = e.target.closest(".rm");
    if (s) state.ratings[s.dataset.id] = +s.dataset.n;
    else if (rm) delete state.ratings[rm.dataset.rm];
    else return;
    renderTaken();
    schedule();
  });

  // ---------- recommend ----------
  let timer;
  function schedule() { clearTimeout(timer); timer = setTimeout(recommend, 250); }

  function recommend() {
    const typed = $("#interests").value.trim();
    const interests = [typed, ...state.topics].filter(Boolean).join(" ");
    $("#cards").classList.add("loading");
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests, ratings: state.ratings, method: state.method, level: $("#level").value, max_weeks: $("#weeks").value }),
    })
      .then((r) => r.json())
      .then((data) => {
        state.picks = data.results.map((c) => c.id);
        renderCards(data);
        drawMap();
      })
      .catch(() => { $("#cards").innerHTML = `<li class="empty">Could not reach the server. Is <code>python app.py</code> still running?</li>`; })
      .finally(() => $("#cards").classList.remove("loading"));
  }

  const METHOD_LABEL = { hybrid: "Hybrid", content: "Content-based", collaborative: "Collaborative", popular: "Most popular" };
  function renderCards(data) {
    $("#note").textContent = `${METHOD_LABEL[data.method]} ranking${data.note ? " · " + data.note : ""}`;
    if (!data.results.length) {
      $("#cards").innerHTML = `<li class="empty">No courses fit those filters. Try a different level or length.</li>`;
      return;
    }
    $("#cards").innerHTML = data.results.map((c) => `
      <li class="card" style="--cat:${colorOf(c)}">
        <div>
          <h3>${esc(c.title)}</h3>
          <p class="meta">${esc(c.category)} · ${esc(c.level)} · ${c.weeks} weeks</p>
        </div>
        <div class="side">
          <span class="match">${Math.round(c.score * 100)}%<small>match</small></span>
          <button class="btn" data-take="${c.id}">I've taken this</button>
        </div>
        <p class="desc">${esc(c.description)}</p>
        <div class="why">${c.reasons.map((r) => `<span>${esc(cap(r))}</span>`).join("")}</div>
      </li>`).join("");
  }
  $("#cards").addEventListener("click", (e) => {
    const b = e.target.closest("[data-take]");
    if (b) addTaken(+b.dataset.take, 4);
  });

  // ---------- course map ----------
  const W = 680, H = 420, PAD = 44;
  const px = (v) => PAD + v * (W - 2 * PAD);
  const py = (v) => PAD + (1 - v) * (H - 2 * PAD);

  function buildLegend(cats) {
    $("#legend").innerHTML = cats.map((c) => `<li><i style="background:${CAT_COLOR[c]}"></i>${esc(c)}</li>`).join("");
  }

  function drawMap() {
    const svg = $("#map");
    // soft hull-like blobs per KMeans cluster
    const groups = {};
    state.courses.forEach((c) => (groups[c.cluster] ||= []).push(c));
    let out = "";
    Object.entries(groups).forEach(([cl, members]) => {
      const cx = members.reduce((a, m) => a + px(m.x), 0) / members.length;
      const cy = members.reduce((a, m) => a + py(m.y), 0) / members.length;
      const r = Math.max(...members.map((m) => Math.hypot(px(m.x) - cx, py(m.y) - cy))) + 22;
      out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colorOf(members[0])}" opacity=".08"/>`;
    });
    state.courses.forEach((c) => {
      const picked = state.picks.includes(c.id), taken = c.id in state.ratings;
      if (picked) out += `<circle cx="${px(c.x)}" cy="${py(c.y)}" r="17" fill="#FFD84D" opacity=".9"/>`;
      out += `<circle class="dot" data-id="${c.id}" cx="${px(c.x)}" cy="${py(c.y)}" r="8" fill="${colorOf(c)}" stroke="${taken ? "#14182B" : "#fff"}" stroke-width="${taken ? 3 : 2}" tabindex="0" aria-label="${esc(c.title)}"/>`;
    });
    svg.innerHTML = out;
  }

  const tip = $("#tip");
  const box = $(".map-box");
  $("#map").addEventListener("mousemove", (e) => {
    const d = e.target.closest(".dot");
    if (!d) return (tip.hidden = true);
    const c = state.byId[d.dataset.id];
    tip.innerHTML = `${esc(c.title)}<small>${esc(c.category)} · cluster: ${esc(state.clusters[c.cluster])}</small>`;
    const rect = box.getBoundingClientRect();
    tip.style.left = e.clientX - rect.left + "px";
    tip.style.top = e.clientY - rect.top + "px";
    tip.hidden = false;
  });
  $("#map").addEventListener("mouseleave", () => (tip.hidden = true));
})();
