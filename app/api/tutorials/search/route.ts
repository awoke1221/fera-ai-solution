import { searchTutorials } from "@/lib/tutorials";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const results = await searchTutorials(query);

    return new Response(
      JSON.stringify({
        ok: true,
        query,
        count: results.length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Search error:", err);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
    });
  }
}
