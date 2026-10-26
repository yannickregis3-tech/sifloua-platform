export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_levels: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_level_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_level_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_level_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_levels_parent_level_id_fkey"
            columns: ["parent_level_id"]
            isOneToOne: false
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
        }
        Relationships: []
      }
      classes: {
        Row: {
          academic_level_id: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          academic_level_id: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          academic_level_id?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_level_id_fkey"
            columns: ["academic_level_id"]
            isOneToOne: false
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempt_answers: {
        Row: {
          attempt_id: string
          free_text_answer: string | null
          is_correct: boolean | null
          points_awarded: number | null
          question_id: string
          selected_answer_ids: string[]
        }
        Insert: {
          attempt_id: string
          free_text_answer?: string | null
          is_correct?: boolean | null
          points_awarded?: number | null
          question_id: string
          selected_answer_ids?: string[]
        }
        Update: {
          attempt_id?: string
          free_text_answer?: string | null
          is_correct?: boolean | null
          points_awarded?: number | null
          question_id?: string
          selected_answer_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          learner_id: string
          score: number | null
          started_at: string
          status: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          learner_id: string
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          learner_id?: string
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string
          points: number
          question_id: string
          sort_order: number
        }
        Insert: {
          exam_id: string
          points?: number
          question_id: string
          sort_order?: number
        }
        Update: {
          exam_id?: string
          points?: number
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          passing_score: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          passing_score?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          passing_score?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string
          curriculum_status: string
          duration_minutes: number | null
          id: string
          module_id: string
          published_at: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          curriculum_status?: string
          duration_minutes?: number | null
          id?: string
          module_id: string
          published_at?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          curriculum_status?: string
          duration_minutes?: number | null
          id?: string
          module_id?: string
          published_at?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          program_id: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          program_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          program_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          class_id: string
          created_at: string
          curriculum_reference: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["content_status"]
          subject_id: string
          title: string
          track_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          curriculum_reference?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          subject_id: string
          title: string
          track_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          curriculum_reference?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          subject_id?: string
          title?: string
          track_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed_at: string | null
          completion_percent: number
          last_opened_at: string | null
          learner_id: string
          lesson_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          completion_percent?: number
          last_opened_at?: string | null
          learner_id: string
          lesson_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          completion_percent?: number
          last_opened_at?: string | null
          learner_id?: string
          lesson_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      question_answers: {
        Row: {
          answer_text: string
          id: string
          is_correct: boolean
          question_id: string
          sort_order: number
        }
        Insert: {
          answer_text: string
          id?: string
          is_correct?: boolean
          question_id: string
          sort_order?: number
        }
        Update: {
          answer_text?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          lesson_id: string
          prompt: string
          status: Database["public"]["Enums"]["content_status"]
          type: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          lesson_id: string
          prompt: string
          status?: Database["public"]["Enums"]["content_status"]
          type: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          prompt?: string
          status?: Database["public"]["Enums"]["content_status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          external_url: string | null
          id: string
          lesson_id: string
          resource_type: string
          storage_key: string | null
          title: string
        }
        Insert: {
          created_at?: string
          external_url?: string | null
          id?: string
          lesson_id: string
          resource_type: string
          storage_key?: string | null
          title: string
        }
        Update: {
          created_at?: string
          external_url?: string | null
          id?: string
          lesson_id?: string
          resource_type?: string
          storage_key?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "SUPER_ADMIN" | "ADMIN" | "FORMATEUR" | "APPRENANT"
      content_status:
        | "DRAFT"
        | "SUBMITTED"
        | "REVIEW"
        | "APPROVED"
        | "PUBLISHED"
        | "REJECTED"
        | "ARCHIVED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["SUPER_ADMIN", "ADMIN", "FORMATEUR", "APPRENANT"],
      content_status: [
        "DRAFT",
        "SUBMITTED",
        "REVIEW",
        "APPROVED",
        "PUBLISHED",
        "REJECTED",
        "ARCHIVED",
      ],
    },
  },
} as const
