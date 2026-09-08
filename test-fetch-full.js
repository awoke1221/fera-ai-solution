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
            body: data,
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
    console.log("Status:", result.statusCode);

    // Look for error indicators
    if (result.body.includes("Application error")) {
      console.log("Found application error in response!");
    }

    // Write full response to file
    const fs = require("fs");
    fs.writeFileSync("tutorial-response.html", result.body);
    console.log("Full response written to tutorial-response.html");
    console.log("File size:", result.body.length);

    // Check for specific error patterns
    if (result.body.includes("Digest:")) {
      const match = result.body.match(/Digest:\s*(\w+)/);
      console.log("Found Digest error:", match ? match[1] : "unknown");
    }
  } catch (err) {
    console.error("Request error:", err.message);
  }
}

test();
