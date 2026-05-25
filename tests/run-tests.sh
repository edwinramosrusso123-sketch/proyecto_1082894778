#!/usr/bin/env bash
# Pruebas básicas para HotelApp (requiere curl)
BASE="http://localhost:3000"

echo "1) Login SuperAdmin"
curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"superadmin@hotelapp.test","password":"supersecret"}'
echo -e "\n\n"

echo "2) Listar habitaciones"
curl -s "$BASE/api/rooms"
echo -e "\n\n"

echo "3) Consultar disponibles"
curl -s "$BASE/api/rooms/available?checkIn=2026-06-01&checkOut=2026-06-03"
echo -e "\n\n"

echo "4) Crear cliente con usuario"
curl -s -X POST "$BASE/api/clients" -H "Content-Type: application/json" -d '{"name":"Test User","email":"testuser@example.test","identification_number":"99999","create_user":true}'
echo -e "\n\n"

echo "5) Crear reserva ejemplo (si existe r1)"
curl -s -X POST "$BASE/api/reservations" -H "Content-Type: application/json" -d '{"room_id":"r1","check_in":"2026-06-10","check_out":"2026-06-12","guest_name":"Test User","created_by":"00000000-0000-0000-0000-000000000002"}'
echo -e "\n\n"

echo "Fin de pruebas básicas"
