#!/bin/bash
# Script para probar el MVP

echo "=========================================="
echo "   TESTEO DEL MVP - PRISIONERO"
echo "=========================================="
echo ""

# Test 1: Registro
echo "1. Testando REGISTRO..."
REGISTER=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Respuesta: $REGISTER"
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token obtenido: $TOKEN"
echo ""

# Test 2: Login
echo "2. Testando LOGIN..."
LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Respuesta: $LOGIN"
echo ""

# Test 3: Obtener usuario
echo "3. Testando GET USER..."
curl -s -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || echo "No se pudo obtener usuario"
echo ""

# Test 4: Crear partida
echo "4. Testando CREAR PARTIDA..."
curl -s -X POST http://localhost:5000/api/game/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "Error creando partida"
echo ""

echo "=========================================="
echo "   TESTS COMPLETADOS"
echo "=========================================="
