/* =========================================================
   NEON RELAY — OVERDRIVE ENGINE
   Transformer-style machine interaction layer
   ========================================================= */

(() => {
  "use strict";

  const root = document.documentElement;
  const app = document.querySelector("#app");
  const form = document.querySelector("#relayForm");
  const input = document.querySelector("#url");
  const resultCard = document.querySelector("#resultCard");
  const status = document.querySelector("#status");
  const searchCore = document.querySelector(".search-target");

  if (!app) return;

  /* ---------------------------------------------------------
     MACHINE STATE
     --------------------------------------------------------- */

  const STATES = {
    IDLE: "machine-idle",
    TARGETING: "machine-targeting",
    CHARGING: "machine-charging",
    TRANSMITTING: "machine-transmitting",
    SUCCESS: "machine-success",
    FAILURE: "machine-failure"
  };

  function machineState(state) {
    Object.values(STATES).forEach(cls => {
      document.body.classList.remove(cls);
      app.classList.remove(cls);
    });

    if (!state) return;

    document.body.classList.add(state);
    app.classList.add(state);
  }

  /* ---------------------------------------------------------
     CURSOR REACTOR
     --------------------------------------------------------- */

  let mouseX = 50;
  let mouseY = 50;

  window.addEventListener("pointermove", event => {
    mouseX = (event.clientX / window.innerWidth) * 100;
    mouseY = (event.clientY / window.innerHeight) * 100;

    root.style.setProperty("--mx", `${mouseX}%`);
    root.style.setProperty("--my", `${mouseY}%`);

    const tiltX = ((mouseY - 50) / 50) * -1.8;
    const tiltY = ((mouseX - 50) / 50) * 1.8;

    root.style.setProperty("--machine-x", `${tiltX}deg`);
    root.style.setProperty("--machine-y", `${tiltY}deg`);
  });

  /* ---------------------------------------------------------
     URL TARGETING
     --------------------------------------------------------- */

  if (input) {
    input.addEventListener("focus", () => {
      machineState(STATES.TARGETING);
    });

    input.addEventListener("blur", () => {
      if (!input.value.trim()) {
        machineState(STATES.IDLE);
      }
    });

    input.addEventListener("input", () => {
      if (input.value.trim()) {
        machineState(STATES.TARGETING);
      }
    });
  }

  /* ---------------------------------------------------------
     TRANSMISSION SEQUENCE
     --------------------------------------------------------- */

  if (form) {
    form.addEventListener(
      "submit",
      () => {
        machineState(STATES.TARGETING);

        setTimeout(() => {
          machineState(STATES.CHARGING);
        }, 900);

        setTimeout(() => {
          machineState(STATES.TRANSMITTING);
        }, 2000);

        setTimeout(() => {
          if (
            status &&
            /error|failed|invalid|blocked|denied/i.test(status.textContent)
          ) {
            machineState(STATES.FAILURE);
          }
        }, 3000);
      },
      true
    );
  }

  /* ---------------------------------------------------------
     RESULT DETECTION
     --------------------------------------------------------- */

  if (resultCard) {
    const observer = new MutationObserver(() => {
      const text = resultCard.textContent || "";

      if (
        resultCard.classList.contains("visible") ||
        resultCard.classList.contains("show") ||
        text.trim().length > 20
      ) {
        machineState(STATES.SUCCESS);

        setTimeout(() => {
          if (
            !status ||
            !/error|failed|invalid|blocked|denied/i.test(
              status.textContent || ""
            )
          ) {
            machineState(STATES.SUCCESS);
          }
        }, 100);
      }
    });

    observer.observe(resultCard, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  /* ---------------------------------------------------------
     FAILURE DETECTION
     --------------------------------------------------------- */

  if (status) {
    const statusObserver = new MutationObserver(() => {
      const text = status.textContent || "";

      if (/error|failed|invalid|blocked|denied/i.test(text)) {
        machineState(STATES.FAILURE);

        setTimeout(() => {
          machineState(STATES.IDLE);
        }, 3500);
      }
    });

    statusObserver.observe(status, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  /* ---------------------------------------------------------
     SEARCH MACHINE
     --------------------------------------------------------- */

  if (searchCore) {
    searchCore.addEventListener("mouseenter", () => {
      app.classList.add("search-machine-active");
    });

    searchCore.addEventListener("mouseleave", () => {
      app.classList.remove("search-machine-active");
    });

    searchCore.addEventListener("focusin", () => {
      app.classList.add("search-machine-active");
    });

    searchCore.addEventListener("focusout", () => {
      app.classList.remove("search-machine-active");
    });
  }

  /* ---------------------------------------------------------
     KEYBOARD COMMANDS
     --------------------------------------------------------- */

  document.addEventListener("keydown", event => {
    /*
      Press "/" to instantly acquire the relay target.
    */
    if (
      event.key === "/" &&
      document.activeElement !== input &&
      input
    ) {
      event.preventDefault();
      input.focus();
      machineState(STATES.TARGETING);
    }

    /*
      Escape returns the machine to standby.
    */
    if (event.key === "Escape") {
      machineState(STATES.IDLE);
      app.classList.remove("search-machine-active");

      if (input && document.activeElement === input) {
        input.blur();
      }
    }
  });

  /* ---------------------------------------------------------
     LIVE TELEMETRY CLOCK
     --------------------------------------------------------- */

  function updateTelemetry() {
    const now = new Date();

    const time =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0") +
      ":" +
      now.getSeconds().toString().padStart(2, "0");

    document
      .querySelectorAll("[data-telemetry-time]")
      .forEach(element => {
        element.textContent = time;
      });
  }

  updateTelemetry();
  setInterval(updateTelemetry, 1000);

  /* ---------------------------------------------------------
     INITIAL STATE
     --------------------------------------------------------- */

  machineState(STATES.IDLE);

  console.log(
    "%c NEON RELAY // OVERDRIVE ONLINE ",
    "background:#05080d;color:#00eaff;font-weight:bold;padding:8px 14px;border:1px solid #00eaff;"
  );

})();
