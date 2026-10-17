const clock = document.getElementById("clock");

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function tick() {
  const now = new Date();
  let hours = now.getHours();
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  clock.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}  ${hours}:${minutes} ${suffix}`;
  clock.dateTime = now.toISOString();
}

tick();
setInterval(tick, 10000);

let layer = 30;
const windows = [...document.querySelectorAll(".os-window, .window")];

function windowName(windowEl) {
  return (
    windowEl.querySelector(".window-bar h2, .titlebar h2")?.textContent.trim() ||
    "window"
  );
}

function setWindowState(windowEl, nextState) {
  const name = windowName(windowEl);
  windowEl.classList.remove("is-minimized", "is-maximized", "is-closed");
  windowEl.dataset.windowState = nextState;

  if (nextState !== "normal") {
    windowEl.classList.add(`is-${nextState}`);
  }

  const minimize = windowEl.querySelector(".mac-minimize");
  const maximize = windowEl.querySelector(".mac-maximize");

  if (minimize) {
    minimize.setAttribute(
      "aria-label",
      nextState === "minimized" ? `Restore ${name}` : `Minimize ${name}`
    );
  }

  if (maximize) {
    maximize.setAttribute(
      "aria-label",
      nextState === "maximized" ? `Restore ${name}` : `Maximize ${name}`
    );
  }
}

windows.forEach((windowEl) => {
  setWindowState(windowEl, "normal");

  windowEl.addEventListener("mousedown", () => {
    if (windowEl.dataset.windowState !== "normal") return;
    layer += 1;
    windowEl.style.zIndex = String(layer);
  });
});

document.querySelectorAll(".mac-control").forEach((control) => {
  control.addEventListener("click", (event) => {
    event.stopPropagation();
    const windowEl = control.closest(".os-window, .window");
    if (!windowEl) return;
    const currentState = windowEl.dataset.windowState || "normal";

    if (control.classList.contains("mac-close")) {
      setWindowState(windowEl, "closed");
      return;
    }

    if (control.classList.contains("mac-minimize")) {
      setWindowState(
        windowEl,
        currentState === "minimized" ? "normal" : "minimized"
      );
      return;
    }

    if (control.classList.contains("mac-maximize")) {
      if (currentState !== "maximized") {
        windows
          .filter(
            (candidate) =>
              candidate !== windowEl &&
              candidate.dataset.windowState === "maximized"
          )
          .forEach((candidate) => setWindowState(candidate, "normal"));
      }

      setWindowState(
        windowEl,
        currentState === "maximized" ? "normal" : "maximized"
      );
    }
  });
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  windows.forEach((windowEl) => setWindowState(windowEl, "normal"));
});
