const fs = require("fs");
const path = require("path");
const { remark } = require("remark");
const html = require("remark-html");
const matter = require("gray-matter");

async function test() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "tutorials",
    "advanced-typescript.md",
  );
  const raw = fs.readFileSync(filePath, "utf8");
  const { content } = matter(raw);

  // Look for code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlockMatches = content.match(codeBlockRegex);
  console.log(
    "Found code blocks:",
    codeBlockMatches ? codeBlockMatches.length : 0,
  );

  if (codeBlockMatches && codeBlockMatches[0]) {
    console.log("\nFirst code block (first 200 chars):");
    console.log(codeBlockMatches[0].substring(0, 200));
  }

  // Test HTML conversion
  const processed = await remark().use(html).process(content);
  const output = processed.toString();

  // Check for code tags
  const hasCodeBlocks = output.includes("<code");
  const hasPreBlocks = output.includes("<pre");

  console.log("\nHTML conversion results:");
  console.log("Has <code> tags:", hasCodeBlocks);
  console.log("Has <pre> tags:", hasPreBlocks);
  console.log("Total HTML length:", output.length);

  // Look for specific patterns that might cause issues
  if (output.includes("undefined")) {
    console.warn('\nWARNING: Found "undefined" in output!');
  }

  if (output.includes("NaN")) {
    console.warn('WARNING: Found "NaN" in output!');
  }

  // Check last 300 chars
  console.log("\nLast 300 characters:");
  console.log(output.substring(output.length - 300));
}

test().catch((err) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
