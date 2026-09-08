const path = require("path");
const fs = require("fs");

const tutorialsDir = path.join(process.cwd(), "content", "tutorials");

async function testGetTutorialBySlug() {
  const slug = "advanced-typescript";
  const tryPaths = [
    path.join(tutorialsDir, `${slug}.md`),
    path.join(tutorialsDir, `${slug}.mdx`),
    path.join(tutorialsDir, `${slug}.html`),
  ];

  console.log("Tutorial directory:", tutorialsDir);
  console.log("Looking for slug:", slug);
  console.log("\nTrying paths:");

  for (const p of tryPaths) {
    const exists = fs.existsSync(p);
    console.log(`  ${p}`);
    console.log(`    Exists: ${exists}`);

    if (exists) {
      const stats = fs.statSync(p);
      console.log(`    Size: ${stats.size} bytes`);
      console.log(
        `    Can read: ${fs.accessSync(p, fs.constants.R_OK) === undefined}`,
      );
    }
  }

  // List all files in the directory
  console.log("\nAll files in tutorials directory:");
  const files = fs.readdirSync(tutorialsDir);
  files.forEach((f) => console.log(`  ${f}`));
}

testGetTutorialBySlug();
