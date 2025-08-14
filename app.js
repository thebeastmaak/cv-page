(function(){
  const params = new URLSearchParams(location.search);
  const nameParam = params.get("name");
  const yearEl = document.getElementById("year");
  yearEl.textContent = new Date().getFullYear();

  if (!nameParam) {
    document.body.insertAdjacentHTML("afterbegin",
      `<div class="notice">Add <code>?name=Your Name</code> to the URL. Example: <code>?name=Soufiane Maakouk</code></div>`);
    return;
  }

  const slugify = s => s.toLowerCase().trim()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

  const slug = slugify(nameParam);

  fetch(`${window.API_BASE}/profiles/slug/${slug}`, { cache: "no-store" })
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(data => render(data))
    .catch(async (err) => {
      if (err.json) {
        const e = await err.json();
        showError(e.error || "Profile not found");
      } else {
        showError("Could not load profile.");
      }
    });

  function showError(msg) {
    document.body.insertAdjacentHTML("afterbegin",
      `<div class="notice">${msg}. Check the name in the URL.</div>`);
  }

  function chips(id, arr = []) {
  const el = document.getElementById(id);
  arr.forEach(x => {
    const li = document.createElement("li");
    if (typeof x === "string") {
      li.textContent = x;
    } else if (x && typeof x === "object") {
      if (x.name) {
        li.textContent = x.level ? `${x.name} (${x.level})` : x.name;
      } else {
        li.textContent = JSON.stringify(x);
      }
    }
    el.appendChild(li);
  });
}


  function render(d) {
    document.title = `${d.name} — Digital CV`;
    document.getElementById("name").textContent = d.name || "";
    document.getElementById("nameFooter").textContent = d.name || "";
    document.getElementById("headline").textContent = d.headline || "";
    if (d.avatar) document.getElementById("avatar").style.backgroundImage = `url(${d.avatar})`;

    const meta = document.getElementById("meta");
    const links = [];
    if (d.email) links.push({label:d.email, href:`mailto:${d.email}`});
    if (d.phone) links.push({label:d.phone, href:`tel:${(d.phone||'').replace(/\s+/g,'')}`});
    if (d.location) links.push({label:d.location});
    (d.links || []).forEach(l => links.push(l));
    links.forEach(l => {
      const li = document.createElement("li");
      if (l.href) { const a = document.createElement("a"); a.href=l.href; a.target="_blank"; a.textContent=l.label; li.appendChild(a); }
      else { li.textContent = l.label; }
      meta.appendChild(li);
    });

    chips("core", d.core_competencies || []);
    chips("skills", d.technical_skills || []);
    chips("langs", (d.languages||[]).map(x => `${x.name} (${x.level})`));

    const expRoot = document.getElementById("exp");
    (d.experience || []).forEach(job => {
      const wrap = document.createElement("div");
      wrap.className = "job";
      const when = [job.start, job.end || "Present"].filter(Boolean).join(" – ");
      wrap.innerHTML = `
        <h3>${job.title} <span class="org">| ${job.company}${job.location ? ", " + job.location : ""}</span></h3>
        <div class="date">${when}</div>
      `;
      if (job.highlights?.length) {
        const ul = document.createElement("ul");
        job.highlights.forEach(h => { const li = document.createElement("li"); li.textContent = h; ul.appendChild(li); });
        wrap.appendChild(ul);
      }
      expRoot.appendChild(wrap);
    });

    const edu = document.getElementById("edu");
    (d.education || []).forEach(e => {
      const li = document.createElement("li");
      li.textContent = [e.title, e.institution, e.year].filter(Boolean).join(" — ");
      edu.appendChild(li);
    });

    const prj = document.getElementById("projects");
    (d.projects || []).forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = p.url ? `<a href="${p.url}" target="_blank">${p.name}</a> — ${p.description||""}` : `${p.name} — ${p.description||""}`;
      prj.appendChild(li);
    });
  }
})();
