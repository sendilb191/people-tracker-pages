/* ===================================
   People Tracker - Open/Download Page JavaScript
   =================================== */

(function () {
  const deepLink = "peopletracker://open";
  const timeout = 2500; // Time to wait before showing fallback

  // Track if page becomes hidden (app opened successfully)
  let appOpened = false;

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      appOpened = true;
    }
  });

  // Also track blur event as backup
  window.addEventListener("blur", function () {
    appOpened = true;
  });

  // Try to open the app
  const start = Date.now();

  // Use an iframe to attempt the deep link (less disruptive)
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = deepLink;
  document.body.appendChild(iframe);

  // Also try direct navigation as backup
  setTimeout(function () {
    window.location.href = deepLink;
  }, 100);

  // After timeout, show fallback if app didn't open
  setTimeout(function () {
    // Clean up iframe
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    // If app didn't open and we're still on this page
    if (!appOpened && !document.hidden) {
      document.getElementById("loading-state").style.display = "none";
      document.getElementById("fallback-state").style.display = "block";
    }
  }, timeout);
})();
