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


/* =========================================================
   NEON RELAY // CYBER BOOT SYSTEM
   ========================================================= */

const bootScreen = document.getElementById("bootScreen");
const enterButton = document.getElementById("enterButton");
const app = document.getElementById("app");

let audioContext;
let masterGain;
let ambientStarted = false;


/* ---------------------------------------------------------
   CYBER SYNTH
   --------------------------------------------------------- */

function startCyberAudio() {

  if (ambientStarted) return;

  ambientStarted = true;

  audioContext =
    new (window.AudioContext || window.webkitAudioContext)();

  masterGain =
    audioContext.createGain();

  masterGain.gain.value = 0.035;

  masterGain.connect(audioContext.destination);


  const drone =
    audioContext.createOscillator();

  const droneGain =
    audioContext.createGain();

  drone.type = "sine";

  drone.frequency.value = 55;

  droneGain.gain.value = 0.12;

  drone.connect(droneGain);

  droneGain.connect(masterGain);

  drone.start();


  const atmosphere =
    audioContext.createOscillator();

  const atmosphereGain =
    audioContext.createGain();

  atmosphere.type = "triangle";

  atmosphere.frequency.value = 110;

  atmosphereGain.gain.value = 0.035;

  atmosphere.connect(atmosphereGain);

  atmosphereGain.connect(masterGain);

  atmosphere.start();


  const lfo =
    audioContext.createOscillator();

  const lfoGain =
    audioContext.createGain();

  lfo.frequency.value = 0.08;

  lfoGain.gain.value = 8;

  lfo.connect(lfoGain);

  lfoGain.connect(atmosphere.frequency);

  lfo.start();
}


/* ---------------------------------------------------------
   ENTRY SOUND
   --------------------------------------------------------- */

function playEntrySound() {

  if (!audioContext) return;

  const now = audioContext.currentTime;

  const notes = [
    130.81,
    196.00,
    261.63,
    392.00,
    523.25
  ];

  notes.forEach((frequency, index) => {

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now + index * 0.08
    );

    gain.gain.setValueAtTime(
      0,
      now + index * 0.08
    );

    gain.gain.linearRampToValueAtTime(
      0.15,
      now + index * 0.08 + 0.025
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + index * 0.08 + 0.6
    );

    oscillator.connect(gain);

    gain.connect(masterGain);

    oscillator.start(
      now + index * 0.08
    );

    oscillator.stop(
      now + index * 0.08 + 0.7
    );

  });

}


/* ---------------------------------------------------------
   ENTER RELAY
   --------------------------------------------------------- */

if (enterButton) {

  enterButton.addEventListener("click", () => {

    startCyberAudio();

    playEntrySound();

    enterButton.style.transform =
      "scale(0.9)";

    bootScreen.classList.add(
      "boot-hidden"
    );

    setTimeout(() => {

      app.classList.add(
        "app-visible"
      );

    }, 300);

  });

}
