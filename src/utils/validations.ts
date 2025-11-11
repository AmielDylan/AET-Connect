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

