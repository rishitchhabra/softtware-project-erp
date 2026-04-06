-- ═══════════════════════════════════════════════════════
-- EduVerse — RESET (Drop all tables and start fresh)
-- Run this FIRST if you need a clean slate
-- ═══════════════════════════════════════════════════════

-- Timetable management tables (drop first due to FK deps)
DROP TABLE IF EXISTS public.tt_timetable_entries CASCADE;
DROP TABLE IF EXISTS public.tt_teacher_subject_map CASCADE;
DROP TABLE IF EXISTS public.tt_section_subjects CASCADE;
DROP TABLE IF EXISTS public.tt_subject_classes CASCADE;
DROP TABLE IF EXISTS public.tt_sections CASCADE;

-- Core ERP tables
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.timetable_entries CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.course_faculty CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ✅ All tables dropped. Now run supabase-schema.sql, then supabase-seed.sql
