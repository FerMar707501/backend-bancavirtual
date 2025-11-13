#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║   PRUEBA DE TRANSFERENCIA - FASE 5            ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['accessToken'] if 'data' in data else '')" 2>/dev/null)

# Obtener cuentas
CUENTAS=$(curl -s -X GET http://localhost:3000/api/cuentas -H "Authorization: Bearer $TOKEN")
ID_CUENTA_1=$(echo $CUENTAS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_cuenta'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)

if [ -z "$ID_CUENTA_1" ]; then
  echo "❌ No hay cuentas"
  exit 1
fi

# Crear segunda cuenta si no existe
ID_CUENTA_2=$(echo $CUENTAS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][1]['id_cuenta'] if 'data' in data and len(data['data']) > 1 else '')" 2>/dev/null)

if [ -z "$ID_CUENTA_2" ]; then
  echo "📝 Creando segunda cuenta para transferencia..."
  
  # Obtener ID de cliente
  ID_CLIENTE=$(curl -s -X GET http://localhost:3000/api/clientes -H "Authorization: Bearer $TOKEN" | \
    python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_cliente'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)
  
  CUENTA2=$(curl -s -X POST http://localhost:3000/api/cuentas \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"id_cliente\": $ID_CLIENTE,
      \"id_tipo_cuenta\": 1,
      \"saldo_inicial\": 500
    }")
  
  ID_CUENTA_2=$(echo $CUENTA2 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['id_cuenta'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Segunda cuenta creada: ID $ID_CUENTA_2"
fi

echo ""
echo "📊 Cuentas a utilizar:"
echo "   Cuenta Origen: ID $ID_CUENTA_1"
echo "   Cuenta Destino: ID $ID_CUENTA_2"
echo ""

# Consultar saldos antes
SALDO1_ANTES=$(curl -s -X GET "http://localhost:3000/api/cuentas/${ID_CUENTA_1}/saldo" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo'] if 'data' in data else '')" 2>/dev/null)

SALDO2_ANTES=$(curl -s -X GET "http://localhost:3000/api/cuentas/${ID_CUENTA_2}/saldo" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo'] if 'data' in data else '')" 2>/dev/null)

echo "💰 Saldos antes de transferencia:"
echo "   Cuenta 1: Q$SALDO1_ANTES"
echo "   Cuenta 2: Q$SALDO2_ANTES"
echo ""

# Realizar transferencia
echo "🧪 Realizando transferencia de Q300.00..."
TRANSFERENCIA=$(curl -s -X POST http://localhost:3000/api/transacciones/transferencia \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id_cuenta_origen\": $ID_CUENTA_1,
    \"id_cuenta_destino\": $ID_CUENTA_2,
    \"monto\": 300.00,
    \"descripcion\": \"Transferencia de prueba\"
  }")

if echo "$TRANSFERENCIA" | grep -q '"success":true'; then
  echo "✅ Transferencia exitosa"
  echo ""
  
  # Consultar saldos después
  SALDO1_DESPUES=$(curl -s -X GET "http://localhost:3000/api/cuentas/${ID_CUENTA_1}/saldo" \
    -H "Authorization: Bearer $TOKEN" | \
    python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo'] if 'data' in data else '')" 2>/dev/null)

  SALDO2_DESPUES=$(curl -s -X GET "http://localhost:3000/api/cuentas/${ID_CUENTA_2}/saldo" \
    -H "Authorization: Bearer $TOKEN" | \
    python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo'] if 'data' in data else '')" 2>/dev/null)

  echo "💰 Saldos después de transferencia:"
  echo "   Cuenta 1: Q$SALDO1_DESPUES (${SALDO1_ANTES} - 300)"
  echo "   Cuenta 2: Q$SALDO2_DESPUES (${SALDO2_ANTES} + 300)"
  echo ""
  echo "✅ TRANSFERENCIA COMPLETADA CORRECTAMENTE"
else
  echo "❌ Error en transferencia"
  echo "$TRANSFERENCIA" | python3 -m json.tool 2>/dev/null | head -10
fi

