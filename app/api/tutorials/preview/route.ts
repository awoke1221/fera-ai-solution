import { remark } from "remark";
import html from "remark-html";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;
    if (typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
      });
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
