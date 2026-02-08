/* ===================================
   People Tracker - Open/Download Page JavaScript
   =================================== */

// Supabase configuration
const SUPABASE_URL = "https://yxfhfyzihzsxnojookwm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmhmeXppaHpzeG5vam9va3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTMwMTksImV4cCI6MjA4MjMyOTAxOX0.ro95fWynSjqiv6BYPRQCalDZOkqqimN_BsdrwFxuyOs";
const STORAGE_BUCKET = "people-tracker-app-apk";

// Fetch APK download URL from Supabase
async function loadApkUrl() {
  const downloadBtn = document.getElementById("download-btn");

  try {
    if (!window.supabase) {
      throw new Error("Supabase not loaded");
    }

    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    );

    // List files in the bucket
    const { data: files, error } = await client.storage
      .from(STORAGE_BUCKET)
      .list();

    if (error) throw error;

    // Find the first APK file
    const apkFile = files?.find((f) => f.name.endsWith(".apk"));

    if (apkFile) {
      const { data: urlData } = client.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(apkFile.name);

      downloadBtn.href = urlData.publicUrl;
      downloadBtn.setAttribute("download", apkFile.name);
      downloadBtn.innerHTML = "📥 Download APK";
    } else {
      downloadBtn.innerHTML = "📥 No APK Available";
      downloadBtn.href = "releases.html";
    }
  } catch (error) {
    console.error("Failed to load APK URL:", error);
    // Fallback to releases page
    downloadBtn.href = "releases.html";
    downloadBtn.innerHTML = "📥 View Releases";
  }
}

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

  // Load APK URL from Supabase
  loadApkUrl();
})();
