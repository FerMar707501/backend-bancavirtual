#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║     PRUEBAS DE AUTENTICACIÓN - FASE 3         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Test 1: Login
echo "🧪 Test 1: Login con credenciales válidas"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['accessToken'] if 'data' in data else '')")

if [ ! -z "$TOKEN" ]; then
  echo "✅ Login exitoso"
  echo "ℹ️  Token: ${TOKEN:0:30}..."
else
  echo "❌ Login falló"
fi

echo ""

# Test 2: Obtener perfil
echo "🧪 Test 2: Obtener perfil con token"
PROFILE=$(curl -s -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q '"success":true'; then
  echo "✅ Perfil obtenido exitosamente"
else
  echo "❌ Error al obtener perfil"
fi

echo ""

# Test 3: Listar usuarios
echo "🧪 Test 3: Listar usuarios (requiere permisos)"
USUARIOS=$(curl -s -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer $TOKEN")

if echo "$USUARIOS" | grep -q '"success":true'; then
  echo "✅ Usuarios obtenidos exitosamente"
else
  echo "❌ Error al listar usuarios"
fi

echo ""

# Test 4: Acceso sin token
echo "🧪 Test 4: Intentar acceder sin token"
NO_TOKEN=$(curl -s -X GET http://localhost:3000/api/auth/profile)

if echo "$NO_TOKEN" | grep -q '"success":false'; then
  echo "✅ Acceso denegado correctamente (401)"
else
  echo "❌ Debería haber fallado"
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║     ✅ PRUEBAS COMPLETADAS                    ║"
echo "╚════════════════════════════════════════════════╝"
