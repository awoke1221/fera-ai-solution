const http = require("http");

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: "GET",
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data.substring(0, 2000),
          });
        });
      },
    );

    req.on("error", (e) => reject(e));
    req.end();
  });
}

async function test() {
  try {
    console.log("Fetching /tutorials/advanced-typescript...");
    const result = await makeRequest("/tutorials/advanced-typescript");
    console.log("Status:", result.status);
    console.log("Response (first 2000 chars):");
    console.log(result.body);
  } catch (err) {
    console.error("Request error:", err.message);
  }
}

test();
