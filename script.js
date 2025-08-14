(async function () {
  const yearEl = document.getElementById("year");
  yearEl.textContent = new Date().getFullYear();

  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load profile.json");
    const data = await res.json();

    document.getElementById("page-title").textContent = data.name + " — Digital CV";
    document.getElementById("name").textContent = data.name;
    document.getElementById("name-footer").textContent = data.name;
    document.getElementById("headline").textContent = data.headline || "";

    if (data.avatar) {
      document.getElementById("avatar").style.backgroundImage = `url(${data.avatar})`;
    }

    // meta links (email, phone, location, linkedin/gh/etc.)
    const meta = document.getElementById("meta-links");
    const links = [];
    if (data.email) links.push({ label: data.email, href: `mailto:${data.email}` });
    if (data.phone) links.push({ label: data.phone, href: `tel:${data.phone.replace(/\s+/g,'')}` });
    if (data.location) links.push({ label: data.location });
    (data.links || []).forEach(l => links.push(l));
    links.forEach(l => {
      const li = document.createElement("li");
      if (l.href) { const a = document.createElement("a"); a.href = l.href; a.textContent = l.label; a.target="_blank"; li.appendChild(a); }
      else { li.textContent = l.label; }
      meta.appendChild(li);
    });

    const fillChips = (id, arr) => {
      const el = document.getElementById(id);
      (arr || []).forEach(x => { const li = document.createElement("li"); li.textContent = x; el.appendChild(li); });
    };
    fillChips("competencies", data.core_competencies);
    fillChips("skills", data.technical_skills);
    fillChips("languages", (data.languages || []).map(l => `${l.name} (${l.level})`));

    // experience
    const expRoot = document.getElementById("experience");
    (data.experience || []).forEach(job => {
      const div = document.createElement("div");
      div.className = "job";
      const date = [job.start, job.end || "Present"].filter(Boolean).join(" – ");
      div.innerHTML = `
        <h3>${job.title} <span class="org">| ${job.company}${job.location ? ", " + job.location : ""}</span></h3>
        <div class="date">${date}</div>
      `;
      if (job.highlights && job.highlights.length) {
        const ul = document.createElement("ul");
        job.highlights.forEach(h => { const li = document.createElement("li"); li.textContent = h; ul.appendChild(li); });
        div.appendChild(ul);
      }
      expRoot.appendChild(div);
    });

    // education
    const edu = document.getElementById("education");
    (data.education || []).forEach(e => {
      const li = document.createElement("li");
      li.textContent = [e.title, e.institution, e.year].filter(Boolean).join(" — ");
      edu.appendChild(li);
    });

    // projects
    const proj = document.getElementById("projects");
    (data.projects || []).forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = p.url ? `<a href="${p.url}" target="_blank">${p.name}</a> — ${p.description || ""}` : `${p.name} — ${p.description || ""}`;
      proj.appendChild(li);
    });
  } catch (e) {
    console.error(e);
  }
})();
