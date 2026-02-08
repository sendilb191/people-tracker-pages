# Deploy script for People Tracker Pages
# Updates deployment timestamp and pushes to GitHub

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$timestampText = "Deployed: $timestamp UTC"

# Update timestamp in all HTML files
$htmlFiles = @("index.html", "docs.html", "open.html", "releases.html")

foreach ($file in $htmlFiles) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'Deployed: \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC', $timestampText
    Set-Content $file $content -NoNewline
}

Write-Host "Updated deployment timestamp to: $timestampText" -ForegroundColor Green

# Git commands
git add .
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy: $timestamp"
}

git commit -m $commitMessage
git push origin main

Write-Host "Deployed successfully!" -ForegroundColor Green
