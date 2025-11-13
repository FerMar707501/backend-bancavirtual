#!/bin/bash

echo "========================================="
echo "TESTING ADMIN CREDENTIALS"
echo "========================================="
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }' \
  -s | jq '.'

echo ""
echo "========================================="
echo "TESTING CLIENT CREDENTIALS"
echo "========================================="
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan.perez",
    "password": "Cliente123!"
  }' \
  -s | jq '.'

echo ""
echo "Test completed!"
