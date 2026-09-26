const form = document.querySelector("#relayForm");
const input = document.querySelector("#url");
const status = document.querySelector("#status");
const resultCard = document.querySelector("#resultCard");
const resultTitle = document.querySelector("#resultTitle");
const resultBody = document.querySelector("#resultBody");
const copyBtn = document.querySelector("#copyBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = input.value.trim();

  status.textContent = "Checking destination…";
  resultCard.classList.add("hidden");

  try {
    const response = await fetch("/api/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    status.textContent = `Connected — HTTP ${data.status}`;
    resultTitle.textContent = `HTTP ${data.status}`;

    resultBody.textContent =
`URL: ${data.finalUrl}
Status: ${data.status} ${data.statusText}
Content-Type: ${data.contentType || "unknown"}
Size: ${data.size} bytes
Response time: ${data.responseTime}

Preview:
${data.preview}`;

    resultCard.classList.remove("hidden");

  } catch (err) {
    status.textContent = err.message || "Request failed.";
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultBody.textContent);

  copyBtn.textContent = "COPIED";

  setTimeout(() => {
    copyBtn.textContent = "COPY";
  }, 1200);
});
