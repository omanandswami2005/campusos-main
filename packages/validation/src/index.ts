import { z } from 'zod';

// ============================================================================
// Common Validation Schemas
// ============================================================================

/** UUID validation */
export const uuid = z.string().uuid('Invalid UUID format');

/** Email validation */
export const email = z.string().email('Invalid email address');

/** Strong password validation */
export const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

/** Name validation */
export const name = z.string().min(2, 'Name must be at least 2 characters').max(100);

/** Phone number validation */
export const phone = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  .optional();

/** URL validation */
export const url = z.string().url('Invalid URL');

/** Date string validation (ISO format) */
export const dateString = z.string().datetime({ message: 'Invalid date format' });

/** Future date validation */
export const futureDate = z.coerce
  .date()
  .refine((date) => date > new Date(), { message: 'Date must be in the future' });

/** Past date validation */
export const pastDate = z.coerce
  .date()
  .refine((date) => date < new Date(), { message: 'Date must be in the past' });

/** Positive integer */
export const positiveInt = z.number().int().positive();

/** Non-negative integer */
export const nonNegativeInt = z.number().int().nonnegative();

/** Price (positive number with 2 decimal places) */
export const price = z.number().positive().multipleOf(0.01);

// ============================================================================
// Auth Validation Schemas
// ============================================================================

export const RegisterSchema = z.object({
  email,
  password,
  name,
  rollNumber: z.string().optional(),
  collegeId: uuid.optional(),
  role: z.enum(['STUDENT', 'STAFF', 'COORDINATOR', 'ADMIN']).default('STUDENT'),
});

export const LoginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: password,
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  rollNumber: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: password,
});

// ============================================================================
// Canteen Validation Schemas
// ============================================================================

export const MenuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: price,
  category: z.string().min(1).max(50),
  isAvailable: z.boolean().default(true),
  imageUrl: url.optional(),
  preparationTime: positiveInt.optional(), // minutes
});

export const OrderItemSchema = z.object({
  menuItemId: uuid,
  quantity: positiveInt,
  specialInstructions: z.string().max(200).optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
  pickupTime: futureDate.optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

// ============================================================================
// Printing Validation Schemas
// ============================================================================

export const PrintJobSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileUrl: url,
  fileSize: positiveInt, // bytes
  pageCount: positiveInt,
  copies: positiveInt.default(1),
  colorMode: z.enum(['BW', 'COLOR']).default('BW'),
  paperSize: z.enum(['A4', 'A3', 'LETTER', 'LEGAL']).default('A4'),
  doubleSided: z.boolean().default(false),
  printShopId: uuid,
  notes: z.string().max(500).optional(),
});

export const UpdatePrintJobStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'PRINTED', 'READY', 'COLLECTED', 'CANCELLED']),
});

export const PrintShopSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  operatingHours: z.string().max(200).optional(),
  contactPhone: phone,
  bwPricePerPage: price,
  colorPricePerPage: price,
  isActive: z.boolean().default(true),
});

// ============================================================================
// Events Validation Schemas
// ============================================================================

export const ClubSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  logoUrl: url.optional(),
  contactEmail: email.optional(),
});

export const EventSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    startDate: futureDate,
    endDate: z.coerce.date(),
    location: z.string().min(2).max(200),
    maxAttendees: positiveInt.optional(),
    registrationDeadline: z.coerce.date().optional(),
    clubId: uuid.optional(),
    isPublic: z.boolean().default(true),
    requiresApproval: z.boolean().default(false),
    bannerUrl: url.optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => !data.registrationDeadline || data.registrationDeadline < data.startDate, {
    message: 'Registration deadline must be before event start',
    path: ['registrationDeadline'],
  });

export const EventRegistrationSchema = z.object({
  eventId: uuid,
  attendeeDetails: z.record(z.string()).optional(),
});

export const EventFeedbackSchema = z.object({
  eventId: uuid,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export type MenuItemInput = z.infer<typeof MenuItemSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

export type PrintJobInput = z.infer<typeof PrintJobSchema>;
export type UpdatePrintJobStatusInput = z.infer<typeof UpdatePrintJobStatusSchema>;
export type PrintShopInput = z.infer<typeof PrintShopSchema>;

export type ClubInput = z.infer<typeof ClubSchema>;
export type EventInput = z.infer<typeof EventSchema>;
export type EventRegistrationInput = z.infer<typeof EventRegistrationSchema>;
export type EventFeedbackInput = z.infer<typeof EventFeedbackSchema>;

// ============================================================================
// Re-export Zod
// ============================================================================

export { z } from 'zod';
