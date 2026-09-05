#!/usr/bin/env bash
set -e

echo "======================================================================"
echo " ReflectAI: Purging Git History (Option 2 - Clean Branch Reset) "
echo "======================================================================"

# Check if inside git repository
if [ ! -d ".git" ]; then
  echo "❌ Error: Please run this script from inside your cloned AI-journal directory on your machine."
  exit 1
fi

echo "1/5 Creating a clean, history-free orphan branch..."
git checkout --orphan clean_main

echo "2/5 Ensuring firebase-applet-config.json is removed from git tracking..."
git rm -f firebase-applet-config.json 2>/dev/null || true

echo "3/5 Staging all clean files (protected by .gitignore)..."
git add -A

echo "4/5 Creating fresh initial commit..."
git commit -m "feat: ReflectAI production release (clean history)"

echo "5/5 Replacing main branch and force-pushing to GitHub..."
git branch -D main 2>/dev/null || git branch -D master 2>/dev/null || true
git branch -m main

git push -f origin main

echo ""
echo "✅ SUCCESS! The old commit history has been replaced with a clean single commit."
echo "✅ firebase-applet-config.json has been completely removed from all past commits."
echo "======================================================================"
