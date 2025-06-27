import type { APIRoute } from "astro";

/**
 * Example: /api/suggestions?q=astro&engine=google
 */

const engines = {
  google: {
    url: (query: string) =>
      `http://suggestqueries.google.com/complete/search?client=firefox&q=${query}`,
    transform: (data: any): string[] => data[1] || [],
  },
  yahoo: {
    url: (query: string) =>
      `https://ff.search.yahoo.com/gossip?output=fxjson&command=${query}`,
    transform: (data: any): string[] =>
      data.gossip?.results?.map((item: any) => item.key) || [],
  },
  bing: {
    url: (query: string) => `https://api.bing.com/osjson.aspx?query=${query}`,
    transform: (data: any): string[] => data[1] || [],
  },
  ddg: {
    url: (query: string) => `https://duckduckgo.com/ac/?q=${query}`,
    transform: (data: any): string[] =>
      data.map((item: any) => item.phrase) || [],
  },
};

export const GET: APIRoute = async ({ url }): Promise<Response> => {
  const query = url.searchParams.get("q");
  const engineName =
    (url.searchParams.get("engine") as keyof typeof engines) || "duckduckgo";

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query parameter" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const engine = engines[engineName];

  if (!engine) {
    return new Response(
      JSON.stringify({
        error: `Unsupported engine. Supported engines are: ${Object.keys(
          engines
        ).join(", ")}`,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const externalApiUrl = engine.url(query);
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
      return new Response(await response.text(), {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "text/plain",
        },
      });
    }

    const data = await response.json();
    const suggestions = engine.transform(data);

    return new Response(JSON.stringify(suggestions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(`Error fetching suggestions from ${engineName}:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

