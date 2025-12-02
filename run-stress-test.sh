#!/bin/bash

# Stress Test Runner - Gallery2025
# Gestisce automaticamente il progetto corretto

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        🧪 STRESS TEST RUNNER - Gallery2025                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Forza progetto corretto (tutte le varianti)
export GCLOUD_PROJECT=gallery-app-972f9
export GOOGLE_CLOUD_PROJECT=gallery-app-972f9
export GCP_PROJECT=gallery-app-972f9
export FIREBASE_PROJECT_ID=gallery-app-972f9

# Verifica autenticazione
echo "🔍 Verifica autenticazione..."
if ! gcloud auth application-default print-access-token &>/dev/null; then
    echo "❌ Autenticazione non valida o scaduta"
    echo ""
    echo "Esegui:"
    echo "  gcloud auth application-default login"
    echo ""
    exit 1
fi

echo "✅ Autenticazione OK"
echo ""

# Esegui test
echo "🚀 Avvio stress test..."
echo ""
node test-system-stress.cjs

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Test completato con successo!"
else
    echo ""
    echo "⚠️  Test completato con alcuni errori (vedi sopra)"
fi

exit $exit_code

