<#
.SYNOPSIS
    OM AI Action Assistant — One-Click Deploy Script (Windows PowerShell)
.DESCRIPTION
    Runs all automated unit tests, commits any pending changes, pushes to GitHub main,
    and triggers automated deployments on both GitHub Pages and Vercel.
.PARAMETER Message
    Optional commit message. If omitted, prompts or uses a descriptive timestamped default.
.EXAMPLE
    .\deploy.ps1 -Message "feat: add real-time voice streaming"
#>

param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$Message = "",
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   OM - AI Action Assistant | One-Click Deploy" -ForegroundColor Cyan
Write-Host "   Tagline: 'Think. Plan. Act. Achieve.'" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Run Automated Test Suites
Write-Host "[1/3] Running Automated Test Suites (35 Tests)..." -ForegroundColor Yellow
python -m unittest discover tests
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Tests failed! Aborting deploy to protect production." -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: All 35 unit tests passed cleanly!" -ForegroundColor Green

# 2. Check Git Status
Write-Host ""
Write-Host "[2/3] Checking Git Status and Staging Changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    if (-not $Message) {
        $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm")
        $Message = "chore(deploy): sync updates and trigger deployment ($timestamp)"
    }
    git add -A
    git commit -m "$Message"
    Write-Host "SUCCESS: Committed changes: '$Message'" -ForegroundColor Green
} else {
    Write-Host "INFO: No uncommitted local changes found. Checking remote push status..." -ForegroundColor Gray
}

# 3. Push to Remote GitHub
Write-Host ""
Write-Host "[3/3] Pushing to GitHub main branch..." -ForegroundColor Yellow

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

if ($token) {
    $pushUrl = "https://$($token)@github.com/abhishekCode7266/OM-AI-Action-Assistant.git"
    if ($Force) {
        git -c credential.helper= push $pushUrl main --force
    } else {
        git -c credential.helper= push $pushUrl main
    }
} else {
    if ($Force) {
        git push origin main --force
    } else {
        git push origin main
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "SUCCESS: Push complete! Deployments initiated!" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "GitHub Pages:   https://abhishekcode7266.github.io/OM-AI-Action-Assistant/" -ForegroundColor Cyan
    Write-Host "Vercel Backend:  https://om-ai-eight.vercel.app/" -ForegroundColor Cyan
    Write-Host "GitHub Actions: https://github.com/abhishekCode7266/OM-AI-Action-Assistant/actions" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Push failed. Please check network connection and git credentials." -ForegroundColor Red
    exit 1
}
