
export async function GET({ url }: { url: URL }) {
  try {
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing 'url' query param", { status: 400 });
    }

    const response = await fetch(targetUrl);
    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (err) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
