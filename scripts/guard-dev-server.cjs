const http = require("node:http");

const port = Number(process.env.PORT || 3001);

if (process.env.CI) {
  process.exit(0);
}

const request = http.get(
  {
    hostname: "127.0.0.1",
    port,
    path: "/",
    timeout: 1000,
  },
  (response) => {
    response.resume();
    console.error(
      `A local dev server is already running on port ${port}. Stop it before running npm run build, otherwise Next can leave the browser with missing CSS assets.`
    );
    process.exit(1);
  }
);

request.on("timeout", () => {
  request.destroy();
  process.exit(0);
});

request.on("error", () => {
  process.exit(0);
});
