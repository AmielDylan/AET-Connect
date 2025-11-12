import { z } from 'zod'

// Schémas de validation Zod

export const CheckSchoolPromoSchema = z.object({
  school_id: z.string().uuid('ID école invalide'),
  entry_year: z.string()
    .regex(/^\d{4}$/, 'Année doit être au format YYYY (ex: 2003)')
    .refine(
      (year) => {
        const y = parseInt(year)
        return y >= 1950 && y <= new Date().getFullYear()
      },
      'Année doit être entre 1950 et aujourd\'hui'
    )
})

export const RequestInitialAccessSchema = z.object({
  school_id: z.string().uuid('ID école invalide'),
  entry_year: z.string()
    .regex(/^\d{4}$/, 'Année doit être au format YYYY (ex: 2003)')
    .refine(
      (year) => {
        const y = parseInt(year)
        return y >= 1950 && y <= new Date().getFullYear()
      },
      'Année invalide'
    ),
  first_name: z.string().min(2, 'Prénom trop court').max(50),
  last_name: z.string().min(2, 'Nom trop court').max(50),
  email: z.string().email('Email invalide'),
  message: z.string().min(10, 'Message trop court').max(500),
  wants_ambassador: z.boolean()
})

export const VerifyInvitationCodeSchema = z.object({
  code: z.string().min(5, 'Code invalide'),
  school_id: z.string().uuid('ID école invalide'),
  entry_year: z.string().regex(/^\d{4}$/, 'Année invalide')
})

export const CompleteRegistrationSchema = z.object({
  invitation_code: z.string().min(5, 'Code invalide'),
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Mot de passe trop court (min 8 caractères)')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
})

export const RequestCodeFromPeerSchema = z.object({
  school_id: z.string().uuid('ID école invalide'),
  entry_year: z.string().regex(/^\d{4}$/, 'Année invalide'),
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  message: z.string().min(10).max(500)
})

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(10, 'Refresh token invalide')
})

export const CreateEventSchema = z.object({
  title: z.string().min(5, 'Titre trop court (min 5 caractères)').max(200),
  description: z.string().max(2000).optional(),
  event_date: z.string()
    .refine(
      (date) => {
        const eventDate = new Date(date)
        const now = new Date()
        return eventDate > now
      },
      "La date de début doit être dans le futur"
    ),
  event_end_date: z.string()
    .refine(
      (date) => {
        const endDate = new Date(date)
        const now = new Date()
        return endDate > now
      },
      "La date de fin doit être dans le futur"
    ),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  max_participants: z.number().int().positive().optional()
}).refine(
  (data) => new Date(data.event_end_date) > new Date(data.event_date),
  {
    message: "La date de fin doit être après la date de début",
    path: ["event_end_date"]
  }
)

export const UpdateEventSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(2000).optional(),
  event_date: z.string().optional(),
  event_end_date: z.string().optional(),
  city: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  max_participants: z.number().int().positive().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  is_active: z.boolean().optional()
}).refine(
  (data) => {
    if (data.event_date && data.event_end_date) {
      return new Date(data.event_end_date) > new Date(data.event_date)
    }
    return true
  },
  {
    message: "La date de fin doit être après la date de début",
    path: ["event_end_date"]
  }
)

export const EventFiltersSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  created_by: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional()
})

// Admin schemas
export const UpdateUserSchema = z.object({
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  school_id: z.string().uuid().optional(),
  entry_year: z.string().length(4).optional(),
  current_city: z.string().max(100).optional(),
  current_country: z.string().max(100).optional(),
  role: z.enum(['alumni', 'moderator', 'admin']).optional(),
  is_active: z.boolean().optional()
})

export const IncreaseCodeLimitSchema = z.object({
  new_limit: z.number().int().min(1).max(1000000)
})

export const SetAmbassadorSchema = z.object({
  is_ambassador: z.boolean()
})

export const AccessRequestFiltersSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  school_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional()
})

export const UserFiltersSchema = z.object({
  role: z.enum(['alumni', 'moderator', 'admin']).optional(),
  school_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  is_ambassador: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional()
})

// Users schemas
export const UpdateProfileSchema = z.object({
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  current_city: z.string().max(100).optional(),
  current_country: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  linkedin_url: z.string().url().optional(),
  avatar_url: z.string().url().optional()
}).passthrough() // Permet les champs supplémentaires (comme email) qui seront ignorés

export const UpdatePrivacySchema = z.object({
  show_email: z.boolean().optional(),
  show_phone: z.boolean().optional(),
  show_current_location: z.boolean().optional(),
  show_bio: z.boolean().optional(),
  show_linkedin: z.boolean().optional(),
  show_entry_year: z.boolean().optional(),
  show_in_directory: z.boolean().optional()
})

