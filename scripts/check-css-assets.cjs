const http = require("node:http");

const baseUrl = process.env.SMOKE_URL || "http://localhost:3001";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({ statusCode: response.statusCode, body });
      });
    });

    request.on("error", reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error(`Timed out fetching ${url}`));
    });
  });
}

async function main() {
  const page = await fetchText(baseUrl);

  if (page.statusCode !== 200) {
    throw new Error(`Expected ${baseUrl} to return 200, got ${page.statusCode}`);
  }

  const stylesheetPaths = [...page.body.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(
    (match) => match[1]
  );

  if (stylesheetPaths.length === 0) {
    throw new Error("No stylesheet links found on the home page.");
  }

  for (const stylesheetPath of stylesheetPaths) {
    const stylesheetUrl = new URL(stylesheetPath, baseUrl).toString();
    const stylesheet = await fetchText(stylesheetUrl);

    if (stylesheet.statusCode !== 200) {
      throw new Error(`Stylesheet ${stylesheetPath} returned ${stylesheet.statusCode}`);
    }

    if (!stylesheet.body.includes(".flex") || !stylesheet.body.includes(".bg-slate-50")) {
      throw new Error(`Stylesheet ${stylesheetPath} does not contain expected Tailwind output.`);
    }
  }

  console.log(`Smoke check passed: ${stylesheetPaths.length} stylesheet(s) loaded from ${baseUrl}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
