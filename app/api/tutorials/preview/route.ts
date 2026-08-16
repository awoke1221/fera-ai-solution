import { remark } from "remark";
import html from "remark-html";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, contentType = "markdown" } = body;
    if (typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
      });
    }

    if (contentType === "html") {
      return new Response(JSON.stringify({ html: content }), { status: 200 });
    }

    const processed = await remark().use(html).process(content);
    return new Response(JSON.stringify({ html: processed.toString() }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
}
