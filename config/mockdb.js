/**
 * In-memory mock database for demo/testing mode
 * Provides a Supabase-compatible query API with seeded school data
 */
const { v4: uuidv4 } = require('crypto');

function uid() { return require('crypto').randomUUID(); }

// Pre-computed bcrypt hash for 'pass123'
const PASS_HASH = '$2b$10$3ldqoMSK6xxT8TJ6k9jg/OBG/QpZ4uSG5Z0fRwyfFpuIdPKQlnaSS';
// Pre-computed bcrypt hash for 'admin123'
const ADMIN_HASH = '$2b$10$p.lqSgB0Cbr45zclhU5pAO6Py61.m/CmR7aBvNYb4Z6PGSNkYoeaO';

// ── Generate IDs ────────────────────────────────
const ids = {
  // Classes
  c10a: uid(), c10b: uid(), c11a: uid(), c11b: uid(), c12a: uid(),
  // Faculty
  f1: uid(), f2: uid(), f3: uid(), f4: uid(), f5: uid(),
  // Students
  s1: uid(), s2: uid(), s3: uid(), s4: uid(), s5: uid(),
  s6: uid(), s7: uid(), s8: uid(), s9: uid(), s10: uid(),
  s11: uid(), s12: uid(), s13: uid(), s14: uid(), s15: uid(),
  // Admin
  admin: uid(),
  // Courses
  cr1: uid(), cr2: uid(), cr3: uid(), cr4: uid(), cr5: uid(),
  cr6: uid(), cr7: uid(), cr8: uid(),
  // Modules
  m1: uid(), m2: uid(), m3: uid(), m4: uid(), m5: uid(), m6: uid(),
  // Lessons
  l1: uid(), l2: uid(), l3: uid(), l4: uid(), l5: uid(), l6: uid(), l7: uid(), l8: uid(),
  // Assignments
  a1: uid(), a2: uid(), a3: uid(), a4: uid(), a5: uid(),
  // Timetable
  t1: uid(), t2: uid(), t3: uid(), t4: uid(), t5: uid(), t6: uid(), t7: uid(), t8: uid(), t9: uid(), t10: uid(),
  // Announcements
  an1: uid(), an2: uid(), an3: uid(),
  // Attendance
  at1: uid(), at2: uid(), at3: uid(), at4: uid(), at5: uid(),
  // Submissions
  sub1: uid(), sub2: uid(),
  // Grades
  g1: uid(), g2: uid(),
};

