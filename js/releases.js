/* ===================================
   People Tracker - Releases Page JavaScript
   =================================== */

const GITHUB_REPO = "sendilb191/people-tracker-pages";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
const TOKEN_STORAGE_KEY = "pt_github_token";

function toggleUploadForm() {
  const form = document.getElementById("upload-form");
  form.classList.toggle("visible");
}

function loadSavedToken() {
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (savedToken) {
    document.getElementById("github-token").value = savedToken;
    document.getElementById("remember-token").checked = true;
  }
}

function saveToken(token) {
  const rememberToken = document.getElementById("remember-token").checked;
  if (rememberToken && token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function clearSavedToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  document.getElementById("github-token").value = "";
  document.getElementById("remember-token").checked = false;
}

async function uploadRelease(event) {
  event.preventDefault();

  const token = document.getElementById("github-token").value;
  const version = document.getElementById("version").value;
  const releaseName = document.getElementById("release-name").value;
  const releaseNotes = document.getElementById("release-notes").value;
  const apkFile = document.getElementById("apk-file").files[0];
  const prerelease = document.getElementById("prerelease").checked;
  const statusEl = document.getElementById("upload-status");
  const uploadBtn = document.getElementById("upload-btn");

  if (!apkFile) {
    showStatus("error", "Please select an APK file");
    return;
  }

  uploadBtn.disabled = true;
  showStatus("loading", "Creating release...");

  try {
    // Step 1: Create the release
    const createResponse = await fetch(GITHUB_API, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag_name: version,
        name: releaseName,
        body: releaseNotes,
        prerelease: prerelease,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || "Failed to create release");
    }

    const release = await createResponse.json();
    showStatus("loading", "Uploading APK file...");

    // Step 2: Upload the APK as an asset
    const uploadUrl = release.upload_url.replace("{?name,label}", "");
    const assetResponse = await fetch(
      `${uploadUrl}?name=${encodeURIComponent(apkFile.name)}`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/vnd.android.package-archive",
        },
        body: apkFile,
      },
    );

    if (!assetResponse.ok) {
      const errorData = await assetResponse.json();
      throw new Error(errorData.message || "Failed to upload APK");
    }

    showStatus("success", `✅ Release ${version} created successfully!`);

    // Save token if remember is checked
    saveToken(token);

    // Reset form and refresh releases
    document.getElementById("release-form").reset();
    // Restore token if saved
    loadSavedToken();
    setTimeout(() => {
      fetchReleases();
      document.getElementById("upload-form").classList.remove("visible");
      statusEl.className = "upload-status";
    }, 2000);
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
  statusEl.textContent = message;
}

async function fetchReleases() {
  const container = document.getElementById("releases-container");

  try {
    const response = await fetch(GITHUB_API);

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const releases = await response.json();

    if (releases.length === 0) {
      container.innerHTML = `
        <div class="no-releases">
          <p>No releases yet.</p>
          <p class="mt-1">Click "Upload New Release" above to create your first release</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="releases-list"></div>';
    const list = container.querySelector(".releases-list");

    releases.forEach((release, index) => {
      const isLatest = index === 0;
      const apkAssets = release.assets.filter((asset) =>
        asset.name.toLowerCase().endsWith(".apk"),
      );

      const releaseDate = new Date(release.published_at).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      const card = document.createElement("div");
      card.className = "release-card";

      let assetsHtml = "";
      if (apkAssets.length > 0) {
        assetsHtml = apkAssets
          .map((asset) => {
            const sizeMB = (asset.size / (1024 * 1024)).toFixed(1);
            return `
              <a href="${asset.browser_download_url}" class="btn btn-primary">
                ⬇️ ${asset.name}
                <span class="asset-size">(${sizeMB} MB)</span>
              </a>
            `;
          })
          .join("");
      } else {
        assetsHtml = `
          <a href="${release.html_url}" class="btn btn-secondary" target="_blank">
            View on GitHub
          </a>
        `;
      }

      card.innerHTML = `
        <div class="release-header">
          <div>
            <span class="release-version">${release.name || release.tag_name}</span>
            ${isLatest ? '<span class="release-tag latest">Latest</span>' : ""}
            ${release.prerelease ? '<span class="release-tag">Pre-release</span>' : ""}
          </div>
          <span class="release-date">${releaseDate}</span>
        </div>
        ${release.body ? `<div class="release-notes">${escapeHtml(release.body)}</div>` : ""}
        <div class="release-assets">
          ${assetsHtml}
        </div>
      `;

      list.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to fetch releases:", error);
    container.innerHTML = `
      <div class="error-releases">
        <p>Failed to load releases.</p>
        <p class="mt-1">
          <a href="https://github.com/${GITHUB_REPO}/releases" target="_blank">
            View releases on GitHub →
          </a>
        </p>
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
  loadSavedToken();
});
