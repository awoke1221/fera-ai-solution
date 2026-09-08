const fs = require("fs");
const path = require("path");

const filePath = path.join(
  process.cwd(),
  "content",
  "tutorials",
  "advanced-typescript.md",
);
const content = fs.readFileSync(filePath, "utf8");

// Check for backtick issues
const lines = content.split("\n");
let inCodeBlock = false;
let blockLanguage = "";
let lastBlockStart = 0;
const codeBlockStarts = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.startsWith("```")) {
    if (inCodeBlock) {
      codeBlockStarts[codeBlockStarts.length - 1].end = i + 1;
      inCodeBlock = false;
    } else {
      lastBlockStart = i + 1;
      blockLanguage = line.substring(3).trim();
      codeBlockStarts.push({
        start: i + 1,
        language: blockLanguage,
        end: null,
      });
      inCodeBlock = true;
    }
  }
}

console.log(`Found ${codeBlockStarts.length} code blocks:`);
codeBlockStarts.forEach((block, idx) => {
  const status = block.end
    ? `lines ${block.start}-${block.end}`
    : `UNCLOSED starting at line ${block.start}`;
  console.log(`  ${idx + 1}. ${status} (${block.language})`);
});

if (inCodeBlock) {
  console.error(
    "\nERROR: Last code block not closed! Started at line",
    lastBlockStart,
  );
  process.exit(1);
} else {
  console.log("\nAll code blocks properly closed!");
}

// Also check the frontmatter
const matter = require("gray-matter");
const { data, content: md } = matter(content);
console.log("\nFrontmatter:");
Object.keys(data).forEach((key) => {
  console.log(
    `  ${key}: ${typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key]}`,
  );
});
console.log(`\nMarkdown content length: ${md.length} characters`);