// ── Seed Data ───────────────────────────────────
const DB = {
  profiles: [
    // Admin
    { id: ids.admin, user_id: 'admin', password_hash: ADMIN_HASH, full_name: 'System Admin', role: 'admin', phone: '+91 98765 00000', avatar_url: null, class_id: null, created_at: '2025-06-01T00:00:00Z' },
    // Faculty
    { id: ids.f1, user_id: 'fac001', password_hash: PASS_HASH, full_name: 'Dr. Ananya Sharma', role: 'faculty', phone: '+91 98765 11111', avatar_url: null, class_id: null, created_at: '2025-06-15T00:00:00Z' },
    { id: ids.f2, user_id: 'fac002', password_hash: PASS_HASH, full_name: 'Prof. Rajesh Kumar', role: 'faculty', phone: '+91 98765 22222', avatar_url: null, class_id: null, created_at: '2025-06-15T00:00:00Z' },
    { id: ids.f3, user_id: 'fac003', password_hash: PASS_HASH, full_name: 'Dr. Priya Patel', role: 'faculty', phone: '+91 98765 33333', avatar_url: null, class_id: null, created_at: '2025-07-01T00:00:00Z' },
    { id: ids.f4, user_id: 'fac004', password_hash: PASS_HASH, full_name: 'Prof. Vikram Singh', role: 'faculty', phone: '+91 98765 44444', avatar_url: null, class_id: null, created_at: '2025-07-01T00:00:00Z' },
    { id: ids.f5, user_id: 'fac005', password_hash: PASS_HASH, full_name: 'Dr. Meena Iyer', role: 'faculty', phone: '+91 98765 55555', avatar_url: null, class_id: null, created_at: '2025-08-01T00:00:00Z' },
    // Students — Class 10-A
    { id: ids.s1, user_id: 'stu001', password_hash: PASS_HASH, full_name: 'Aarav Gupta', role: 'student', phone: '+91 91111 00001', avatar_url: null, class_id: ids.c10a, created_at: '2025-07-01T00:00:00Z' },
    { id: ids.s2, user_id: 'stu002', password_hash: PASS_HASH, full_name: 'Diya Mehta', role: 'student', phone: '+91 91111 00002', avatar_url: null, class_id: ids.c10a, created_at: '2025-07-01T00:00:00Z' },
    { id: ids.s3, user_id: 'stu003', password_hash: PASS_HASH, full_name: 'Arjun Reddy', role: 'student', phone: '+91 91111 00003', avatar_url: null, class_id: ids.c10a, created_at: '2025-07-01T00:00:00Z' },
    // Students — Class 10-B
    { id: ids.s4, user_id: 'stu004', password_hash: PASS_HASH, full_name: 'Ishita Verma', role: 'student', phone: '+91 91111 00004', avatar_url: null, class_id: ids.c10b, created_at: '2025-07-01T00:00:00Z' },
    { id: ids.s5, user_id: 'stu005', password_hash: PASS_HASH, full_name: 'Rohan Joshi', role: 'student', phone: '+91 91111 00005', avatar_url: null, class_id: ids.c10b, created_at: '2025-07-01T00:00:00Z' },
    { id: ids.s6, user_id: 'stu006', password_hash: PASS_HASH, full_name: 'Ananya Desai', role: 'student', phone: '+91 91111 00006', avatar_url: null, class_id: ids.c10b, created_at: '2025-07-01T00:00:00Z' },
    // Students — Class 11-A
    { id: ids.s7, user_id: 'stu007', password_hash: PASS_HASH, full_name: 'Kabir Malhotra', role: 'student', phone: '+91 91111 00007', avatar_url: null, class_id: ids.c11a, created_at: '2025-07-15T00:00:00Z' },
    { id: ids.s8, user_id: 'stu008', password_hash: PASS_HASH, full_name: 'Nisha Kapoor', role: 'student', phone: '+91 91111 00008', avatar_url: null, class_id: ids.c11a, created_at: '2025-07-15T00:00:00Z' },
    { id: ids.s9, user_id: 'stu009', password_hash: PASS_HASH, full_name: 'Vivaan Saxena', role: 'student', phone: '+91 91111 00009', avatar_url: null, class_id: ids.c11a, created_at: '2025-07-15T00:00:00Z' },
    // Students — Class 11-B
    { id: ids.s10, user_id: 'stu010', password_hash: PASS_HASH, full_name: 'Saanvi Tiwari', role: 'student', phone: '+91 91111 00010', avatar_url: null, class_id: ids.c11b, created_at: '2025-07-15T00:00:00Z' },
    { id: ids.s11, user_id: 'stu011', password_hash: PASS_HASH, full_name: 'Aditya Bhatia', role: 'student', phone: '+91 91111 00011', avatar_url: null, class_id: ids.c11b, created_at: '2025-07-15T00:00:00Z' },
    // Students — Class 12-A
    { id: ids.s12, user_id: 'stu012', password_hash: PASS_HASH, full_name: 'Riya Choudhary', role: 'student', phone: '+91 91111 00012', avatar_url: null, class_id: ids.c12a, created_at: '2025-08-01T00:00:00Z' },
    { id: ids.s13, user_id: 'stu013', password_hash: PASS_HASH, full_name: 'Dev Nair', role: 'student', phone: '+91 91111 00013', avatar_url: null, class_id: ids.c12a, created_at: '2025-08-01T00:00:00Z' },
    { id: ids.s14, user_id: 'stu014', password_hash: PASS_HASH, full_name: 'Myra Agarwal', role: 'student', phone: '+91 91111 00014', avatar_url: null, class_id: ids.c12a, created_at: '2025-08-01T00:00:00Z' },
    { id: ids.s15, user_id: 'stu015', password_hash: PASS_HASH, full_name: 'Karthik Rao', role: 'student', phone: '+91 91111 00015', avatar_url: null, class_id: ids.c12a, created_at: '2025-08-01T00:00:00Z' },
  ],

  classes: [
    { id: ids.c10a, name: 'Class 10-A', section: 'A', grade_level: 10, class_teacher_id: ids.f1, created_at: '2025-06-01T00:00:00Z' },
    { id: ids.c10b, name: 'Class 10-B', section: 'B', grade_level: 10, class_teacher_id: ids.f2, created_at: '2025-06-01T00:00:00Z' },
    { id: ids.c11a, name: 'Class 11-A', section: 'A', grade_level: 11, class_teacher_id: ids.f3, created_at: '2025-06-01T00:00:00Z' },
    { id: ids.c11b, name: 'Class 11-B', section: 'B', grade_level: 11, class_teacher_id: ids.f4, created_at: '2025-06-01T00:00:00Z' },
    { id: ids.c12a, name: 'Class 12-A', section: 'A', grade_level: 12, class_teacher_id: ids.f5, created_at: '2025-06-01T00:00:00Z' },
  ],

  courses: [
    { id: ids.cr1, title: 'Mathematics', description: 'Algebra, Calculus, and Geometry', code: 'MATH10', class_id: ids.c10a, status: 'active', created_at: '2025-07-01T00:00:00Z' },
    { id: ids.cr2, title: 'Physics', description: 'Mechanics, Optics, and Thermodynamics', code: 'PHY10', class_id: ids.c10a, status: 'active', created_at: '2025-07-01T00:00:00Z' },
    { id: ids.cr3, title: 'Chemistry', description: 'Organic and Inorganic Chemistry', code: 'CHEM10', class_id: ids.c10b, status: 'active', created_at: '2025-07-01T00:00:00Z' },
    { id: ids.cr4, title: 'English Literature', description: 'Shakespeare, Poetry, and Prose', code: 'ENG11', class_id: ids.c11a, status: 'active', created_at: '2025-07-15T00:00:00Z' },
    { id: ids.cr5, title: 'Computer Science', description: 'Programming, Data Structures, Algorithms', code: 'CS11', class_id: ids.c11a, status: 'active', created_at: '2025-07-15T00:00:00Z' },
    { id: ids.cr6, title: 'Biology', description: 'Cell Biology, Genetics, Ecology', code: 'BIO11', class_id: ids.c11b, status: 'active', created_at: '2025-07-15T00:00:00Z' },
    { id: ids.cr7, title: 'History', description: 'Modern Indian History and World Wars', code: 'HIST12', class_id: ids.c12a, status: 'active', created_at: '2025-08-01T00:00:00Z' },
    { id: ids.cr8, title: 'Advanced Mathematics', description: 'Differential Equations and Linear Algebra', code: 'MATH12', class_id: ids.c12a, status: 'active', created_at: '2025-08-01T00:00:00Z' },
  ],

  course_faculty: [
    { id: uid(), course_id: ids.cr1, faculty_id: ids.f1 },
    { id: uid(), course_id: ids.cr2, faculty_id: ids.f2 },
    { id: uid(), course_id: ids.cr3, faculty_id: ids.f3 },
    { id: uid(), course_id: ids.cr4, faculty_id: ids.f4 },
    { id: uid(), course_id: ids.cr5, faculty_id: ids.f1 },
    { id: uid(), course_id: ids.cr6, faculty_id: ids.f5 },
    { id: uid(), course_id: ids.cr7, faculty_id: ids.f4 },
    { id: uid(), course_id: ids.cr8, faculty_id: ids.f1 },
  ],

  enrollments: [
    // Class 10-A students → Math, Physics
    { id: uid(), course_id: ids.cr1, student_id: ids.s1, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr1, student_id: ids.s2, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr1, student_id: ids.s3, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr2, student_id: ids.s1, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr2, student_id: ids.s2, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr2, student_id: ids.s3, enrolled_at: '2025-07-05T00:00:00Z' },
    // Class 10-B → Chemistry
    { id: uid(), course_id: ids.cr3, student_id: ids.s4, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr3, student_id: ids.s5, enrolled_at: '2025-07-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr3, student_id: ids.s6, enrolled_at: '2025-07-05T00:00:00Z' },
    // Class 11-A → English, CS
    { id: uid(), course_id: ids.cr4, student_id: ids.s7, enrolled_at: '2025-07-20T00:00:00Z' },
    { id: uid(), course_id: ids.cr4, student_id: ids.s8, enrolled_at: '2025-07-20T00:00:00Z' },
    { id: uid(), course_id: ids.cr4, student_id: ids.s9, enrolled_at: '2025-07-20T00:00:00Z' },
    { id: uid(), course_id: ids.cr5, student_id: ids.s7, enrolled_at: '2025-07-20T00:00:00Z' },
    { id: uid(), course_id: ids.cr5, student_id: ids.s8, enrolled_at: '2025-07-20T00:00:00Z' },
    // Class 11-B → Biology
    { id: uid(), course_id: ids.cr6, student_id: ids.s10, enrolled_at: '2025-07-20T00:00:00Z' },
    { id: uid(), course_id: ids.cr6, student_id: ids.s11, enrolled_at: '2025-07-20T00:00:00Z' },
    // Class 12-A → History, Adv Math
    { id: uid(), course_id: ids.cr7, student_id: ids.s12, enrolled_at: '2025-08-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr7, student_id: ids.s13, enrolled_at: '2025-08-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr7, student_id: ids.s14, enrolled_at: '2025-08-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr8, student_id: ids.s12, enrolled_at: '2025-08-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr8, student_id: ids.s13, enrolled_at: '2025-08-05T00:00:00Z' },
    { id: uid(), course_id: ids.cr8, student_id: ids.s15, enrolled_at: '2025-08-05T00:00:00Z' },
  ],

  modules: [
    { id: ids.m1, course_id: ids.cr1, title: 'Algebra Fundamentals', order_index: 1, created_at: '2025-07-10T00:00:00Z' },
    { id: ids.m2, course_id: ids.cr1, title: 'Quadratic Equations', order_index: 2, created_at: '2025-07-15T00:00:00Z' },
    { id: ids.m3, course_id: ids.cr2, title: 'Laws of Motion', order_index: 1, created_at: '2025-07-10T00:00:00Z' },
    { id: ids.m4, course_id: ids.cr2, title: 'Work, Energy & Power', order_index: 2, created_at: '2025-07-20T00:00:00Z' },
    { id: ids.m5, course_id: ids.cr5, title: 'Introduction to Programming', order_index: 1, created_at: '2025-07-25T00:00:00Z' },
    { id: ids.m6, course_id: ids.cr5, title: 'Data Structures', order_index: 2, created_at: '2025-08-01T00:00:00Z' },
  ],

  lessons: [
    { id: ids.l1, module_id: ids.m1, title: 'Variables and Expressions', content_type: 'text', content_url: null, content_text: 'Learn about variables, constants, and algebraic expressions.', order_index: 1, created_at: '2025-07-10T00:00:00Z' },
    { id: ids.l2, module_id: ids.m1, title: 'Linear Equations', content_type: 'video', content_url: 'https://example.com/linear-eq', content_text: null, order_index: 2, created_at: '2025-07-11T00:00:00Z' },
    { id: ids.l3, module_id: ids.m2, title: 'Solving Quadratics', content_type: 'text', content_url: null, content_text: 'Methods: factoring, completing the square, and quadratic formula.', order_index: 1, created_at: '2025-07-15T00:00:00Z' },
    { id: ids.l4, module_id: ids.m3, title: "Newton's First Law", content_type: 'text', content_url: null, content_text: 'An object at rest stays at rest unless acted upon by an external force.', order_index: 1, created_at: '2025-07-10T00:00:00Z' },
    { id: ids.l5, module_id: ids.m3, title: "Newton's Second Law", content_type: 'document', content_url: 'https://example.com/f-equals-ma.pdf', content_text: null, order_index: 2, created_at: '2025-07-12T00:00:00Z' },
    { id: ids.l6, module_id: ids.m5, title: 'What is Programming?', content_type: 'text', content_url: null, content_text: 'Introduction to computers and how programs work.', order_index: 1, created_at: '2025-07-25T00:00:00Z' },
    { id: ids.l7, module_id: ids.m5, title: 'Variables & Data Types', content_type: 'video', content_url: 'https://example.com/variables-intro', content_text: null, order_index: 2, created_at: '2025-07-26T00:00:00Z' },
    { id: ids.l8, module_id: ids.m6, title: 'Arrays and Linked Lists', content_type: 'text', content_url: null, content_text: 'Understanding sequential vs linked data storage.', order_index: 1, created_at: '2025-08-01T00:00:00Z' },
  ],

  assignments: [
    { id: ids.a1, course_id: ids.cr1, created_by: ids.f1, title: 'Algebra Problem Set 1', description: 'Solve 20 problems on linear equations', due_date: '2026-04-15T23:59:00Z', max_marks: 50, created_at: '2026-03-20T00:00:00Z' },
    { id: ids.a2, course_id: ids.cr1, created_by: ids.f1, title: 'Quadratic Equations Worksheet', description: 'Complete the worksheet on quadratic equations', due_date: '2026-04-20T23:59:00Z', max_marks: 100, created_at: '2026-03-25T00:00:00Z' },
    { id: ids.a3, course_id: ids.cr2, created_by: ids.f2, title: 'Newton Laws Lab Report', description: 'Write a lab report on the force experiment', due_date: '2026-04-10T23:59:00Z', max_marks: 75, created_at: '2026-03-15T00:00:00Z' },
    { id: ids.a4, course_id: ids.cr5, created_by: ids.f1, title: 'Build a Calculator', description: 'Create a simple calculator program', due_date: '2026-04-25T23:59:00Z', max_marks: 100, created_at: '2026-04-01T00:00:00Z' },
    { id: ids.a5, course_id: ids.cr3, created_by: ids.f3, title: 'Periodic Table Quiz', description: 'Fill in the periodic table elements', due_date: '2026-04-08T23:59:00Z', max_marks: 40, created_at: '2026-03-28T00:00:00Z' },
  ],

  submissions: [
    { id: ids.sub1, assignment_id: ids.a1, student_id: ids.s1, file_url: null, text_content: 'Here are my solutions for problems 1-20...', marks_obtained: 42, feedback: 'Excellent work! Minor error in Q15.', status: 'graded', submitted_at: '2026-04-10T10:00:00Z' },
    { id: ids.sub2, assignment_id: ids.a1, student_id: ids.s2, file_url: null, text_content: 'Solutions attached.', marks_obtained: null, feedback: null, status: 'submitted', submitted_at: '2026-04-12T14:00:00Z' },
  ],

  grades: [
    { id: ids.g1, course_id: ids.cr1, student_id: ids.s1, exam_type: 'midterm', marks_obtained: 85, max_marks: 100, created_at: '2026-02-15T00:00:00Z' },
    { id: ids.g2, course_id: ids.cr2, student_id: ids.s1, exam_type: 'quiz', marks_obtained: 18, max_marks: 20, created_at: '2026-03-01T00:00:00Z' },
  ],

  attendance: [
    // Aarav Gupta — Class 10-A
    { id: ids.at1, student_id: ids.s1, class_id: ids.c10a, attendance_date: '2026-04-04', status: 'present', marked_by: ids.f1 },
    { id: ids.at2, student_id: ids.s1, class_id: ids.c10a, attendance_date: '2026-04-03', status: 'present', marked_by: ids.f1 },
    { id: ids.at3, student_id: ids.s1, class_id: ids.c10a, attendance_date: '2026-04-02', status: 'late', marked_by: ids.f1 },
    { id: ids.at4, student_id: ids.s1, class_id: ids.c10a, attendance_date: '2026-04-01', status: 'present', marked_by: ids.f1 },
    { id: ids.at5, student_id: ids.s1, class_id: ids.c10a, attendance_date: '2026-03-31', status: 'absent', marked_by: ids.f1 },
    { id: uid(), student_id: ids.s2, class_id: ids.c10a, attendance_date: '2026-04-04', status: 'present', marked_by: ids.f1 },
    { id: uid(), student_id: ids.s2, class_id: ids.c10a, attendance_date: '2026-04-03', status: 'absent', marked_by: ids.f1 },
    { id: uid(), student_id: ids.s3, class_id: ids.c10a, attendance_date: '2026-04-04', status: 'present', marked_by: ids.f1 },
    { id: uid(), student_id: ids.s3, class_id: ids.c10a, attendance_date: '2026-04-03', status: 'present', marked_by: ids.f1 },
  ],

  timetable_entries: [
    // Class 10-A
    { id: ids.t1, class_id: ids.c10a, course_id: ids.cr1, faculty_id: ids.f1, day_of_week: 'Monday', start_time: '09:00', end_time: '09:45', room: 'Room 101' },
    { id: ids.t2, class_id: ids.c10a, course_id: ids.cr2, faculty_id: ids.f2, day_of_week: 'Monday', start_time: '10:00', end_time: '10:45', room: 'Lab 1' },
    { id: ids.t3, class_id: ids.c10a, course_id: ids.cr1, faculty_id: ids.f1, day_of_week: 'Tuesday', start_time: '09:00', end_time: '09:45', room: 'Room 101' },
    { id: ids.t4, class_id: ids.c10a, course_id: ids.cr2, faculty_id: ids.f2, day_of_week: 'Wednesday', start_time: '11:00', end_time: '11:45', room: 'Lab 1' },
    { id: ids.t5, class_id: ids.c10a, course_id: ids.cr1, faculty_id: ids.f1, day_of_week: 'Thursday', start_time: '09:00', end_time: '09:45', room: 'Room 101' },
    // Class 11-A
    { id: ids.t6, class_id: ids.c11a, course_id: ids.cr4, faculty_id: ids.f4, day_of_week: 'Monday', start_time: '10:00', end_time: '10:45', room: 'Room 201' },
    { id: ids.t7, class_id: ids.c11a, course_id: ids.cr5, faculty_id: ids.f1, day_of_week: 'Monday', start_time: '11:00', end_time: '11:45', room: 'CS Lab' },
    { id: ids.t8, class_id: ids.c11a, course_id: ids.cr4, faculty_id: ids.f4, day_of_week: 'Wednesday', start_time: '10:00', end_time: '10:45', room: 'Room 201' },
    { id: ids.t9, class_id: ids.c11a, course_id: ids.cr5, faculty_id: ids.f1, day_of_week: 'Friday', start_time: '11:00', end_time: '11:45', room: 'CS Lab' },
    // Class 12-A
    { id: ids.t10, class_id: ids.c12a, course_id: ids.cr7, faculty_id: ids.f4, day_of_week: 'Tuesday', start_time: '09:00', end_time: '09:45', room: 'Room 301' },
  ],

  announcements: [
    { id: ids.an1, created_by: ids.admin, title: 'Annual Sports Day 2026', content: 'The Annual Sports Day will be held on 20th April 2026. All students must register with their class teacher by 10th April. Events include track & field, swimming, and team sports.', target_role: 'all', target_class_id: null, created_at: '2026-04-01T09:00:00Z' },
    { id: ids.an2, created_by: ids.admin, title: 'Mid-Term Exam Schedule', content: 'Mid-term examinations will commence from 25th April. Detailed timetable has been shared with class teachers. Students are advised to prepare well.', target_role: 'student', target_class_id: null, created_at: '2026-04-03T10:00:00Z' },
    { id: ids.an3, created_by: ids.admin, title: 'Faculty Meeting — Curriculum Review', content: 'All faculty members are requested to attend the curriculum review meeting on 8th April at 3:00 PM in the Conference Hall. Please bring your syllabus completion reports.', target_role: 'faculty', target_class_id: null, created_at: '2026-04-05T08:00:00Z' },
  ],

  // ── Timetable Management Tables ──────────────
  tt_sections: [
    { id: 'sec-10a', class_id: ids.c10a, name: 'A', display_order: 0, created_at: '2025-06-01T00:00:00Z' },
    { id: 'sec-10b', class_id: ids.c10b, name: 'A', display_order: 0, created_at: '2025-06-01T00:00:00Z' },
    { id: 'sec-11a', class_id: ids.c11a, name: 'A', display_order: 0, created_at: '2025-06-01T00:00:00Z' },
    { id: 'sec-12a', class_id: ids.c12a, name: 'A', display_order: 0, created_at: '2025-06-01T00:00:00Z' },
  ],
  tt_subject_classes: [
    { id: 1, subject_id: ids.cr1, class_id: ids.c10a, periods_per_week: 6 },
    { id: 2, subject_id: ids.cr2, class_id: ids.c10a, periods_per_week: 5 },
    { id: 3, subject_id: ids.cr3, class_id: ids.c10b, periods_per_week: 5 },
    { id: 4, subject_id: ids.cr4, class_id: ids.c11a, periods_per_week: 5 },
    { id: 5, subject_id: ids.cr5, class_id: ids.c11a, periods_per_week: 4 },
    { id: 6, subject_id: ids.cr7, class_id: ids.c12a, periods_per_week: 4 },
    { id: 7, subject_id: ids.cr8, class_id: ids.c12a, periods_per_week: 6 },
  ],
  tt_section_subjects: [
    { id: 1, section_id: 'sec-10a', subject_id: ids.cr1 },
    { id: 2, section_id: 'sec-10a', subject_id: ids.cr2 },
    { id: 3, section_id: 'sec-10b', subject_id: ids.cr3 },
    { id: 4, section_id: 'sec-11a', subject_id: ids.cr4 },
    { id: 5, section_id: 'sec-11a', subject_id: ids.cr5 },
    { id: 6, section_id: 'sec-12a', subject_id: ids.cr7 },
    { id: 7, section_id: 'sec-12a', subject_id: ids.cr8 },
  ],
  tt_teacher_subject_map: [
    { id: 1, teacher_id: ids.f1, subject_id: ids.cr1, class_id: ids.c10a, section_id: null },
    { id: 2, teacher_id: ids.f2, subject_id: ids.cr2, class_id: ids.c10a, section_id: null },
    { id: 3, teacher_id: ids.f3, subject_id: ids.cr3, class_id: ids.c10b, section_id: null },
    { id: 4, teacher_id: ids.f4, subject_id: ids.cr4, class_id: ids.c11a, section_id: null },
    { id: 5, teacher_id: ids.f1, subject_id: ids.cr5, class_id: ids.c11a, section_id: null },
    { id: 6, teacher_id: ids.f4, subject_id: ids.cr7, class_id: ids.c12a, section_id: null },
    { id: 7, teacher_id: ids.f1, subject_id: ids.cr8, class_id: ids.c12a, section_id: null },
  ],
  tt_timetable_entries: [],
};

// ── Relation map for JOIN-like selects ──────────
const RELATIONS = {
  profiles: { classes: { table: 'classes', fk: 'class_id', pk: 'id' } },
  classes: {},
  courses: { classes: { table: 'classes', fk: 'class_id', pk: 'id' } },
  course_faculty: {
    courses: { table: 'courses', fk: 'course_id', pk: 'id' },
    faculty: { table: 'profiles', fk: 'faculty_id', pk: 'id' },
  },
  enrollments: {
    courses: { table: 'courses', fk: 'course_id', pk: 'id' },
    student: { table: 'profiles', fk: 'student_id', pk: 'id' },
  },
  modules: { lessons: { table: 'lessons', fk: 'id', pk: 'module_id', type: 'has_many' } },
  lessons: {},
  assignments: { courses: { table: 'courses', fk: 'course_id', pk: 'id' } },
  submissions: {
    student: { table: 'profiles', fk: 'student_id', pk: 'id' },
    assignment: { table: 'assignments', fk: 'assignment_id', pk: 'id' },
  },
  grades: { courses: { table: 'courses', fk: 'course_id', pk: 'id' } },
  attendance: {},
  timetable_entries: {
    courses: { table: 'courses', fk: 'course_id', pk: 'id' },
    faculty: { table: 'profiles', fk: 'faculty_id', pk: 'id' },
  },
  announcements: {},
  tt_sections: {},
  tt_subject_classes: {},
  tt_section_subjects: {},
  tt_teacher_subject_map: {},
  tt_timetable_entries: {},
};

// ── Resolve relations on a record ───────────────
function resolveRelations(tableName, record, selectFields) {
  if (!selectFields) return { ...record };
  const result = { ...record };
  const rels = RELATIONS[tableName] || {};
  for (const [relName, relDef] of Object.entries(rels)) {
    if (selectFields.includes(relName) || selectFields.includes(`${relName}(`)) {
      if (relDef.type === 'has_many') {
        result[relName] = (DB[relDef.table] || []).filter(r => r[relDef.pk] === record.id);
      } else {
        const fkVal = record[relDef.fk];
        const related = (DB[relDef.table] || []).find(r => r[relDef.pk] === fkVal);
        result[relName] = related ? { ...related } : null;
        // Nested relations (e.g. courses(title, classes(name)))
        if (related) {
          const nestedRels = RELATIONS[relDef.table] || {};
          for (const [nRelName, nRelDef] of Object.entries(nestedRels)) {
            if (selectFields.includes(nRelName)) {
              const nFkVal = related[nRelDef.fk];
              result[relName][nRelName] = (DB[nRelDef.table] || []).find(r => r[nRelDef.pk] === nFkVal) || null;
            }
          }
        }
      }
    }
  }
  return result;
}

// ── Query builder (Supabase-compatible API) ──────
function createQueryBuilder(tableName) {
  let _data = [...(DB[tableName] || [])];
  let _selectFields = '*';
  let _filters = [];
  let _orders = [];
  let _limitVal = null;
  let _singleMode = false;
  let _countOnly = false;
  let _headOnly = false;
  let _insertData = null;
  let _updateData = null;
  let _deleteMode = false;

  const builder = {
    select(fields, opts) {
      _selectFields = fields || '*';
      if (opts && opts.count === 'exact') _countOnly = true;
      if (opts && opts.head) _headOnly = true;
      return builder;
    },
    insert(data) {
      _insertData = Array.isArray(data) ? data : [data];
      return builder;
    },
    update(data) { _updateData = data; return builder; },
    upsert(data) { _insertData = Array.isArray(data) ? data : [data]; return builder; },
    delete() { _deleteMode = true; return builder; },
    eq(col, val) { _filters.push(r => String(r[col]) === String(val)); return builder; },
    neq(col, val) { _filters.push(r => String(r[col]) !== String(val)); return builder; },
    is(col, val) { _filters.push(r => r[col] === val); return builder; },
    in(col, vals) { _filters.push(r => vals.includes(r[col])); return builder; },
    gt(col, val) { _filters.push(r => r[col] > val); return builder; },
    lt(col, val) { _filters.push(r => r[col] < val); return builder; },
    gte(col, val) { _filters.push(r => r[col] >= val); return builder; },
    lte(col, val) { _filters.push(r => r[col] <= val); return builder; },
    or(expr) {
      // Simple parser for: col.eq.val,col.eq.val
      const parts = expr.split(',');
      const orFns = parts.map(p => {
        const m = p.trim().match(/^(\w+)\.eq\.(.+)$/);
        if (m) return r => String(r[m[1]]) === String(m[2]);
        return () => true;
      });
      _filters.push(r => orFns.some(fn => fn(r)));
      return builder;
    },
    order(col, opts) {
      const asc = opts && opts.ascending === false ? false : true;
      _orders.push({ col, asc });
      return builder;
    },
    limit(n) { _limitVal = n; return builder; },
    range(from, to) { _limitVal = to - from + 1; return builder; },
    single() { _singleMode = true; return builder; },
    maybeSingle() { _singleMode = true; return builder; },

    then(resolve, reject) {
      try {
        // INSERT
        if (_insertData) {
          const inserted = _insertData.map(item => {
            const newItem = { id: uid(), created_at: new Date().toISOString(), ...item };
            if (!DB[tableName]) DB[tableName] = [];
            DB[tableName].push(newItem);
            return newItem;
          });
          return resolve({ data: inserted.length === 1 ? inserted[0] : inserted, error: null });
        }

        // DELETE
        if (_deleteMode) {
          let before = (DB[tableName] || []).length;
          DB[tableName] = (DB[tableName] || []).filter(r => !_filters.every(fn => fn(r)));
          return resolve({ data: null, error: null, count: before - (DB[tableName] || []).length });
        }

        // UPDATE
        if (_updateData) {
          let updated = [];
          DB[tableName] = (DB[tableName] || []).map(r => {
            if (_filters.every(fn => fn(r))) {
              const u = { ...r, ..._updateData };
              updated.push(u);
              return u;
            }
            return r;
          });
          return resolve({ data: updated, error: null });
        }

        // SELECT
        let results = [...(DB[tableName] || [])];
        for (const fn of _filters) results = results.filter(fn);
        for (const o of _orders) {
          results.sort((a, b) => {
            if (a[o.col] < b[o.col]) return o.asc ? -1 : 1;
            if (a[o.col] > b[o.col]) return o.asc ? 1 : -1;
            return 0;
          });
        }
        if (_limitVal) results = results.slice(0, _limitVal);

        // Resolve relations
        results = results.map(r => resolveRelations(tableName, r, _selectFields));

        if (_headOnly) return resolve({ data: null, error: null, count: results.length });
        if (_singleMode) {
          return resolve({ data: results[0] || null, error: results[0] ? null : { message: 'Not found' } });
        }
        return resolve({ data: results, error: null, count: results.length });
      } catch (err) {
        if (reject) return reject(err);
        return resolve({ data: null, error: { message: err.message } });
      }
    },
    catch(fn) { return Promise.resolve(builder).catch(fn); },
    finally(fn) { return Promise.resolve(builder).finally(fn); },
  };

  return builder;
}

// ── MockDB client (Supabase-compatible) ─────────
const mockClient = {
  from: (tableName) => createQueryBuilder(tableName),
};

module.exports = { mockClient, DB };
