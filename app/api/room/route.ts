const backend = process.env.SIGNAL_BACKEND_URL ?? "https://signal-party-prash.prashanthreddyloka54.chatgpt.site";

async function proxy(req: Request) {
  const incoming = new URL(req.url);
  const target = new URL("/api/room", backend);
  target.search = incoming.search;
  const headers = new Headers();
  for (const name of ["authorization", "content-type"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const upstream = await fetch(target, { method: req.method, headers, body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(), cache: "no-store" });
  return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
}

export const dynamic = "force-dynamic";
export async function GET(req: Request) { return proxy(req); }
export async function POST(req: Request) { return proxy(req); }
