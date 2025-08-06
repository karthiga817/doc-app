import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          role: 'admin' | 'doctor' | 'patient'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone: string
          role: 'admin' | 'doctor' | 'patient'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          role?: 'admin' | 'doctor' | 'patient'
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          user_id: string
          specialization: string
          experience: number
          availability: any
          leave_days: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialization: string
          experience: number
          availability?: any
          leave_days?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialization?: string
          experience?: number
          availability?: any
          leave_days?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
          reason: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          date: string
          time: string
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
          reason: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          date?: string
          time?: string
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
          reason?: string
          created_at?: string
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          doctor_id: string
          medications: string
          instructions: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          doctor_id: string
          medications: string
          instructions: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_id?: string
          doctor_id?: string
          medications?: string
          instructions?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}