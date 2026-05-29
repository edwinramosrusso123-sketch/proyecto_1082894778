import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export const roomTypeEnum = z.enum(['simple', 'doble', 'suite']);
export const roomStatusEnum = z.enum(['disponible', 'ocupada', 'mantenimiento']);

export const createRoomSchema = z.object({
  room_number: z.string().trim().min(1, 'Número requerido').max(10),
  type: roomTypeEnum,
  status: roomStatusEnum.default('disponible'),
  price_per_night: z.coerce.number().positive('El precio debe ser mayor a 0'),
  description: z.string().trim().max(500).optional().nullable(),
});

export const updateRoomSchema = z.object({
  room_number: z.string().trim().min(1).max(10).optional(),
  type: roomTypeEnum.optional(),
  status: roomStatusEnum.optional(),
  price_per_night: z.coerce.number().positive().optional(),
  description: z.string().trim().max(500).optional().nullable(),
});

export const changeRoomStatusSchema = z.object({
  status: roomStatusEnum,
});

export const createClientSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(150),
  email: z.string().email('Correo inválido'),
  phone: z.string().trim().max(20).optional().nullable(),
  identification_number: z.string().trim().min(3, 'Documento requerido').max(30),
  create_portal_access: z.boolean().optional().default(false),
  portal_password: z.string().min(6).optional(),
});

export const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  identification_number: z.string().trim().min(3).max(30).optional(),
});

export const createReservationSchema = z.object({
  room_id: z.string().uuid('Habitación inválida'),
  client_id: z.string().uuid('Cliente inválido'),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de entrada inválida'),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de salida inválida'),
}).refine((d) => d.check_out > d.check_in, {
  message: 'La salida debe ser posterior a la entrada',
  path: ['check_out'],
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(120),
  email: z.string().email('Correo inválido'),
  role: z.enum(['superadmin', 'recepcion', 'cliente']),
});

export const toggleUserSchema = z.object({
  is_active: z.boolean(),
});
