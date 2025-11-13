#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║   PRUEBAS MÓDULO TRANSACCIONES - FASE 5       ║"
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

# Obtener ID de cuenta creada anteriormente
echo "📋 Obteniendo cuentas existentes..."
CUENTAS=$(curl -s -X GET http://localhost:3000/api/cuentas \
  -H "Authorization: Bearer $TOKEN")

ID_CUENTA=$(echo $CUENTAS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_cuenta'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)

if [ -z "$ID_CUENTA" ]; then
  echo "⚠️  No hay cuentas para probar. Creando cuenta..."
  # Aquí podrías crear una cuenta si es necesario
  exit 1
fi

echo "✅ Cuenta encontrada: ID $ID_CUENTA"
echo ""

# Test 1: Realizar depósito
echo "🧪 Test 1: Realizar depósito de Q500.00"
DEPOSITO=$(curl -s -X POST http://localhost:3000/api/transacciones/deposito \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id_cuenta\": $ID_CUENTA,
    \"monto\": 500.00,
    \"descripcion\": \"Depósito de prueba\"
  }")

if echo "$DEPOSITO" | grep -q '"success":true'; then
  SALDO_NUEVO=$(echo $DEPOSITO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo_nuevo'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Depósito exitoso. Nuevo saldo: Q$SALDO_NUEVO"
else
  echo "❌ Error al realizar depósito"
  echo "$DEPOSITO" | python3 -m json.tool 2>/dev/null | head -10
fi
echo ""

# Test 2: Realizar retiro
echo "🧪 Test 2: Realizar retiro de Q200.00"
RETIRO=$(curl -s -X POST http://localhost:3000/api/transacciones/retiro \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id_cuenta\": $ID_CUENTA,
    \"monto\": 200.00,
    \"descripcion\": \"Retiro de prueba\"
  }")

if echo "$RETIRO" | grep -q '"success":true'; then
  SALDO_NUEVO=$(echo $RETIRO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo_nuevo'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Retiro exitoso. Nuevo saldo: Q$SALDO_NUEVO"
else
  echo "❌ Error al realizar retiro"
fi
echo ""

# Test 3: Consultar saldo
echo "🧪 Test 3: Consultar saldo de cuenta"
SALDO=$(curl -s -X GET "http://localhost:3000/api/cuentas/${ID_CUENTA}/saldo" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SALDO" | grep -q '"success":true'; then
  SALDO_ACTUAL=$(echo $SALDO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Saldo consultado: Q$SALDO_ACTUAL"
else
  echo "❌ Error al consultar saldo"
fi
echo ""

# Test 4: Listar transacciones
echo "🧪 Test 4: Listar transacciones de la cuenta"
TRANSACCIONES=$(curl -s -X GET "http://localhost:3000/api/transacciones/cuenta/${ID_CUENTA}/historial" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TRANSACCIONES" | grep -q '"success":true'; then
  COUNT=$(echo $TRANSACCIONES | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']) if 'data' in data else 0)" 2>/dev/null)
  echo "✅ Transacciones obtenidas: $COUNT registros"
else
  echo "❌ Error al listar transacciones"
fi
echo ""

# Test 5: Intentar retiro con saldo insuficiente
echo "🧪 Test 5: Intentar retiro con saldo insuficiente (Q10000.00)"
RETIRO_INVALIDO=$(curl -s -X POST http://localhost:3000/api/transacciones/retiro \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id_cuenta\": $ID_CUENTA,
    \"monto\": 10000.00,
    \"descripcion\": \"Retiro que debe fallar\"
  }")

if echo "$RETIRO_INVALIDO" | grep -q '"success":false'; then
  echo "✅ Retiro rechazado correctamente (saldo insuficiente)"
else
  echo "❌ Debería haber rechazado el retiro"
fi
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║          ✅ PRUEBAS COMPLETADAS               ║"
echo "╚════════════════════════════════════════════════╝"
