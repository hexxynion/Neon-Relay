document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     NEON RELAY // MAIN ELEMENTS
     ========================================================= */

  const form = document.querySelector("#relayForm");
  const input = document.querySelector("#url");
  const status = document.querySelector("#status");
  const resultCard = document.querySelector("#resultCard");
  const resultTitle = document.querySelector("#resultTitle");
  const resultBody = document.querySelector("#resultBody");
  const copyBtn = document.querySelector("#copyBtn");

  const bootScreen = document.querySelector("#bootScreen");
  const enterButton = document.querySelector("#enterButton");
  const app = document.querySelector("#app");


  /* =========================================================
     RELAY SYSTEM
     ========================================================= */

  if (form) {

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

        status.textContent =
          `Connected — HTTP ${data.status}`;

        resultTitle.textContent =
          `HTTP ${data.status}`;

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

        status.textContent =
          err.message || "Request failed.";

      }

    });

  }


  /* =========================================================
     COPY BUTTON
     ========================================================= */

  if (copyBtn) {

    copyBtn.addEventListener("click", async () => {

      try {

        await navigator.clipboard.writeText(
          resultBody.textContent
        );

        copyBtn.textContent = "COPIED";

        setTimeout(() => {
          copyBtn.textContent = "COPY";
        }, 1200);

      } catch {

        copyBtn.textContent = "FAILED";

        setTimeout(() => {
          copyBtn.textContent = "COPY";
        }, 1200);

      }

    });

  }


  /* =========================================================
     CYBER AUDIO
     ========================================================= */

  let audioContext = null;
  let masterGain = null;
  let ambientStarted = false;


  function startCyberAudio() {

    if (ambientStarted) return;

    try {

      audioContext =
        new (window.AudioContext ||
          window.webkitAudioContext)();

      masterGain =
        audioContext.createGain();

      masterGain.gain.value = 0.035;

      masterGain.connect(
        audioContext.destination
      );


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
      lfoGain.connect(
        atmosphere.frequency
      );

      lfo.start();

      ambientStarted = true;

    } catch (error) {

      console.log(
        "Cyber audio unavailable:",
        error
      );

    }

  }


  /* =========================================================
     ENTRY SOUND
     ========================================================= */

  function playEntrySound() {

    if (!audioContext || !masterGain) {
      return;
    }

    const now =
      audioContext.currentTime;

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

      const start =
        now + index * 0.08;

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        frequency,
        start
      );

      gain.gain.setValueAtTime(
        0,
        start
      );

      gain.gain.linearRampToValueAtTime(
        0.15,
        start + 0.025
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        start + 0.6
      );

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(start);
      oscillator.stop(start + 0.7);

    });

  }


  /* =========================================================
     INITIALIZE RELAY
     ========================================================= */

  if (enterButton) {

    enterButton.addEventListener("click", async () => {

      console.log(
        "NEON RELAY: INITIALIZE CLICKED"
      );

      // Prevent double-clicking
      if (
        bootScreen.classList.contains(
          "launching"
        )
      ) {
        return;
      }

      // Start audio
      startCyberAudio();

      if (audioContext &&
          audioContext.state === "suspended") {

        await audioContext.resume();

      }

      playEntrySound();


      // Start cinematic sequence
      bootScreen.classList.add(
        "launching"
      );


      // Button feedback
      enterButton.disabled = true;
      enterButton.style.pointerEvents =
        "none";


      /*
        CINEMATIC TIMELINE

        0s    chains break
        0s    vortex begins
        1.2s  orb disappears
        5s    vortex journey finishes
        5.2s search interface appears
      */

      setTimeout(() => {

        bootScreen.classList.add(
          "boot-hidden"
        );

        app.classList.add(
          "app-visible"
        );

        app.classList.add(
          "search-arrival"
        );

        console.log(
          "NEON RELAY: SYSTEM ONLINE"
        );

      }, 5200);

    });

  } else {

    console.error(
      "NEON RELAY ERROR: enterButton was not found."
    );

  }

});
