$ErrorActionPreference = "Continue"

$projectPath = "D:\NOVA\nova-store"
$intervalSeconds = 10

Set-Location $projectPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " NOVA AUTO GIT PUSH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Watching: $projectPath" -ForegroundColor Gray
Write-Host "Checking every $intervalSeconds seconds..." -ForegroundColor Gray
Write-Host "Press CTRL+C to stop." -ForegroundColor Yellow
Write-Host ""

$lastHash = ""

while ($true) {
    try {
        $status = git status --porcelain 2>$null
        $currentHash = ($status -join "`n")

        if ($currentHash -ne $lastHash) {
            $lastHash = $currentHash

            if ($currentHash.Trim() -ne "") {
                Write-Host ""
                Write-Host "Changes detected..." -ForegroundColor Yellow

                git add .

                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $commitMessage = "Auto update $timestamp"

                git commit -m $commitMessage

                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Commit created." -ForegroundColor Green

                    git push

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "GitHub updated successfully." -ForegroundColor Green
                    }
                    else {
                        Write-Host "GitHub push failed. Will retry." -ForegroundColor Red
                    }
                }
                else {
                    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
                }
            }
        }
    }
    catch {
        Write-Host "Auto Git error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Start-Sleep -Seconds $intervalSeconds
}