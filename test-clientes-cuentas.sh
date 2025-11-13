#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║   PRUEBAS MÓDULO CLIENTES Y CUENTAS - FASE 4  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Obtener token
echo "🔐 Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['accessToken'] if 'data' in data else '')" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Error al obtener token"
  exit 1
fi
echo "✅ Token obtenido"
echo ""

# Test 1: Crear cliente
echo "🧪 Test 1: Crear nuevo cliente"
CLIENTE=$(curl -s -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dpi": "1234567890101",
    "nit": "1234567-8",
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez",
    "direccion": "Zona 1, Ciudad",
    "correo": "juan.perez@email.com",
    "telefonos": [
      {"numero_telefono": "12345678", "tipo": "movil", "principal": true}
    ]
  }')

ID_CLIENTE=$(echo $CLIENTE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['id_cliente'] if 'data' in data else '')" 2>/dev/null)

if [ ! -z "$ID_CLIENTE" ]; then
  echo "✅ Cliente creado con ID: $ID_CLIENTE"
else
  echo "❌ Error al crear cliente"
fi
echo ""

# Test 2: Listar clientes
echo "🧪 Test 2: Listar clientes"
CLIENTES=$(curl -s -X GET http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN")

if echo "$CLIENTES" | grep -q '"success":true'; then
  echo "✅ Clientes listados exitosamente"
else
  echo "❌ Error al listar clientes"
fi
echo ""

# Test 3: Obtener tipos de cuenta
echo "🧪 Test 3: Obtener tipos de cuenta"
TIPOS=$(curl -s -X GET http://localhost:3000/api/tipos-cuenta \
  -H "Authorization: Bearer $TOKEN")

ID_TIPO_CUENTA=$(echo $TIPOS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_tipo_cuenta'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)

if [ ! -z "$ID_TIPO_CUENTA" ]; then
  echo "✅ Tipos de cuenta obtenidos. Tipo ID: $ID_TIPO_CUENTA"
else
  echo "❌ Error al obtener tipos de cuenta"
fi
echo ""

# Test 4: Crear cuenta si tenemos cliente
if [ ! -z "$ID_CLIENTE" ] && [ ! -z "$ID_TIPO_CUENTA" ]; then
  echo "🧪 Test 4: Crear cuenta bancaria"
  CUENTA=$(curl -s -X POST http://localhost:3000/api/cuentas \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"id_cliente\": $ID_CLIENTE,
      \"id_tipo_cuenta\": $ID_TIPO_CUENTA,
      \"saldo_inicial\": 1000.00
    }")

  NUMERO_CUENTA=$(echo $CUENTA | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['numero_cuenta'] if 'data' in data else '')" 2>/dev/null)

  if [ ! -z "$NUMERO_CUENTA" ]; then
    echo "✅ Cuenta creada: $NUMERO_CUENTA"
  else
    echo "❌ Error al crear cuenta"
  fi
else
  echo "⚠️  Test 4: Omitido (falta cliente o tipo de cuenta)"
fi
echo ""

# Test 5: Listar cuentas
echo "🧪 Test 5: Listar cuentas"
CUENTAS=$(curl -s -X GET http://localhost:3000/api/cuentas \
  -H "Authorization: Bearer $TOKEN")

if echo "$CUENTAS" | grep -q '"success":true'; then
  echo "✅ Cuentas listadas exitosamente"
else
  echo "❌ Error al listar cuentas"
fi
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║          ✅ PRUEBAS COMPLETADAS               ║"
echo "╚════════════════════════════════════════════════╝"
