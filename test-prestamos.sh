#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║   PRUEBAS MÓDULO PRÉSTAMOS - FASE 6           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Obtener token
echo "🔐 Obteniendo token de autenticación..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['accessToken'] if 'data' in data else '')" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Error al obtener token"
  exit 1
fi
echo "✅ Token obtenido"
echo ""

# Test 1: Listar tipos de préstamo
echo "🧪 Test 1: Obtener tipos de préstamo disponibles"
TIPOS=$(curl -s -X GET http://localhost:3000/api/tipos-prestamo \
  -H "Authorization: Bearer $TOKEN")

ID_TIPO=$(echo $TIPOS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_tipo_prestamo'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)

if [ ! -z "$ID_TIPO" ]; then
  NOMBRE_TIPO=$(echo $TIPOS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['nombre'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Tipos de préstamo obtenidos. Tipo: $NOMBRE_TIPO (ID: $ID_TIPO)"
else
  echo "❌ Error al obtener tipos de préstamo"
  exit 1
fi
echo ""

# Test 2: Obtener cliente
ID_CLIENTE=$(curl -s -X GET http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_cliente'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)

if [ -z "$ID_CLIENTE" ]; then
  echo "❌ No hay clientes disponibles"
  exit 1
fi

# Test 3: Solicitar préstamo
echo "🧪 Test 2: Solicitar préstamo de Q10,000"
PRESTAMO=$(curl -s -X POST http://localhost:3000/api/prestamos/solicitar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id_cliente\": $ID_CLIENTE,
    \"id_tipo_prestamo\": $ID_TIPO,
    \"monto_solicitado\": 10000,
    \"plazo_meses\": 12,
    \"destino_prestamo\": \"Capital de trabajo\"
  }")

ID_PRESTAMO=$(echo $PRESTAMO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['id_prestamo'] if 'data' in data else '')" 2>/dev/null)

if [ ! -z "$ID_PRESTAMO" ]; then
  NUM_PRESTAMO=$(echo $PRESTAMO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['numero_prestamo'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Préstamo solicitado: $NUM_PRESTAMO (ID: $ID_PRESTAMO)"
else
  echo "❌ Error al solicitar préstamo"
  echo "$PRESTAMO" | python3 -m json.tool 2>/dev/null | head -10
  exit 1
fi
echo ""

# Test 4: Listar préstamos
echo "🧪 Test 3: Listar préstamos"
PRESTAMOS=$(curl -s -X GET http://localhost:3000/api/prestamos \
  -H "Authorization: Bearer $TOKEN")

if echo "$PRESTAMOS" | grep -q '"success":true'; then
  COUNT=$(echo $PRESTAMOS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']) if 'data' in data else 0)" 2>/dev/null)
  echo "✅ Préstamos listados: $COUNT registros"
else
  echo "❌ Error al listar préstamos"
fi
echo ""

# Test 5: Aprobar préstamo
echo "🧪 Test 4: Aprobar préstamo por Q9,500"
APROBACION=$(curl -s -X POST "http://localhost:3000/api/prestamos/${ID_PRESTAMO}/aprobar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"monto_aprobado": 9500}')

if echo "$APROBACION" | grep -q '"success":true'; then
  echo "✅ Préstamo aprobado exitosamente"
else
  echo "❌ Error al aprobar préstamo"
fi
echo ""

# Test 6: Obtener cuenta para desembolso
ID_CUENTA=$(curl -s -X GET http://localhost:3000/api/cuentas \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['id_cuenta'] if 'data' in data and len(data['data']) > 0 else '')" 2>/dev/null)

if [ ! -z "$ID_CUENTA" ]; then
  # Test 7: Desembolsar préstamo
  echo "🧪 Test 5: Desembolsar préstamo a cuenta $ID_CUENTA"
  DESEMBOLSO=$(curl -s -X POST "http://localhost:3000/api/prestamos/${ID_PRESTAMO}/desembolsar" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"id_cuenta_destino\": $ID_CUENTA}")

  if echo "$DESEMBOLSO" | grep -q '"success":true'; then
    SALDO=$(echo $DESEMBOLSO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo_cuenta'] if 'data' in data else '')" 2>/dev/null)
    echo "✅ Préstamo desembolsado. Nuevo saldo cuenta: Q$SALDO"
  else
    echo "❌ Error al desembolsar préstamo"
  fi
else
  echo "⚠️  No hay cuentas para desembolso"
fi
echo ""

# Test 8: Realizar pago
echo "🧪 Test 6: Realizar pago de Q1,000"
PAGO=$(curl -s -X POST http://localhost:3000/api/pagos-prestamo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id_prestamo\": $ID_PRESTAMO,
    \"monto_pago\": 1000,
    \"id_cuenta_origen\": $ID_CUENTA
  }")

if echo "$PAGO" | grep -q '"success":true'; then
  SALDO_NUEVO=$(echo $PAGO | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['saldo_nuevo'] if 'data' in data else '')" 2>/dev/null)
  echo "✅ Pago realizado. Nuevo saldo préstamo: Q$SALDO_NUEVO"
else
  echo "❌ Error al realizar pago"
fi
echo ""

# Test 9: Listar pagos del préstamo
echo "🧪 Test 7: Listar pagos del préstamo"
PAGOS=$(curl -s -X GET "http://localhost:3000/api/pagos-prestamo/prestamo/${ID_PRESTAMO}" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PAGOS" | grep -q '"success":true'; then
  COUNT_PAGOS=$(echo $PAGOS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['data']) if 'data' in data else 0)" 2>/dev/null)
  echo "✅ Pagos listados: $COUNT_PAGOS registros"
else
  echo "❌ Error al listar pagos"
fi
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║          ✅ PRUEBAS COMPLETADAS               ║"
echo "╚════════════════════════════════════════════════╝"
