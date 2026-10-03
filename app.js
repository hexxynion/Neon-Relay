document.addEventListener("DOMContentLoaded", () => {

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
     NEON RELAY // CINEMATIC ENGINE
  ========================================================= */

  let audioContext = null;
  let masterGain = null;
  let ambientStarted = false;

  let currentState = "IDLE";
  let particleTimer = null;

  /* =========================================================
     CREATE CINEMATIC LAYER
  ========================================================= */

  const cinematicLayer = document.createElement("div");
  cinematicLayer.id = "cinematicLayer";

  cinematicLayer.innerHTML = `
    <div class="hud-crosshair">
      <div class="crosshair-ring ring-a"></div>
      <div class="crosshair-ring ring-b"></div>
      <div class="crosshair-center"></div>
      <span class="crosshair-label">TARGET</span>
    </div>

    <div class="hud-corners">
      <span class="hud-corner hc1"></span>
      <span class="hud-corner hc2"></span>
      <span class="hud-corner hc3"></span>
      <span class="hud-corner hc4"></span>
    </div>

    <div class="telemetry">
      <span>CORE_TEMP: <b id="telemetryTemp">27.4</b>°</span>
      <span>POWER: <b id="telemetryPower">018</b>%</span>
      <span>NODE: <b>07</b></span>
      <span>LINK: <b id="telemetryLink">STANDBY</b></span>
    </div>

    <div class="target-lock">
      <div class="target-line"></div>
      <div class="target-bracket bracket-tl"></div>
      <div class="target-bracket bracket-tr"></div>
      <div class="target-bracket bracket-bl"></div>
      <div class="target-bracket bracket-br"></div>
      <span id="targetText">NO TARGET</span>
    </div>

    <div class="energy-burst"></div>
    <div class="screen-flash"></div>

    <div class="particle-field"></div>
  `;

  document.body.appendChild(cinematicLayer);

  const telemetryTemp = document.querySelector("#telemetryTemp");
  const telemetryPower = document.querySelector("#telemetryPower");
  const telemetryLink = document.querySelector("#telemetryLink");
  const targetText = document.querySelector("#targetText");

  /* =========================================================
     PARTICLE SYSTEM
  ========================================================= */

  const particleField = document.querySelector(".particle-field");

  for (let i = 0; i < 90; i++) {

    const particle = document.createElement("span");

    particle.className = "relay-particle";

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    particle.style.animationDelay =
      `${Math.random() * 8}s`;

    particle.style.animationDuration =
      `${5 + Math.random() * 9}s`;

    particle.style.setProperty(
      "--particle-size",
      `${1 + Math.random() * 3}px`
    );

    particleField.appendChild(particle);
  }

  /* =========================================================
     TELEMETRY
  ========================================================= */

  function updateTelemetry(power, link) {

    telemetryPower.textContent =
      String(Math.round(power)).padStart(3, "0");

    telemetryTemp.textContent =
      (27 + power * 0.18 + Math.random() * 2).toFixed(1);

    telemetryLink.textContent = link;
  }

  /* =========================================================
     SYSTEM STATE
  ========================================================= */

  function setState(state) {

    currentState = state;

    document.body.dataset.relayState =
      state.toLowerCase();

    cinematicLayer.dataset.state =
      state.toLowerCase();

    if (state === "IDLE") {
      updateTelemetry(18, "STANDBY");
    }

    if (state === "TARGETING") {
      updateTelemetry(34, "LOCKING");
    }

    if (state === "CHARGING") {
      updateTelemetry(68, "CHARGING");
    }

    if (state === "TRANSMITTING") {
      updateTelemetry(94, "TRANSMIT");
    }

    if (state === "SUCCESS") {
      updateTelemetry(100, "ONLINE");
    }

    if (state === "FAILURE") {
      updateTelemetry(12, "ERROR");
    }
  }

  /* =========================================================
     TARGET SYSTEM
  ========================================================= */

  function lockTarget(url) {

    targetText.textContent =
      "TARGET // " + url.replace(/^https?:\/\//, "").slice(0, 38);

    cinematicLayer.classList.add("target-active");

    setTimeout(() => {
      cinematicLayer.classList.add("target-locked");
    }, 850);
  }

  function clearTarget() {

    cinematicLayer.classList.remove(
      "target-active",
      "target-locked"
    );

    targetText.textContent = "NO TARGET";
  }

  /* =========================================================
     ENERGY BURST
  ========================================================= */

  function energyBurst(type = "success") {

    cinematicLayer.classList.remove(
      "burst-success",
      "burst-error"
    );

    void cinematicLayer.offsetWidth;

    cinematicLayer.classList.add(
      type === "success"
        ? "burst-success"
        : "burst-error"
    );
  }

  /* =========================================================
     CYBER AUDIO
  ========================================================= */

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
      lfoGain.connect(atmosphere.frequency);

      lfo.start();

      ambientStarted = true;

    } catch (error) {

      console.log(
        "Cyber audio unavailable:",
        error
      );
    }
  }

  function playTone(
    frequency,
    duration = 0.25,
    volume = 0.12
  ) {

    if (!audioContext || !masterGain) return;

    const now =
      audioContext.currentTime;

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    gain.gain.setValueAtTime(
      0,
      now
    );

    gain.gain.linearRampToValueAtTime(
      volume,
      now + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  function playEntrySound() {

    [
      130.81,
      196.00,
      261.63,
      392.00,
      523.25
    ].forEach((frequency, index) => {

      setTimeout(() => {
        playTone(
          frequency,
          .6,
          .14
        );
      }, index * 80);

    });
  }

  function playLockSound() {

    playTone(220, .15, .08);

    setTimeout(() => {
      playTone(440, .18, .1);
    }, 100);

  }

  function playSuccessSound() {

    [
      261.63,
      329.63,
      392,
      523.25,
      659.25
    ].forEach((frequency, index) => {

      setTimeout(() => {
        playTone(
          frequency,
          .55,
          .12
        );
      }, index * 65);

    });
  }

  function playErrorSound() {

    playTone(110, .4, .15);

    setTimeout(() => {
      playTone(82.41, .5, .12);
    }, 180);

  }

  /* =========================================================
     PARTICLE BURST
  ========================================================= */

  function particleExplosion() {

    for (let i = 0; i < 35; i++) {

      const particle =
        document.createElement("span");

      particle.className =
        "burst-particle";

      const angle =
        Math.random() * Math.PI * 2;

      const distance =
        150 + Math.random() * 450;

      particle.style.setProperty(
        "--x",
        `${Math.cos(angle) * distance}px`
      );

      particle.style.setProperty(
        "--y",
        `${Math.sin(angle) * distance}px`
      );

      particleField.appendChild(
        particle
      );

      setTimeout(() => {
        particle.remove();
      }, 1200);
    }
  }

  /* =========================================================
     RELAY REQUEST
  ========================================================= */

  if (form) {

    form.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const url =
          input.value.trim();

        if (!url) return;

        startCyberAudio();

        if (
          audioContext &&
          audioContext.state === "suspended"
        ) {
          await audioContext.resume();
        }

        /* TARGETING */

        setState("TARGETING");

        status.textContent =
          "Acquiring destination...";

        lockTarget(url);

        playLockSound();

        await wait(850);

        /* CHARGING */

        setState("CHARGING");

        status.textContent =
          "Charging relay core...";

        await wait(950);

        /* TRANSMITTING */

        setState("TRANSMITTING");

        status.textContent =
          "Opening secure channel...";

        try {

          const response =
            await fetch(
              "/api/fetch",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                  url
                })
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
              "Request failed."
            );
          }

          /* SUCCESS */

          setState("SUCCESS");

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

          resultCard.classList.remove(
            "hidden"
          );

          energyBurst("success");
          particleExplosion();
          playSuccessSound();

          await wait(1800);

          cinematicLayer.classList.remove(
            "target-active",
            "target-locked"
          );

        } catch (err) {

          setState("FAILURE");

          status.textContent =
            err.message ||
            "Request failed.";

          energyBurst("error");
          particleExplosion();
          playErrorSound();

          await wait(1200);

          setState("IDLE");
          clearTarget();
        }

      }
    );
  }

  /* =========================================================
     COPY
  ========================================================= */

  if (copyBtn) {

    copyBtn.addEventListener(
      "click",
      async () => {

        try {

          await navigator.clipboard.writeText(
            resultBody.textContent
          );

          copyBtn.textContent =
            "COPIED";

          playTone(
            660,
            .25,
            .08
          );

          setTimeout(() => {
            copyBtn.textContent =
              "COPY";
          }, 1200);

        } catch {

          copyBtn.textContent =
            "FAILED";

          setTimeout(() => {
            copyBtn.textContent =
              "COPY";
          }, 1200);
        }

      }
    );
  }

  /* =========================================================
     BOOT SEQUENCE
  ========================================================= */

  if (enterButton) {

    enterButton.addEventListener(
      "click",
      async () => {

        if (
          bootScreen.classList.contains(
            "launching"
          )
        ) {
          return;
        }

        startCyberAudio();

        if (
          audioContext &&
          audioContext.state === "suspended"
        ) {
          await audioContext.resume();
        }

        playEntrySound();

        bootScreen.classList.add(
          "launching"
        );

        enterButton.disabled = true;
        enterButton.style.pointerEvents =
          "none";

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

          setState("IDLE");

          console.log(
            "NEON RELAY // SYSTEM ONLINE"
          );

        }, 5200);

      }
    );

  }

  /* =========================================================
     UTILITY
  ========================================================= */

  function wait(ms) {

    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );

  }

  /* =========================================================
     INITIAL STATE
  ========================================================= */

  setState("IDLE");

});
