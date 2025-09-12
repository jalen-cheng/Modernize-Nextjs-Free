export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone_e164: string
          email: string | null
          date_of_birth: string | null
          security_question: string | null
          security_answer: string | null
          medical_history: string | null
          allergies: string[] | null
          medications: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          phone_e164: string
          email?: string | null
          date_of_birth?: string | null
          security_question?: string | null
          security_answer?: string | null
          medical_history?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone_e164?: string
          email?: string | null
          date_of_birth?: string | null
          security_question?: string | null
          security_answer?: string | null
          medical_history?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      call_log: {
        Row: {
          id: string
          patient_id: string
          call_job_id: string | null
          started_at: string
          ended_at: string | null
          status: string
          available_on_scheduled_date: boolean | null
          delivery_window: string | null
          med_change: string | null
          shipment_feedback: Json | null
          free_text_notes: string | null
          transcript: Json | null
          model_raw: Json | null
          meta: Json | null
        }
        Insert: {
          id?: string
          patient_id: string
          call_job_id?: string | null
          started_at?: string
          ended_at?: string | null
          status: string
          available_on_scheduled_date?: boolean | null
          delivery_window?: string | null
          med_change?: string | null
          shipment_feedback?: Json | null
          free_text_notes?: string | null
          transcript?: Json | null
          model_raw?: Json | null
          meta?: Json | null
        }
        Update: {
          id?: string
          patient_id?: string
          call_job_id?: string | null
          started_at?: string
          ended_at?: string | null
          status?: string
          available_on_scheduled_date?: boolean | null
          delivery_window?: string | null
          med_change?: string | null
          shipment_feedback?: Json | null
          free_text_notes?: string | null
          transcript?: Json | null
          model_raw?: Json | null
          meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']

export type CallLog = Database['public']['Tables']['call_log']['Row']
export type CallLogInsert = Database['public']['Tables']['call_log']['Insert']
export type CallLogUpdate = Database['public']['Tables']['call_log']['Update']

// Structured data types for call logs
export interface CallStructuredData {
  medication_adherence?: {
    taking_medications: boolean
    missed_doses: number
    side_effects: string[]
  }
  health_status?: {
    feeling: string
    pain_level: number
    symptoms: string[]
  }
  concerns?: {
    questions: string[]
    needs_followup: boolean
    urgency_level: 'low' | 'medium' | 'high'
  }
  pharmacy_needs?: {
    refill_requests: string[]
    delivery_needed: boolean
    preferred_pickup_time: string
  }
}
