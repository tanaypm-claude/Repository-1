/* ============================================================
   DEDCARD — trading card generator
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- state ----------
const state = {
  traits: [
    { name: "HACK",      value: 92 },
    { name: "STEALTH",   value: 74 },
    { name: "CHAOS",     value: 88 },
    { name: "SIGNAL",    value: 61 },
  ],
  palette: "acid",
  shinyForced: false,
};

const MAX_TRAITS = 5;
const MIN_TRAITS = 1;

// ---------- trait rendering ----------
const traitListEl = $("#trait-list");
const traitTpl = $("#trait-template");
const addTraitBtn = $("#add-trait");
const traitCountEl = $("#trait-count");

function buildTraitRow(trait, idx) {
  const node = traitTpl.content.firstElementChild.cloneNode(true);
  const nameInput = $(".t-name", node);
  const valInput = $(".t-val", node);
  const out = $(".t-out", node);
  const del = $(".t-del", node);

  nameInput.value = trait.name;
  valInput.value = trait.value;
  out.textContent = trait.value;

  nameInput.addEventListener("input", () => {
    state.traits[idx].name = nameInput.value.toUpperCase();
    renderCardTraits();
  });
  valInput.addEventListener("input", () => {
    const v = +valInput.value;
    state.traits[idx].value = v;
    out.textContent = v;
    renderCardTraits();
  });
  del.addEventListener("click", () => {
    if (state.traits.length <= MIN_TRAITS) return;
    state.traits.splice(idx, 1);
    renderTraitForm();
    renderCardTraits();
  });

  return node;
}

function renderTraitForm() {
  traitListEl.replaceChildren();
  state.traits.forEach((t, i) => traitListEl.appendChild(buildTraitRow(t, i)));
  traitCountEl.textContent = state.traits.length;
  addTraitBtn.disabled = state.traits.length >= MAX_TRAITS;
}

addTraitBtn.addEventListener("click", () => {
  if (state.traits.length >= MAX_TRAITS) return;
  state.traits.push({ name: "NEW_TRAIT", value: 50 });
  renderTraitForm();
  renderCardTraits();
});

// ---------- card live update ----------
const cardEl = $("#card");
const c = {
  id: $("#c-id"),
  rank: $("#c-rank"),
  number: $("#c-number"),
  name: $("#c-name"),
  title: $("#c-title"),
  flavor: $("#c-flavor"),
  initial: $("#c-initial"),
  portrait: $("#c-portrait"),
  traits: $("#c-traits"),
  shinyTag: $("#c-shiny-tag"),
};

const form = {
  name: $("#f-name"),
  title: $("#f-title"),
  rank: $("#f-rank"),
  id: $("#f-id"),
  number: $("#f-number"),
  flavor: $("#f-flavor"),
  image: $("#f-image"),
  shiny: $("#f-shiny"),
};

function renderCardText() {
  const nm = (form.name.value || "UNKNOWN").trim().toUpperCase();
  c.name.textContent = nm;
  c.name.setAttribute("data-text", nm);
  c.title.textContent = form.title.value || "";
  c.rank.textContent = form.rank.value || "?";
  c.id.textContent = form.id.value || "—";
  c.number.textContent = form.number.value || "000";
  c.flavor.textContent = form.flavor.value || "";
  c.initial.textContent = nm.charAt(0) || "?";
}

function renderCardTraits() {
  c.traits.replaceChildren();
  state.traits.forEach(t => {
    const li = document.createElement("li");
    li.className = "trait";
    li.innerHTML = `
      <span class="trait-label">${escapeHTML(t.name)}</span>
      <span class="trait-value">${t.value}</span>
      <span class="trait-bar"><span class="trait-fill" style="--v:${t.value}%"></span></span>
    `;
    c.traits.appendChild(li);
  });
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

// wire all form inputs
[form.name, form.title, form.rank, form.id, form.number, form.flavor]
  .forEach(el => el.addEventListener("input", renderCardText));

// ---------- portrait upload ----------
form.image.addEventListener("change", () => {
  const file = form.image.files?.[0];
  if (!file) {
    c.portrait.style.backgroundImage = "";
    c.initial.style.display = "";
    return;
  }
  const url = URL.createObjectURL(file);
  c.portrait.style.backgroundImage = `url("${url}")`;
  c.initial.style.display = "none";
});

// ---------- palette picker ----------
$$("#palette-picker .swatch").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("#palette-picker .swatch").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.palette = btn.dataset.palette;
    cardEl.dataset.palette = state.palette;
  });
});

// ---------- shiny logic ----------
function setShiny(on) {
  cardEl.classList.toggle("is-shiny", !!on);
  c.shinyTag.textContent = on ? "SHINY" : "PRINT";
}

form.shiny.addEventListener("change", () => {
  state.shinyForced = form.shiny.checked;
  setShiny(state.shinyForced);
});

// tap card to toggle shiny (mobile-friendly)
cardEl.addEventListener("click", e => {
  // avoid toggling when the tap started a drag, etc.
  if (e.detail === 0) return;
  const next = !cardEl.classList.contains("is-shiny");
  form.shiny.checked = next;
  state.shinyForced = next;
  setShiny(next);
});

// randomize shine chance on new renders when not forced
function maybeRollShiny() {
  if (state.shinyForced) { setShiny(true); return; }
  const lucky = Math.random() < 0.18;   // ~1 in 6
  setShiny(lucky);
}

// ---------- randomize ----------
const NAMES = ["WRENCH_JR","MARC3","SITARA","R3TR0","GH0STWIRE","NULL_PTR","K-OS","R00TB0Y","NEON_Q","P1XEL","ZERO_COOL","BINTR0N","WRAITH","V0LT","GLITCHK1D","SH4DE"];
const TITLES = ["the signal breaker","chaos operator","mask dealer","packet ghost","wrench in the works","sprite whisperer","dead pixel prophet","midnight sysadmin","hex slinger","the overclocker"];
const FLAVORS = [
  "// they think they built the city. we just changed the password.",
  "// eyes everywhere, ours see back.",
  "// turn it off. turn it on. take it back.",
  "// DEDSEC was here. still is.",
  "// we are the static between their songs.",
  "// not a bug. a feature. of us.",
];
const TRAIT_POOL = ["HACK","STEALTH","CHAOS","SIGNAL","WIT","LUCK","SPEED","GRIT","NOISE","RANGE","CHARM","LORE","RISK","REACH","CRYPTO","NERVE"];

function randomize() {
  form.name.value = pick(NAMES);
  form.title.value = pick(TITLES);
  form.rank.value = pick(["S+","S","A","B","C","??"]);
  form.id.value = "0x" + randHex(2) + "-" + randHex(2);
  form.number.value = String(Math.floor(Math.random()*999)).padStart(3, "0");
  form.flavor.value = pick(FLAVORS);

  const n = 3 + Math.floor(Math.random() * 3); // 3..5
  const traits = shuffle([...TRAIT_POOL]).slice(0, n);
  state.traits = traits.map(name => ({ name, value: 20 + Math.floor(Math.random()*80) }));

  const palettes = ["acid","toxic","sunset","cobalt","blood","moebius"];
  const p = pick(palettes);
  state.palette = p;
  cardEl.dataset.palette = p;
  $$("#palette-picker .swatch").forEach(b => b.classList.toggle("is-active", b.dataset.palette === p));

  renderTraitForm();
  renderCardText();
  renderCardTraits();
  maybeRollShiny();
}
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function randHex(n) { return [...Array(n)].map(() => Math.floor(Math.random()*16).toString(16).toUpperCase()).join(""); }
function shuffle(a) { for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

$("#reroll").addEventListener("click", randomize);

// ---------- tilt + shine tracking ----------
const stage = $(".tilt-stage");
const MAX_TILT = 12;   // deg
let rafId = null;
let targetRX = 0, targetRY = 0;
let currentRX = 0, currentRY = 0;
let mx = 50, my = 50;       // shine position (%)
let sx = 50;                // iridescent band position (%)

function applyTilt() {
  currentRX += (targetRX - currentRX) * 0.15;
  currentRY += (targetRY - currentRY) * 0.15;
  cardEl.style.setProperty("--rx", currentRX.toFixed(2) + "deg");
  cardEl.style.setProperty("--ry", currentRY.toFixed(2) + "deg");
  cardEl.style.setProperty("--mx", mx.toFixed(1) + "%");
  cardEl.style.setProperty("--my", my.toFixed(1) + "%");
  cardEl.style.setProperty("--sx", sx.toFixed(1) + "%");
  if (Math.abs(targetRX - currentRX) > 0.02 || Math.abs(targetRY - currentRY) > 0.02) {
    rafId = requestAnimationFrame(applyTilt);
  } else {
    rafId = null;
  }
}

function schedule() { if (!rafId) rafId = requestAnimationFrame(applyTilt); }

stage.addEventListener("mousemove", e => {
  const rect = cardEl.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;  // 0..1
  const y = (e.clientY - rect.top)  / rect.height;
  targetRY = (x - 0.5) *  2 * MAX_TILT;
  targetRX = (y - 0.5) * -2 * MAX_TILT;
  mx = x * 100;
  my = y * 100;
  // iridescent band tracks the diagonal, exaggerated
  sx = Math.max(0, Math.min(100, (x + (1 - y)) / 2 * 100));
  schedule();
});

stage.addEventListener("mouseleave", () => {
  targetRX = 0; targetRY = 0;
  mx = 50; my = 50; sx = 50;
  schedule();
});

// touch
stage.addEventListener("touchmove", e => {
  if (!e.touches.length) return;
  const t = e.touches[0];
  const rect = cardEl.getBoundingClientRect();
  const x = (t.clientX - rect.left) / rect.width;
  const y = (t.clientY - rect.top)  / rect.height;
  targetRY = (x - 0.5) *  2 * MAX_TILT;
  targetRX = (y - 0.5) * -2 * MAX_TILT;
  mx = x * 100; my = y * 100;
  sx = Math.max(0, Math.min(100, (x + (1 - y)) / 2 * 100));
  schedule();
}, { passive: true });

stage.addEventListener("touchend", () => {
  targetRX = 0; targetRY = 0;
  mx = 50; my = 50; sx = 50;
  schedule();
});

// ---------- device orientation (phone tilt) ----------
const motionBtn = $("#btn-motion");
let motionEnabled = false;

function onOrientation(e) {
  // beta: front-back (-180..180), gamma: left-right (-90..90)
  const beta  = Math.max(-30, Math.min(30, e.beta  || 0));
  const gamma = Math.max(-30, Math.min(30, e.gamma || 0));
  targetRX = -(beta / 30) * MAX_TILT;
  targetRY =  (gamma / 30) * MAX_TILT;
  // move shine position with tilt
  mx = 50 + (gamma / 30) * 35;
  my = 50 + (beta  / 30) * 35;
  sx = Math.max(0, Math.min(100, 50 + (gamma / 30) * 40));
  schedule();
}

async function enableMotion() {
  try {
    // iOS requires explicit permission
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== "granted") return;
    }
    window.addEventListener("deviceorientation", onOrientation, true);
    motionEnabled = true;
    motionBtn.textContent = "motion on";
    motionBtn.disabled = true;
  } catch (err) {
    console.warn("motion permission denied", err);
  }
}

motionBtn.addEventListener("click", enableMotion);

// ---------- download PNG ----------
$("#btn-download").addEventListener("click", async () => {
  // quick DOM-to-SVG-to-canvas pipeline using foreignObject
  const rect = cardEl.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  const clone = cardEl.cloneNode(true);
  clone.style.transform = "none";
  clone.style.margin = "0";

  // inline computed fonts (best effort: reference loaded stylesheets)
  const styleTags = [...document.styleSheets].map(s => {
    try {
      return [...s.cssRules].map(r => r.cssText).join("\n");
    } catch { return ""; }
  }).join("\n");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>${styleTags}</style>
      ${clone.outerHTML}
    </div>
  </foreignObject>
</svg>`.trim();

  const img = new Image();
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    canvas.toBlob(b => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `dedcard_${(form.name.value||"card").replace(/\W+/g,"_")}.png`;
      a.click();
    });
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert("Download failed — try a screenshot instead.");
  };
  img.src = url;
});

// ---------- init ----------
renderTraitForm();
renderCardText();
renderCardTraits();
maybeRollShiny();
