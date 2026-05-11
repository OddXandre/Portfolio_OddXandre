import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, extname } from "path";

const PROJECT_DIR = new URL("..", import.meta.url).pathname;

const htmlFiles = readdirSync(PROJECT_DIR).filter(
  (f) => f.endsWith(".html") && f !== "beyond-pitch-deck.html"
);

// Only update references for images that actually have WebP versions
function hasWebpVersion(originalPath) {
  const fullPath = join(PROJECT_DIR, originalPath);
  const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  return existsSync(webpPath);
}

let totalReplacements = 0;

for (const file of htmlFiles) {
  const filePath = join(PROJECT_DIR, file);
  let content = readFileSync(filePath, "utf-8");
  let originalContent = content;

  // Find all src attributes pointing to media/ images
  const srcRegex = /(src\s*=\s*")([^"]+\.(jpg|jpeg|png))(")/gi;
  let match;
  const replacements = [];

  while ((match = srcRegex.exec(content)) !== null) {
    const full = match[0];
    const prefix = match[1];
    const imgPath = match[2];
    const suffix = match[4];

    if (hasWebpVersion(imgPath)) {
      replacements.push({ from: full, to: `${prefix}${imgPath.replace(/\.(jpg|jpeg|png)$/i, ".webp")}${suffix}` });
    }
  }

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  // Also update CSS references in inline styles if any
  const styleRegex = /(url\(["']?)([^"')]+\.(jpg|jpeg|png))(["']?\))/gi;
  while ((match = styleRegex.exec(content)) !== null) {
    const full = match[0];
    const prefix = match[1];
    const imgPath = match[2];
    const suffix = match[4];

    if (hasWebpVersion(imgPath)) {
      content = content.replace(full, `${prefix}${imgPath.replace(/\.(jpg|jpeg|png)$/i, ".webp")}${suffix}`);
    }
  }

  if (content !== originalContent) {
    writeFileSync(filePath, content, "utf-8");
    const count = replacements.length;
    totalReplacements += count;
    console.log(`  ${file}: ${count} referencias actualizadas`);
  }
}

console.log(`\nTotal: ${totalReplacements} referencias a WebP en ${htmlFiles.length} archivos`);
