// Tipos de dominio de HotelApp

export type Role = 'superadmin' | 'recepcion' | 'cliente';
export type RoomType = 'simple' | 'doble' | 'suite';
export type RoomStatus = 'disponible' | 'ocupada' | 'mantenimiento';
export type ReservationStatus = 'activa' | 'completada' | 'cancelada';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface Room {
  id: string;
  room_number: string;
  type: RoomType;
  status: RoomStatus;
  price_per_night: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  identification_number: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  room_id: string;
  client_id: string;
  check_in: string;
  check_out: string;
  price_per_night_snapshot: number;
  total_amount: number;
  status: ReservationStatus;
  created_by: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface ReservationWithDetails extends Reservation {
  room: Pick<Room, 'id' | 'room_number' | 'type'>;
  client: Pick<Client, 'id' | 'name' | 'email' | 'identification_number'>;
  nights: number;
}

export interface ClientWithReservations extends Client {
  reservations: ReservationWithDetails[];
}

export interface AuditEntry {
  id?: string;
  timestamp?: string;
  user_id: string | null;
  user_email: string | null;
  user_role: Role | null;
  action:
    | 'login' | 'logout'
    | 'create_room' | 'update_room' | 'delete_room' | 'change_room_status'
    | 'create_client' | 'update_client' | 'delete_client'
    | 'create_reservation' | 'cancel_reservation'
    | 'create_user' | 'toggle_user'
    | 'change_password' | 'bootstrap';
  entity: 'room' | 'client' | 'reservation' | 'user' | 'system';
  entity_id?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
}

// KPIs y dashboard
export interface DashboardData {
  rooms: { total: number; disponible: number; ocupada: number; mantenimiento: number };
  reservationsToday: number;
  activeReservations: number;
  weeklyOccupancy: WeeklyOccupancy[];
  recentReservations: ReservationWithDetails[];
}

export interface WeeklyOccupancy {
  date: string;
  label: string;
  occupancy: number; // porcentaje 0-100
  occupied: number;
  total: number;
}

// Sesión decodificada del JWT
export interface Session {
  userId: string;
  email: string;
  role: Role;
  name: string;
  mustChangePassword: boolean;
}

// Filtros
export interface RoomFilters {
  status?: RoomStatus;
  type?: RoomType;
}

export interface ReservationFilters {
  status?: ReservationStatus;
  roomId?: string;
  clientId?: string;
}
