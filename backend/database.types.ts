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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      Admin_Logs: {
        Row: {
          created_at: string
          date: string | null
          id: string
          message: string | null
          school_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Admins: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          pfp_path: string | null
          phone_number: string | null
          role: string
          school_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          role?: string
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          role?: string
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Admins_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Announcement_personal: {
        Row: {
          content: string | null
          created_at: string
          id: string
          school_id: string | null
          target_id: string | null
          title: string | null
          upload_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          target_id?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          target_id?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Announcement_student_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Announcement_subject: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          message: string | null
          school_id: string | null
          subject_id: string | null
          teacher_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Announcement_subject_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Announcement_subject_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Announcement_subject_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Announcements_class: {
        Row: {
          content: string | null
          created_at: string
          id: string
          school_id: string | null
          target_id: string | null
          title: string | null
          upload_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          target_id?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          target_id?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Announcements_class_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Announcements_class_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "Classes"
            referencedColumns: ["id"]
          },
        ]
      }
      Announcements_general: {
        Row: {
          content: string | null
          created_at: string
          id: string
          school_id: string | null
          title: string | null
          upload_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Announcements_general_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Announcements_group: {
        Row: {
          content: string | null
          created_at: string
          id: string
          school_id: string | null
          target: string | null
          title: string | null
          upload_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          target?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          school_id?: string | null
          target?: string | null
          title?: string | null
          upload_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Announcements_group_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Assignment_Extension_Student: {
        Row: {
          assignment_id: string | null
          created_at: string
          due_date: string | null
          id: string
          school_id: string | null
          student_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          school_id?: string | null
          student_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          school_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Assignment_Extension_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignment_Extension_Student_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "Assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignment_Extension_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Assignment_Views: {
        Row: {
          assignment_id: string | null
          created_at: string
          date_viewed: string | null
          id: string
          school_id: string | null
          student_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          date_viewed?: string | null
          id?: string
          school_id?: string | null
          student_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          date_viewed?: string | null
          id?: string
          school_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Assignment_Views_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "Assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignment_Views_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignment_Views_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          file_path: string | null
          id: string
          name: string | null
          school_id: string | null
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          file_path?: string | null
          id?: string
          name?: string | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          file_path?: string | null
          id?: string
          name?: string | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Assignments_Grades: {
        Row: {
          assignment_id: string | null
          created_at: string
          grade: string | null
          id: string
          message: string | null
          school_id: string | null
          student_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          student_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Assignments_Grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "Assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignments_Grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Assignments_Grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Class_Attendance: {
        Row: {
          class_id: string | null
          created_at: string
          date: string | null
          id: string
          present: boolean | null
          school_id: string | null
          student_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          present?: boolean | null
          school_id?: string | null
          student_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          present?: boolean | null
          school_id?: string | null
          student_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Class attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Class_Subjects: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          name: string | null
          school_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          school_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          school_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Class_Subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_Subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Class_Subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Classes: {
        Row: {
          class_teacher_id: string | null
          created_at: string
          id: string
          name: string | null
          school_id: string | null
          status: string | null
          timetable_path: string | null
        }
        Insert: {
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          school_id?: string | null
          status?: string | null
          timetable_path?: string | null
        }
        Update: {
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          school_id?: string | null
          status?: string | null
          timetable_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Exam_Grades: {
        Row: {
          created_at: string
          exam_id: string
          grade: string
          id: string
          message: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          grade: string
          id?: string
          message?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          grade?: string
          id?: string
          message?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Exam_Grades_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "Exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Exam_Grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Exam_Grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Exams: {
        Row: {
          content: string | null
          created_at: string
          file_path: string | null
          id: string
          name: string | null
          school_id: string | null
          subject_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string | null
          school_id?: string | null
          subject_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string | null
          school_id?: string | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      File_Vault: {
        Row: {
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          school_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          school_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          school_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "File_Vault_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Grade_Endpoint_Status: {
        Row: {
          created_at: string
          id: string
          is_open: boolean
          school_id: string
          term_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_open?: boolean
          school_id: string
          term_number: number
        }
        Update: {
          created_at?: string
          id?: string
          is_open?: boolean
          school_id?: string
          term_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "Grade_Endpoint_Status_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Grades: {
        Row: {
          class_subject_id: string | null
          comment: string | null
          created_at: string | null
          grade: number | null
          id: string
          school_id: string | null
          student_id: string | null
          teacher_id: string | null
          term: number | null
        }
        Insert: {
          class_subject_id?: string | null
          comment?: string | null
          created_at?: string | null
          grade?: number | null
          id?: string
          school_id?: string | null
          student_id?: string | null
          teacher_id?: string | null
          term?: number | null
        }
        Update: {
          class_subject_id?: string | null
          comment?: string | null
          created_at?: string | null
          grade?: number | null
          id?: string
          school_id?: string | null
          student_id?: string | null
          teacher_id?: string | null
          term?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Grades_class_subject_id_fkey"
            columns: ["class_subject_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Grades_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Parents: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          pfp_path: string | null
          phone_number: string | null
          school_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Parents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Personal_Logs: {
        Row: {
          belongs_to_id: string | null
          created_at: string
          date: string | null
          id: number
          message: string | null
          school_id: string | null
        }
        Insert: {
          belongs_to_id?: string | null
          created_at?: string
          date?: string | null
          id?: number
          message?: string | null
          school_id?: string | null
        }
        Update: {
          belongs_to_id?: string | null
          created_at?: string
          date?: string | null
          id?: number
          message?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Personal_Logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Report_Cards: {
        Row: {
          class_id: string | null
          created_at: string
          file_path: string
          id: string
          school_id: string | null
          student_id: string | null
          title: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          file_path: string
          id?: string
          school_id?: string | null
          student_id?: string | null
          title?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          file_path?: string
          id?: string
          school_id?: string | null
          student_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Uploaded_Report_Cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Uploaded_Report_Cards_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Uploaded_Report_Cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Schools: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_path: string | null
          name: string | null
          phone_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_path?: string | null
          name?: string | null
          phone_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_path?: string | null
          name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      Student_Discipline: {
        Row: {
          action: string | null
          created_at: string
          date: string | null
          disciplined_by: string | null
          id: string
          message: string | null
          school_id: string | null
          student_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          date?: string | null
          disciplined_by?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          student_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          date?: string | null
          disciplined_by?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Student_Discipline_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Student_Discipline_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Student_Subjects: {
        Row: {
          created_at: string
          id: string
          school_id: string | null
          students_id: string | null
          subjects_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          school_id?: string | null
          students_id?: string | null
          subjects_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          school_id?: string | null
          students_id?: string | null
          subjects_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Student_Subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Student_Subjects_subjects_id_fkey"
            columns: ["subjects_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Student_Subjects_subjects_id_fkey1"
            columns: ["subjects_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      Students: {
        Row: {
          class_id: string | null
          created_at: string
          email: string | null
          enrollment_status: string | null
          id: string
          name: string | null
          parents_id: string | null
          pfp_path: string | null
          phone_number: string | null
          school_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          email?: string | null
          enrollment_status?: string | null
          id?: string
          name?: string | null
          parents_id?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          email?: string | null
          enrollment_status?: string | null
          id?: string
          name?: string | null
          parents_id?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "Classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Students_parents_id_fkey"
            columns: ["parents_id"]
            isOneToOne: false
            referencedRelation: "Parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Subject_Attendance: {
        Row: {
          created_at: string
          date: string | null
          id: string
          present: boolean | null
          school_id: string | null
          student_id: string | null
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          present?: boolean | null
          school_id?: string | null
          student_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          present?: boolean | null
          school_id?: string | null
          student_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Subject_Attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject_Attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject_Attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject_Attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Subject_Notes: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          message: string | null
          school_id: string | null
          subject_id: string | null
          teacher_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          message?: string | null
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Subject_Notes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject_Notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Class_Subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject_Notes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "Teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      Submissions: {
        Row: {
          assignment_id: string | null
          created_at: string
          date_submitted: string | null
          file_path: string | null
          id: string
          school_id: string | null
          students_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          date_submitted?: string | null
          file_path?: string | null
          id?: string
          school_id?: string | null
          students_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          date_submitted?: string | null
          file_path?: string | null
          id?: string
          school_id?: string | null
          students_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "Assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submissions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submissions_students_id_fkey"
            columns: ["students_id"]
            isOneToOne: false
            referencedRelation: "Students"
            referencedColumns: ["id"]
          },
        ]
      }
      Super_Admins: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          pfp_path: string | null
          phone_number: string | null
          school_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Super_Admins_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Teachers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          pfp_path: string | null
          phone_number: string | null
          school_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pfp_path?: string | null
          phone_number?: string | null
          school_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
      Terms: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          number: number | null
          school_id: string | null
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          number?: number | null
          school_id?: string | null
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          number?: number | null
          school_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "Schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_sessions: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
