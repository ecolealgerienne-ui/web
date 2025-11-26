#!/bin/bash

# Script de test de connexion API
# Usage: ./test-api-connection.sh

API_URL="http://localhost:3000"
FARM_ID="f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e"

echo "🧪 Test de Connexion API Backend"
echo "================================="
echo ""

# Test 1: Health check
echo "1️⃣  Test de santé du backend..."
curl -s "$API_URL/health" || curl -s "$API_URL" && echo "" || echo "❌ Backend non accessible"
echo ""

# Test 2: Medical Products
echo "2️⃣  Test Medical Products..."
curl -s -X GET "$API_URL/farms/$FARM_ID/medical-products" \
  -H "Content-Type: application/json" | head -c 200
echo ""
echo ""

# Test 3: Vaccines
echo "3️⃣  Test Vaccines..."
curl -s -X GET "$API_URL/farms/$FARM_ID/vaccines" \
  -H "Content-Type: application/json" | head -c 200
echo ""
echo ""

# Test 4: Vaccinations
echo "4️⃣  Test Vaccinations..."
curl -s -X GET "$API_URL/farms/$FARM_ID/vaccinations" \
  -H "Content-Type: application/json" | head -c 200
echo ""
echo ""

# Test 5: Treatments
echo "5️⃣  Test Treatments..."
curl -s -X GET "$API_URL/farms/$FARM_ID/treatments" \
  -H "Content-Type: application/json" | head -c 200
echo ""
echo ""

echo "✅ Tests terminés !"
echo ""
echo "💡 Si tous les tests passent, le backend est prêt."
echo "💡 Vous pouvez maintenant lancer le frontend avec: npm run dev"
