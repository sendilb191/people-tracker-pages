/* ===================================
   People Tracker - Releases Page JavaScript
   Supabase Storage Only (No Database)
   =================================== */

// Supabase configuration
const SUPABASE_URL = "https://yxfhfyzihzsxnojookwm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmhmeXppaHpzeG5vam9va3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTMwMTksImV4cCI6MjA4MjMyOTAxOX0.ro95fWynSjqiv6BYPRQCalDZOkqqimN_BsdrwFxuyOs";
const STORAGE_BUCKET = "people-tracker-app-apk";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Lazy-initialize Supabase client (waits for CDN to load)
let _supabase = null;
function getSupabase() {
  if (!_supabase && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// UI Functions (always available)
function toggleUploadForm() {
  const form = document.getElementById("upload-form");
  form.classList.toggle("visible");
}

async function uploadRelease(event) {
  event.preventDefault();

  const apkFile = document.getElementById("apk-file").files[0];
  const uploadBtn = document.getElementById("upload-btn");

  if (!apkFile) {
    showStatus("error", "❌ Please select an APK file");
    return;
  }

  // Check file size
  if (apkFile.size > MAX_FILE_SIZE) {
    showStatus("error", "❌ APK file must be less than 100MB");
    return;
  }

  uploadBtn.disabled = true;
  showStatus("loading", "Deleting old APK...");

  try {
    const client = getSupabase();
    if (!client) {
      throw new Error("Supabase not loaded. Please refresh the page.");
    }

    // List all existing files in the bucket
    const { data: existingFiles, error: listError } = await client.storage
      .from(STORAGE_BUCKET)
      .list();

    if (listError) {
      console.warn("Could not list files:", listError.message);
    }

    // Delete all existing APK files
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((f) => f.name);
      const { error: deleteError } = await client.storage
        .from(STORAGE_BUCKET)
        .remove(filesToDelete);

      if (deleteError) {
        console.warn("Could not delete old files:", deleteError.message);
      }
    }

    showStatus("loading", "Uploading new APK...");

    // Upload new APK
    const fileName = apkFile.name;
    const { data: uploadData, error: uploadError } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, apkFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    showStatus("success", "✅ APK uploaded successfully!");

    // Reset form
    document.getElementById("apk-file").value = "";

    // Refresh releases
    fetchReleases();
  } catch (error) {
    console.error("Upload failed:", error);
    showStatus("error", `❌ ${error.message}`);
  } finally {
    uploadBtn.disabled = false;
  }
}

function showStatus(type, message) {
  const statusEl = document.getElementById("upload-status");
  statusEl.className = `upload-status visible status status-${type}`;
  statusEl.innerHTML = message;
}

async function fetchReleases() {
  const container = document.getElementById("releases-container");

  try {
    const client = getSupabase();
    if (!client) {
      throw new Error("Supabase not loaded yet. Please refresh the page.");
    }

    // List files from Supabase Storage
    const { data: files, error } = await client.storage
      .from(STORAGE_BUCKET)
      .list();

    if (error) {
      throw new Error(error.message);
    }

    // Filter for APK files only
    const apkFiles = files ? files.filter((f) => f.name.endsWith(".apk")) : [];

    if (apkFiles.length === 0) {
      container.innerHTML = `
        <div class="no-releases">
          <p>No releases yet.</p>
          <p class="mt-1">Click "Upload New Release" above to upload an APK</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="releases-list"></div>';
    const list = container.querySelector(".releases-list");

    apkFiles.forEach((file, index) => {
      const isLatest = index === 0;

      // Get public URL
      const { data: urlData } = client.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(file.name);

      const releaseDate = file.updated_at
        ? new Date(file.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Unknown date";

      const sizeMB = file.metadata?.size
        ? (file.metadata.size / (1024 * 1024)).toFixed(1)
        : "?";

      const card = document.createElement("div");
      card.className = "release-card";

      card.innerHTML = `
        <div class="release-header">
          <div>
            <span class="release-version">${file.name}</span>
            ${isLatest ? '<span class="release-tag latest">Latest</span>' : ""}
          </div>
          <span class="release-date">${releaseDate}</span>
        </div>
        <div class="release-assets">
          <a href="${urlData.publicUrl}" class="btn btn-primary" download>
            ⬇️ Download APK
            ${sizeMB !== "?" ? `<span class="asset-size">(${sizeMB} MB)</span>` : ""}
          </a>
        </div>
      `;

      list.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to fetch releases:", error);
    container.innerHTML = `
      <div class="error-releases">
        <p>Failed to load releases.</p>
        <p class="mt-1">${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchReleases();
});
