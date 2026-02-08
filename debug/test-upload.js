// Test script for Supabase APK upload functionality
// Usage: node debug/test-upload.js (run from project root)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || "people-tracker-app-apk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listFiles() {
  console.log("\n📂 Listing files in bucket...");
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list();

  if (error) {
    console.error("❌ Error listing files:", error.message);
    console.error("   Full error:", JSON.stringify(error, null, 2));
    return [];
  }

  if (data.length === 0) {
    console.log("   (empty bucket)");
  } else {
    data.forEach((f) => console.log(`   - ${f.name}`));
  }
  return data;
}

async function deleteAllFiles() {
  console.log("\n🗑️  Deleting all existing files...");
  const { data: files, error: listError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list();

  if (listError) {
    console.error("❌ Error listing files:", listError.message);
    return false;
  }

  if (files.length === 0) {
    console.log("   No files to delete");
    return true;
  }

  const filesToDelete = files.map((f) => f.name);
  const { error: deleteError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(filesToDelete);

  if (deleteError) {
    console.error("❌ Error deleting files:", deleteError.message);
    return false;
  }

  console.log(`   ✅ Deleted ${filesToDelete.length} file(s)`);
  return true;
}

async function uploadTestFile(filename) {
  console.log(`\n📤 Uploading test file: ${filename}...`);

  // Create a small test file content
  const content = Buffer.from(`Test APK content - ${new Date().toISOString()}`);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, content, {
      contentType: "application/vnd.android.package-archive",
      upsert: true,
    });

  if (error) {
    console.error("❌ Upload error:", error.message);
    console.error("   Full error:", JSON.stringify(error, null, 2));
    return false;
  }

  console.log("   ✅ Upload successful:", data.path);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filename);

  console.log("   🔗 Public URL:", urlData.publicUrl);
  return true;
}

async function runTest() {
  console.log("=".repeat(50));
  console.log("Supabase Storage Upload Test");
  console.log("Bucket:", STORAGE_BUCKET);
  console.log("URL:", SUPABASE_URL);
  console.log("=".repeat(50));

  // Test connectivity first
  console.log("\n🔌 Testing Supabase connectivity...");
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`);
    console.log("   ✅ Connected! Status:", response.status);
  } catch (e) {
    console.error("   ❌ Cannot reach Supabase:", e.message);
    return;
  }

  // Step 1: List current files
  await listFiles();

  // Step 2: Upload first test file
  const success1 = await uploadTestFile("test-v1.apk");
  if (!success1) {
    console.log("\n❌ Test failed - could not upload first file");
    return;
  }

  // Step 3: List files after first upload
  await listFiles();

  // Step 4: Delete all files (simulating the "replace old" behavior)
  await deleteAllFiles();

  // Step 5: Upload second test file
  const success2 = await uploadTestFile("test-v2.apk");
  if (!success2) {
    console.log("\n❌ Test failed - could not upload second file");
    return;
  }

  // Step 6: List files after second upload
  const finalFiles = await listFiles();

  // Step 7: Verify only one file exists
  console.log("\n" + "=".repeat(50));
  if (finalFiles.length === 1 && finalFiles[0].name === "test-v2.apk") {
    console.log("✅ TEST PASSED!");
    console.log("   - Old file was deleted");
    console.log("   - New file was uploaded successfully");
  } else {
    console.log("❌ TEST FAILED!");
    console.log("   Expected: 1 file (test-v2.apk)");
    console.log("   Got:", finalFiles.length, "file(s)");
  }
  console.log("=".repeat(50));

  // Cleanup - remove test file
  console.log("\n🧹 Cleaning up test file...");
  await supabase.storage.from(STORAGE_BUCKET).remove(["test-v2.apk"]);
  console.log("   Done!");
}

runTest().catch(console.error);
