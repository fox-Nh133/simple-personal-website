import fs from "fs";
import stripJsonComments from "strip-json-comments";

const JSON_PATH = "./works.jsonc";
const TEMPLATE_PATH = "./template.html";
const OUTPUT_PATH = "./work.html";

// --- html escape ---
const esc = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const fileExists = (p) => {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
};

// --- main ---
try {
  if (!fileExists(JSON_PATH)) throw new Error(`Missing ${JSON_PATH}`);
  if (!fileExists(TEMPLATE_PATH)) throw new Error(`Missing ${TEMPLATE_PATH}`);

  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const works = JSON.parse(stripJsonComments(raw));
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const sections = works.map((item, idx) => {
    const title = esc(item.title ?? `Untitled #${idx + 1}`);
    const desc  = esc(item.description ?? "");
    const tags  = Array.isArray(item.tags) && item.tags.length ? `# ${item.tags.map(esc).join(", ")}` : "";
    const links = Array.isArray(item.links)
      ? item.links
          .filter(l => l && l.url)
          .map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label ?? "Link")}</a>`)
          .join(" ")
      : "";

    const img = item.image
      ? `<img src="${esc(item.image)}" alt="${title}" loading="lazy" decoding="async">`
      : "";

    return `
<section class="work">
  <h2>${title}</h2>
  ${desc ? `<p>${desc}</p>` : ""}
  ${img}
  ${links ? `<div class="links">${links}</div>` : ""}
  ${tags ? `<div class="tags">${tags}</div>` : ""}
</section>`.trim();
  }).join("\n\n");

  const html = template.replace("{{WORK_LIST}}", sections || "<p>No works yet.</p>");
  fs.writeFileSync(OUTPUT_PATH, html);

  console.log("✅ Generated:", OUTPUT_PATH);
} catch (e) {
  console.error("❌ Generation failed:", e.message);
  process.exit(1);
}
