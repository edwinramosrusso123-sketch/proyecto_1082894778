// Lógica crítica de reservas: disponibilidad y cálculo.
import { getSupabase } from './supabase';
import { calculateNights } from './dateUtils';

export { calculateNights };

export function calculateTotal(nights: number, pricePerNight: number): number {
  return nights * pricePerNight;
}

// RN-01: ¿hay alguna reserva ACTIVA solapada para esta habitación?
// Solapamiento: check_in < req.check_out AND check_out > req.check_in
export async function hasOverlap(
  roomId: string,
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string,
): Promise<boolean> {
  const supabase = getSupabase();
  let query = supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('status', 'activa')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn);
  if (excludeReservationId) query = query.neq('id', excludeReservationId);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
