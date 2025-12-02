#!/bin/bash

# Script per creare brand di test tramite Firebase CLI
# Usa: bash create-brand-cli.sh

echo "🚀 Creazione brand di test via Firebase CLI..."

# Calcola timestamp per currentPeriodEnd (30 giorni da ora)
CURRENT_TIME=$(date +%s)
PERIOD_END=$((CURRENT_TIME + 30 * 24 * 60 * 60))

# Crea il documento JSON
cat > /tmp/test-brand.json << EOF
{
  "id": "test-brand-real",
  "name": "Real Test Gallery",
  "subdomain": "test.gallery.local",
  "ownerEmail": "test@gallery.local",
  "status": "active",
  "subscription": {
    "status": "active",
    "stripeCustomerId": "cus_test_123",
    "currentPeriodEnd": {
      "_seconds": $PERIOD_END,
      "_nanoseconds": 0
    }
  },
  "branding": {
    "primaryColor": "#10b981",
    "secondaryColor": "#f59e0b",
    "backgroundColor": "#ffffff",
    "logo": "https://placehold.co/200x200/10b981/ffffff?text=REAL"
  },
  "createdAt": {
    "_seconds": $CURRENT_TIME,
    "_nanoseconds": 0
  },
  "updatedAt": {
    "_seconds": $CURRENT_TIME,
    "_nanoseconds": 0
  }
}
EOF

echo "📄 File JSON creato: /tmp/test-brand.json"

# Usa Firebase CLI per scrivere il documento
echo "📝 Scrittura su Firestore..."
firebase firestore:write brands/test-brand-real /tmp/test-brand.json

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Brand creato con successo!"
  echo "-----------------------------------"
  echo "Brand ID: test-brand-real"
  echo "Domain: test.gallery.local"
  echo "Color: #10b981 (Verde Smeraldo)"
  echo "-----------------------------------"
  echo ""
  echo "🧪 Prossimi step:"
  echo "1. Aggiungi a /etc/hosts:"
  echo "   sudo bash -c 'echo \"127.0.0.1 test.gallery.local\" >> /etc/hosts'"
  echo ""
  echo "2. Apri nel browser:"
  echo "   http://test.gallery.local:5173"
else
  echo ""
  echo "❌ Errore durante la creazione del brand"
  echo "Verifica di essere autenticato:"
  echo "   firebase login"
fi

# Pulizia
rm /tmp/test-brand.json


