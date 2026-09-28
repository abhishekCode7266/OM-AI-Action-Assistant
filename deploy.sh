#!/usr/bin/env bash
# =====================================================
# OM – AI Action Assistant | One-Click Deploy (macOS/Linux)
# Tagline: "Think. Plan. Act. Achieve."
# =====================================================

set -e

echo "====================================================="
echo "   OM – AI Action Assistant | One-Click Deploy"
echo "   Tagline: 'Think. Plan. Act. Achieve.'"
echo "====================================================="
echo ""

# 1. Run Automated Test Suites
echo "▶ Step 1/3: Running Automated Test Suites (35 Tests)..."
python3 -m unittest discover tests || python -m unittest discover tests
echo "✔ All unit tests passed cleanly!"
echo ""

# 2. Check Git Status & Stage Changes
echo "▶ Step 2/3: Checking Git Status & Staging Changes..."
STATUS=$(git status --porcelain)
MESSAGE="$1"

if [ -n "$STATUS" ]; then
  if [ -z "$MESSAGE" ]; then
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
    MESSAGE="chore(deploy): sync updates and trigger deployment ($TIMESTAMP)"
  fi
  git add -A
  git commit -m "$MESSAGE"
  echo "✔ Committed changes: '$MESSAGE'"
else
  echo "ℹ No uncommitted local changes found."
fi
echo ""

# 3. Push to Remote GitHub
echo "▶ Step 3/3: Pushing to GitHub main branch..."
git push origin main

echo ""
echo "====================================================="
echo "🎉 SUCCESS: Push complete! Deployments initiated!"
echo "====================================================="
echo "🌐 GitHub Pages:   https://abhishekcode7266.github.io/OM-AI-Action-Assistant/"
echo "▲ Vercel Backend:  https://om-ai-eight.vercel.app/"
echo "⚡ GitHub Actions: https://github.com/abhishekCode7266/OM-AI-Action-Assistant/actions"
