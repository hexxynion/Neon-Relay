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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({url})
    });

    const type = response.headers.get("content-type") || "";
    const body = await response.text();

    if (!response.ok) {
      let message = body;
      try { message = JSON.parse(body).error || body; } catch {}
      throw new Error(message);
    }

    status.textContent = `Connected — HTTP ${response.status}`;
    resultTitle.textContent = `HTTP ${response.status}`;
    resultBody.textContent = body;
    resultCard.classList.remove("hidden");
  } catch (err) {
    status.textContent = err.message || "Request failed.";
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultBody.textContent);
  copyBtn.textContent = "COPIED";
  setTimeout(() => copyBtn.textContent = "COPY", 1200);
});
