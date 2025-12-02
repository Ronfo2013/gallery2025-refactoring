#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Building frontend"
npm run build

echo "☁️ Deploying storage rules"
firebase deploy --only storage --project gallery-app-972f9

echo "📜 Deploying Firestore rules"
firebase deploy --only firestore:rules --project gallery-app-972f9

echo "⚙️ Deploying Cloud Functions"
firebase deploy --only functions --project gallery-app-972f9

echo "🌐 Deploying Hosting"
firebase deploy --only hosting --project gallery-app-972f9

echo "✅ Full deploy complete"
