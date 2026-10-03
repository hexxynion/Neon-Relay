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

  let audioContext = null;
  let masterGain = null;
  let ambientStarted = false;

  /* =========================================================
     TRANSFORMER ENGINE
  ========================================================= */

  const machine = document.createElement("div");
  machine.id = "machineEngine";

  machine.innerHTML = `
    <div class="machine-scan"></div>

    <div class="machine-frame">
      <div class="machine-panel panel-left"></div>
      <div class="machine-panel panel-right"></div>
      <div class="machine-panel panel-top"></div>
      <div class="machine-panel panel-bottom"></div>

      <div class="machine-core">
        <div class="core-ring core-ring-1"></div>
        <div class="core-ring core-ring-2"></div>
        <div class="core-ring core-ring-3"></div>
        <div class="core-center"></div>
      </div>

      <div class="energy-beam beam-x"></div>
      <div class="energy-beam beam-y"></div>

      <div class="machine-readout">
        <span>NEON RELAY</span>
        <b id="machineState">STANDBY</b>
      </div>
    </div>

    <div class="assembly-lines">
      <i></i><i></i><i></i><i></i>
      <i></i><i></i><i></i><i></i>
    </div>

    <div class="impact-ring"></div>
    <div class="impact-ring impact-2"></div>

    <div class="machine-particles"></div>
  `;

  document.body.appendChild(machine);

  const machineState =
    document.querySelector("#machineState");

  const particleContainer =
    document.querySelector(".machine-particles");

  /* =========================================================
     PARTICLES
  ========================================================= */

  for (let i = 0; i < 70; i++) {
    const p = document.createElement("span");

    p.className = "machine-particle";

    p.style.setProperty("--px", `${Math.random() * 100}vw`);
    p.style.setProperty("--py", `${Math.random() * 100}vh`);
    p.style.setProperty("--delay", `${Math.random() * 2}s`);
    p.style.setProperty("--size", `${1 + Math.random() * 3}px`);

    particleContainer.appendChild(p);
  }

  /* =========================================================
     AUDIO
  ========================================================= */

  function startAudio() {
    if (ambientStarted) return;

    try {
      audioContext =
        new (window.AudioContext ||
          window.webkitAudioContext)();

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.035;
      masterGain.connect(audioContext.destination);

      const drone = audioContext.createOscillator();
      const gain = audioContext.createGain();

      drone.type = "sine";
      drone.frequency.value = 48;
      gain.gain.value = 0.1;

      drone.connect(gain);
      gain.connect(masterGain);
      drone.start();

      ambientStarted = true;
    } catch (e) {
      console.log("Audio unavailable");
    }
  }

  function tone(freq, duration = .2, volume = .1) {
    if (!audioContext || !masterGain) return;

    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      volume,
      now + .015
    );

    gain.gain.exponentialRampToValueAtTime(
      .001,
      now + duration
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + .05);
  }

  /* =========================================================
     MACHINE STATE
  ========================================================= */

  function machineStateSet(state) {
    machine.dataset.state = state;
    document.body.dataset.relayState = state;

    machineState.textContent = state.toUpperCase();

    if (state === "targeting") {
      tone(180, .18, .07);
    }

    if (state === "charging") {
      tone(260, .3, .1);
      setTimeout(() => tone(520, .25, .08), 150);
    }

    if (state === "transmitting") {
      tone(720, .4, .12);
    }

    if (state === "success") {
      tone(440, .2, .12);
      setTimeout(() => tone(660, .3, .12), 100);
      setTimeout(() => tone(880, .45, .1), 220);
    }

    if (state === "failure") {
      tone(90, .4, .15);
    }
  }

  /* =========================================================
     TRANSFORMATION PHASES
  ========================================================= */

  function phaseTarget() {
    machine.classList.remove(
      "transform-charge",
      "transform-transmit",
      "transform-success",
      "transform-failure"
    );

    machine.classList.add("transform-target");

    machineStateSet("targeting");
  }

  function phaseCharge() {
    machine.classList.remove(
      "transform-target",
      "transform-transmit"
    );

    machine.classList.add("transform-charge");

    machineStateSet("charging");
  }

  function phaseTransmit() {
    machine.classList.remove(
      "transform-target",
      "transform-charge"
    );

    machine.classList.add("transform-transmit");

    machineStateSet("transmitting");
  }

  function phaseSuccess() {
    machine.classList.remove(
      "transform-target",
      "transform-charge",
      "transform-transmit"
    );

    machine.classList.add("transform-success");

    machineStateSet("success");

    impact();
  }

  function phaseFailure() {
    machine.classList.remove(
      "transform-target",
      "transform-charge",
      "transform-transmit"
    );

    machine.classList.add("transform-failure");

    machineStateSet("failure");
  }

  function resetMachine() {
    machine.classList.remove(
      "transform-target",
      "transform-charge",
      "transform-transmit",
      "transform-success",
      "transform-failure"
    );

    machineStateSet("standby");
  }

  /* =========================================================
     IMPACT
  ========================================================= */

  function impact() {
    machine.classList.remove("impact");

    void machine.offsetWidth;

    machine.classList.add("impact");

    for (let i = 0; i < 50; i++) {
      const p = document.createElement("span");

      p.className = "impact-particle";

      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 650;

      p.style.setProperty(
        "--x",
        `${Math.cos(angle) * distance}px`
      );

      p.style.setProperty(
        "--y",
        `${Math.sin(angle) * distance}px`
      );

      machine.appendChild(p);

      setTimeout(() => p.remove(), 1100);
    }
  }

  /* =========================================================
     RELAY
  ========================================================= */

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const url = input.value.trim();

      if (!url) {
        input.focus();
        return;
      }

      startAudio();

      if (
        audioContext &&
        audioContext.state === "suspended"
      ) {
        await audioContext.resume();
      }

      /* TARGET ACQUISITION */

      phaseTarget();

      status.textContent =
        "TARGET ACQUISITION // LOCKING";

      await wait(900);

      /* MECHANICAL CHARGE */

      phaseCharge();

      status.textContent =
        "RELAY CORE // CHARGING";

      await wait(1200);

      /* TRANSMISSION */

      phaseTransmit();

      status.textContent =
        "RELAY CHANNEL // TRANSMITTING";

      await wait(350);

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
          throw new Error(
            data.error || "Request failed."
          );
        }

        /* SUCCESS */

        phaseSuccess();

        status.textContent =
          `CONNECTED // HTTP ${data.status}`;

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

        /*
          The result card is deliberately delayed.
          The machine finishes transforming FIRST.
        */

        await wait(420);

        resultCard.classList.remove("hidden");

        resultCard.classList.add(
          "result-materializing"
        );

        setTimeout(() => {
          resultCard.classList.remove(
            "result-materializing"
          );
        }, 1000);

        await wait(2200);

        resetMachine();

      } catch (err) {

        phaseFailure();

        status.textContent =
          err.message ||
          "RELAY FAILURE";

        await wait(1000);

        resetMachine();
      }
    });
  }

  /* =========================================================
     COPY
  ========================================================= */

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(
          resultBody.textContent
        );

        copyBtn.textContent = "COPIED";

        tone(660, .2, .08);

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
     BOOT
  ========================================================= */

  if (enterButton) {
    enterButton.addEventListener("click", async () => {

      if (
        bootScreen.classList.contains("launching")
      ) {
        return;
      }

      startAudio();

      if (
        audioContext &&
        audioContext.state === "suspended"
      ) {
        await audioContext.resume();
      }

      bootScreen.classList.add("launching");

      enterButton.disabled = true;
      enterButton.style.pointerEvents = "none";

      setTimeout(() => {

        bootScreen.classList.add("boot-hidden");

        app.classList.add("app-visible");
        app.classList.add("search-arrival");

        resetMachine();

        console.log(
          "NEON RELAY // MACHINE ONLINE"
        );

      }, 5200);
    });
  }

  function wait(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }

  resetMachine();
});
