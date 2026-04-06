-- ═══════════════════════════════════════════════════════
-- EduVerse School ERP + LMS — Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. Profiles (standalone — User ID + Password based auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
  phone TEXT,
  avatar_url TEXT,
  class_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);



-- 2. Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT,
  grade_level INT,
  class_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK for profiles.class_id → classes.id
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_class_id_fkey
  FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- 3. Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  code TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Course ↔ Faculty (many-to-many)
CREATE TABLE IF NOT EXISTS public.course_faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(course_id, faculty_id)
);

-- 5. Enrollments (Student ↔ Course)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

-- 6. Modules (Course content sections)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Lessons (within modules)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('video', 'document', 'text', 'link')),
  content_url TEXT,
  content_text TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_marks INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  text_content TEXT,
  marks_obtained INT,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- 10. Grades
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_type TEXT CHECK (exam_type IN ('midterm', 'final', 'assignment', 'quiz')),
  marks_obtained INT,
  max_marks INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(student_id, class_id, attendance_date)
);

-- 12. Timetable Entries
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT
);

-- 13. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all', 'faculty', 'student', 'class')),
  target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- Timetable Management System (Advanced)
-- ═══════════════════════════════════════════════════════

-- 14. Sections (batches within a class, e.g. A, B)
CREATE TABLE IF NOT EXISTS public.tt_sections (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Subject-Class mapping (which courses are taught in which class + periods/week)
CREATE TABLE IF NOT EXISTS public.tt_subject_classes (
  id SERIAL PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  periods_per_week INT DEFAULT 0,
  CONSTRAINT unique_tt_subject_class UNIQUE (subject_id, class_id)
);

-- 16. Section-Subject mapping (per-section override for periods)
CREATE TABLE IF NOT EXISTS public.tt_section_subjects (
  id SERIAL PRIMARY KEY,
  section_id VARCHAR(36) NOT NULL REFERENCES public.tt_sections(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  periods_per_week INT,
  CONSTRAINT unique_tt_section_subject UNIQUE (section_id, subject_id)
);

-- 17. Teacher-Subject-Class mapping (which faculty teaches which subject in which class)
CREATE TABLE IF NOT EXISTS public.tt_teacher_subject_map (
  id SERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  section_id VARCHAR(36) REFERENCES public.tt_sections(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_tt_teacher_subject_class_section
  ON public.tt_teacher_subject_map (teacher_id, subject_id, class_id, COALESCE(section_id, '__ALL__'));

-- 18. Timetable Entries (the generated timetable grid)
CREATE TABLE IF NOT EXISTS public.tt_timetable_entries (
  id SERIAL PRIMARY KEY,
  section_id VARCHAR(36) NOT NULL REFERENCES public.tt_sections(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  period VARCHAR(10) NOT NULL,
  subject_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tt_timetable_slot UNIQUE (section_id, day, period)
);

-- ═══════════════════════════════════════════════════════
-- Row Level Security
-- Note: Since we use the service_role key on the server,
-- RLS is bypassed. Authorization is handled by Express
-- middleware (role guards). These policies are a safety net.
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_subject_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_section_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_teacher_subject_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_timetable_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for timetable tables (allow full access, auth handled by Express)
CREATE POLICY "tt_sections_all" ON public.tt_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tt_subject_classes_all" ON public.tt_subject_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tt_section_subjects_all" ON public.tt_section_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tt_teacher_subject_map_all" ON public.tt_teacher_subject_map FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tt_timetable_entries_all" ON public.tt_timetable_entries FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON public.timetable_entries(class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tt_sections_class ON public.tt_sections(class_id);
CREATE INDEX IF NOT EXISTS idx_tt_timetable_section ON public.tt_timetable_entries(section_id);

