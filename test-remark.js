const { remark } = require("remark");
const html = require("remark-html");

const testMarkdown = `
# Test

Here's code:

\`\`\`javascript
const x = 5;
console.log(x);
\`\`\`

And text after.

* [ ] Item 1
* [ ] Item 2
`;

async function test() {
  try {
    const result = await remark().use(html).process(testMarkdown);

    console.log("=== REMARK-HTML OUTPUT ===");
    console.log(result.toString());
    console.log("=== END ===");
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error(err.stack);
  }
}

test();
