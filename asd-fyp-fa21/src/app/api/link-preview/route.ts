import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Add timeout and better headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Clean and truncate text
    const cleanText = (text: string, maxLength = 160) => {
      return text?.replace(/\s+/g, " ")?.trim()?.substring(0, maxLength) || "";
    };

    const preview = {
      title: cleanText(
        $('meta[property="og:title"]').attr("content") ||
          $('meta[name="twitter:title"]').attr("content") ||
          $("title").text() ||
          "No title available",
        100
      ),
      description: cleanText(
        $('meta[property="og:description"]').attr("content") ||
          $('meta[name="twitter:description"]').attr("content") ||
          $('meta[name="description"]').attr("content") ||
          $("p").first().text() ||
          "No description available"
      ),
      image:
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        null,
      siteName:
        $('meta[property="og:site_name"]').attr("content") ||
        new URL(url).hostname,
      url: url,
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error("Link preview error:", error);

    // Return a basic preview with just the URL info
    try {
      const urlObj = new URL(req.url);
      const { url } = await req.json();
      return NextResponse.json({
        title: new URL(url).hostname,
        description: "Unable to fetch preview",
        image: null,
        siteName: new URL(url).hostname,
        url: url,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch link preview" },
        { status: 500 }
      );
    }
  }
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
