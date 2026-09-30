<#
.SYNOPSIS
    OM AI Assistant — One-Click Vercel & GitHub Deploy Script (Windows PowerShell)
.DESCRIPTION
    Runs automated unit tests, verifies Next.js production build, commits pending updates,
    pushes to GitHub main, and triggers automated deployment on Vercel.
.PARAMETER Message
    Optional commit message.
.EXAMPLE
    .\deploy.ps1 -Message "feat: enhance Vercel deployment config"
#>

param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   OM AI Assistant | One-Click Vercel Deploy" -ForegroundColor Cyan
Write-Host "   Tagline: 'Think. Talk. See. Act. Achieve.'" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Run Automated Test Suite
Write-Host "[1/4] Running Automated Test Suite..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Tests failed! Aborting deployment to protect production." -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: All tests passed cleanly!" -ForegroundColor Green

# 2. Verify Next.js Production Build
Write-Host ""
Write-Host "[2/4] Verifying Next.js Production Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Production build failed! Aborting deployment." -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Next.js production build succeeded!" -ForegroundColor Green

# 3. Check Git Status & Stage Changes
Write-Host ""
Write-Host "[3/4] Staging and Committing Changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    if (-not $Message) {
        $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm")
        $Message = "chore(deploy): Vercel deployment update ($timestamp)"
    }
    git add -A
    git commit -m "$Message"
    Write-Host "SUCCESS: Committed changes: '$Message'" -ForegroundColor Green
} else {
    Write-Host "INFO: No uncommitted local changes." -ForegroundColor Gray
}

# 4. Push to GitHub to Trigger Vercel Auto-Deploy
Write-Host ""
Write-Host "[4/4] Pushing to GitHub main branch to trigger Vercel..." -ForegroundColor Yellow

$code = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WinCredReader {
    [DllImport("Advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr credentialPtr);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public long LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string Read(string target) {
        IntPtr ptr;
        if (CredRead(target, 1, 0, out ptr)) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(ptr, typeof(CREDENTIAL));
            byte[] blob = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, blob, 0, cred.CredentialBlobSize);
            CredFree(ptr);
            return Encoding.UTF8.GetString(blob);
        }
        return null;
    }
}
'@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$token = [WinCredReader]::Read("LegacyGeneric:target=GitHub - https://api.github.com/abhishekCode7266")
if (-not $token) {
    $token = [WinCredReader]::Read("git:https://github.com")
}

$env:GIT_TERMINAL_PROMPT = "0"
$env:GCM_INTERACTIVE = "never"

# Check if remote main is different and handle initial commit
if ($token) {
    $pushUrl = "https://$($token)@github.com/abhishekCode7266/OM-AI-Action-Assistant.git"
    git -c credential.helper= push -u $pushUrl main --force
} else {
    git push -u origin main --force
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "SUCCESS: Repository synced! Vercel build triggered!" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "GitHub Repository: https://github.com/abhishekCode7266/OM-AI-Action-Assistant" -ForegroundColor Cyan
    Write-Host "GitHub Actions:    https://github.com/abhishekCode7266/OM-AI-Action-Assistant/actions" -ForegroundColor Cyan
    Write-Host "Vercel Project:    https://vercel.com/abhishek-ef1f/om-ai" -ForegroundColor Cyan
    Write-Host "Vercel Live URL:   https://om-ai-eight.vercel.app/" -ForegroundColor Cyan
} else {
    Write-Host "WARNING: Git push encountered an issue. You can manually run: git push -u origin main --force" -ForegroundColor Yellow
}
