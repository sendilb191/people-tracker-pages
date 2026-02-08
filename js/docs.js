/* ===================================
   People Tracker - Documentation Page JavaScript
   =================================== */

async function loadDocs() {
  try {
    const response = await fetch("docs.md");
    const markdown = await response.text();
    document.getElementById("content").innerHTML = marked.parse(markdown);
  } catch (error) {
    document.getElementById("content").innerHTML = `
      <h1>Error Loading Documentation</h1>
      <p>Could not load the documentation. 
        <a href="https://github.com/sendilb191/people-tracker-app-mobile#readme">View on GitHub</a>
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadDocs);
