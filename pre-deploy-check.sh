#!/bin/bash

# 🚀 PRE-DEPLOY VALIDATION SCRIPT
# Verifica che tutto sia pronto prima del deploy su Google Cloud

echo "🔍 =========================================="
echo "🔍 PRE-DEPLOY VALIDATION CHECK"
echo "🔍 =========================================="
echo ""

ERRORS=0
WARNINGS=0

# ==========================================
# 1. Verifica .env.production
# ==========================================
echo "📝 [1/8] Checking .env.production..."
if [ -f .env.production ]; then
    echo "   ✅ .env.production exists"
    
    # Verifica che contenga le variabili necessarie
    if grep -q "VITE_FIREBASE_API_KEY" .env.production && \
       grep -q "VITE_FIREBASE_PROJECT_ID" .env.production && \
       grep -q "VITE_FIREBASE_STORAGE_BUCKET" .env.production; then
        echo "   ✅ .env.production contains Firebase config"
    else
        echo "   ⚠️  WARNING: .env.production might be missing Firebase variables"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo "   ❌ ERROR: .env.production NOT FOUND!"
    echo "   Deploy will FAIL without this file!"
    ERRORS=$((ERRORS+1))
fi
echo ""

# ==========================================
# 2. Verifica build frontend
# ==========================================
echo "🏗️  [2/8] Testing frontend build..."
if npm run build > /tmp/build-test.log 2>&1; then
    echo "   ✅ Frontend builds successfully"
else
    echo "   ❌ ERROR: Frontend build FAILED!"
    echo "   Check log: /tmp/build-test.log"
    ERRORS=$((ERRORS+1))
fi
echo ""

# ==========================================
# 3. Verifica dist/ directory
# ==========================================
echo "📁 [3/8] Checking dist/ directory..."
if [ -d dist ]; then
    echo "   ✅ dist/ directory exists"
    
    # Verifica index.html
    if [ -f dist/index.html ]; then
        echo "   ✅ dist/index.html exists"
        
        # Verifica che contenga il riferimento corretto agli assets
        if grep -q "assets/main-" dist/index.html; then
            echo "   ✅ dist/index.html has correct script reference"
        else
            echo "   ⚠️  WARNING: dist/index.html might have wrong script reference"
            WARNINGS=$((WARNINGS+1))
        fi
    else
        echo "   ❌ ERROR: dist/index.html NOT FOUND!"
        ERRORS=$((ERRORS+1))
    fi
else
    echo "   ❌ ERROR: dist/ directory NOT FOUND!"
    ERRORS=$((ERRORS+1))
fi
echo ""

# ==========================================
# 4. Verifica server files
# ==========================================
echo "🖥️  [4/8] Checking server files..."
if [ -f server/server.js ]; then
    echo "   ✅ server/server.js exists"
else
    echo "   ❌ ERROR: server/server.js NOT FOUND!"
    ERRORS=$((ERRORS+1))
fi

if [ -f server/package.json ]; then
    echo "   ✅ server/package.json exists"
else
    echo "   ⚠️  WARNING: server/package.json NOT FOUND!"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# ==========================================
# 5. Verifica Dockerfile
# ==========================================
echo "🐳 [5/8] Checking Dockerfile..."
if [ -f Dockerfile.optimized ]; then
    echo "   ✅ Dockerfile.optimized exists"
else
    echo "   ⚠️  WARNING: Dockerfile.optimized NOT FOUND!"
    WARNINGS=$((WARNINGS+1))
fi

if [ -f Dockerfile ]; then
    echo "   ✅ Dockerfile exists"
else
    echo "   ⚠️  WARNING: Dockerfile NOT FOUND!"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# ==========================================
# 6. Verifica cloudbuild.yaml
# ==========================================
echo "☁️  [6/8] Checking cloudbuild.yaml..."
if [ -f cloudbuild.yaml ]; then
    echo "   ✅ cloudbuild.yaml exists"
    
    # Verifica che usi Dockerfile.optimized
    if grep -q "Dockerfile.optimized" cloudbuild.yaml; then
        echo "   ✅ cloudbuild.yaml uses Dockerfile.optimized"
    else
        echo "   ⚠️  WARNING: cloudbuild.yaml might not use Dockerfile.optimized"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo "   ❌ ERROR: cloudbuild.yaml NOT FOUND!"
    ERRORS=$((ERRORS+1))
fi
echo ""

# ==========================================
# 7. Verifica Google Cloud CLI
# ==========================================
echo "🌐 [7/8] Checking Google Cloud CLI..."
if command -v gcloud &> /dev/null; then
    echo "   ✅ gcloud CLI installed"
    
    # Verifica progetto attivo
    PROJECT=$(gcloud config get-value project 2>/dev/null)
    if [ -n "$PROJECT" ]; then
        echo "   ✅ Active project: $PROJECT"
    else
        echo "   ⚠️  WARNING: No active GCloud project"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo "   ❌ ERROR: gcloud CLI NOT INSTALLED!"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    ERRORS=$((ERRORS+1))
fi
echo ""

# ==========================================
# 8. Verifica CORS config (opzionale)
# ==========================================
echo "🔧 [8/8] Checking CORS configuration..."
if [ -f cors.json ]; then
    echo "   ✅ cors.json exists"
else
    echo "   ⚠️  WARNING: cors.json NOT FOUND (needed for backup restore)"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "=========================================="
echo "📊 VALIDATION SUMMARY"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ ERRORS: 0"
else
    echo "❌ ERRORS: $ERRORS"
fi

if [ $WARNINGS -eq 0 ]; then
    echo "✅ WARNINGS: 0"
else
    echo "⚠️  WARNINGS: $WARNINGS"
fi

echo ""

# ==========================================
# FINAL VERDICT
# ==========================================
if [ $ERRORS -eq 0 ]; then
    echo "🎉 =========================================="
    echo "🎉 READY TO DEPLOY!"
    echo "🎉 =========================================="
    echo ""
    echo "Run this command to deploy:"
    echo ""
    echo "  gcloud builds submit --config=cloudbuild.yaml"
    echo ""
    exit 0
else
    echo "🚨 =========================================="
    echo "🚨 NOT READY TO DEPLOY!"
    echo "🚨 =========================================="
    echo ""
    echo "Please fix the errors above before deploying."
    echo ""
    exit 1
fi

