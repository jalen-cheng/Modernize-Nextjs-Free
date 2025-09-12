import { z } from 'zod';

// User authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Pharmacy code schema
export const PharmacyCodeSchema = z.object({
  pharmacyCode: z.string().min(1, 'Pharmacy code is required'),
});

// Medical assistant schemas
export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  medication: z.string().min(1, 'Medication is required'),
  dateOfBirth: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const AppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  appointmentDate: z.string().datetime(),
  duration: z.number().min(15).max(240), // 15 minutes to 4 hours
  type: z.enum(['consultation', 'follow-up', 'emergency', 'routine-checkup']),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
  notes: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Vapi call schemas
export const VapiCallSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid E.164 phone number format'),
  assistantId: z.string().optional(),
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  callType: z.enum(['appointment-reminder', 'follow-up', 'prescription-reminder', 'general-inquiry']),
});

export const VapiWebhookSchema = z.object({
  type: z.enum([
    'call-start',
    'call-end',
    'transcript',
    'function-call',
    'hang',
    'speech-update'
  ]),
  call: z.object({
    id: z.string(),
    phoneNumber: z.string().optional(),
    assistantId: z.string().optional(),
    startedAt: z.string().optional(),
    endedAt: z.string().optional(),
  }).optional(),
  message: z.any().optional(),
});

// Medical data schemas
export const MedicationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  prescribedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const SymptomSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  symptom: z.string().min(1, 'Symptom description is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  duration: z.string().optional(),
  notes: z.string().optional(),
  reportedAt: z.string().datetime(),
});

// API response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  error: z.string().optional(),
});

// Type exports
export type Login = z.infer<typeof LoginSchema>;
export type SignUp = z.infer<typeof SignUpSchema>;
export type PharmacyCode = z.infer<typeof PharmacyCodeSchema>;
export type Patient = z.infer<typeof PatientSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type VapiCall = z.infer<typeof VapiCallSchema>;
export type VapiWebhook = z.infer<typeof VapiWebhookSchema>;
export type Medication = z.infer<typeof MedicationSchema>;
export type Symptom = z.infer<typeof SymptomSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
