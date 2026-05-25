Param()
Write-Host "Pruebas básicas para HotelApp (PowerShell)"
$BASE = "http://localhost:3000"

Write-Host "1) Login SuperAdmin"
Invoke-RestMethod -Method Post -Uri "$BASE/api/auth/login" -Body (@{ email = 'superadmin@hotelapp.test'; password = 'supersecret' } | ConvertTo-Json) -ContentType 'application/json' | ConvertTo-Json

Write-Host "2) Listar habitaciones"
Invoke-RestMethod -Uri "$BASE/api/rooms"

Write-Host "3) Consultar disponibles"
Invoke-RestMethod -Uri "$BASE/api/rooms/available?checkIn=2026-06-01&checkOut=2026-06-03"

Write-Host "4) Crear cliente con usuario"
Invoke-RestMethod -Method Post -Uri "$BASE/api/clients" -Body (@{ name='Test User'; email='testuser@example.test'; identification_number='99999'; create_user=$true } | ConvertTo-Json) -ContentType 'application/json' | ConvertTo-Json

Write-Host "5) Crear reserva ejemplo (si existe r1)"
Invoke-RestMethod -Method Post -Uri "$BASE/api/reservations" -Body (@{ room_id='r1'; check_in='2026-06-10'; check_out='2026-06-12'; guest_name='Test User'; created_by='00000000-0000-0000-0000-000000000002' } | ConvertTo-Json) -ContentType 'application/json' | ConvertTo-Json

Write-Host "Fin de pruebas básicas"
