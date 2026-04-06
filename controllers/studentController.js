const { supabaseAdmin } = require('../config/supabase');
const { getGreeting } = require('../utils/helpers');

exports.dashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [enrollments, assignmentsRes, gradesRes, announcements] = await Promise.all([
      supabaseAdmin.from('enrollments').select('course_id, courses(id, title, code, classes(name))').eq('student_id', userId),
      supabaseAdmin.from('assignments').select('id, title, due_date, max_marks, courses(title)').order('due_date', { ascending: true }).limit(5),
      supabaseAdmin.from('grades').select('*').eq('student_id', userId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('announcements').select('*').or('target_role.eq.all,target_role.eq.student').order('created_at', { ascending: false }).limit(5)
    ]);
    const myCourses = (enrollments.data || []).map(e => e.courses).filter(Boolean);
    // Filter assignments to enrolled courses
    const courseIds = myCourses.map(c => c.id);
    const myAssignments = (assignmentsRes.data || []);
    res.render('student/dashboard', {
      title: 'Student Dashboard', activePage: 'dashboard', greeting: getGreeting(),
      myCourses, upcomingAssignments: myAssignments, recentGrades: gradesRes.data || [],
      announcements: announcements.data || []
    });
  } catch (err) { console.error(err); req.session.error = 'Failed to load dashboard'; res.redirect('/login'); }
};

exports.courses = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('courses(*, classes(name))').eq('student_id', userId);
    const myCourses = (enrollments || []).map(e => e.courses).filter(Boolean);
    res.render('student/courses', { title: 'My Courses', activePage: 'courses', myCourses });
  } catch (err) { console.error(err); req.session.error = 'Failed to load courses'; res.redirect('/student'); }
};

exports.courseDetail = async (req, res) => {
  try {
    const { data: course } = await supabaseAdmin.from('courses').select('*, classes(name)').eq('id', req.params.id).single();
    const { data: modules } = await supabaseAdmin.from('modules').select('*, lessons(*)').eq('course_id', req.params.id).order('order_index');
    const { data: facultyLinks } = await supabaseAdmin.from('course_faculty').select('faculty:profiles(full_name)').eq('course_id', req.params.id);
    const faculty = (facultyLinks || []).map(f => f.faculty).filter(Boolean);
    res.render('student/courseDetail', { title: course.title, activePage: 'courses', course, modules: modules || [], faculty });
  } catch (err) { console.error(err); req.session.error = 'Failed to load course'; res.redirect('/student/courses'); }
};

exports.assignments = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: enrollments } = await supabaseAdmin.from('enrollments').select('course_id').eq('student_id', userId);
    const courseIds = (enrollments || []).map(e => e.course_id);
    let assignments = [], submissions = [];
    if (courseIds.length > 0) {
      const { data: a } = await supabaseAdmin.from('assignments').select('*, courses(title)').in('course_id', courseIds).order('due_date', { ascending: false });
      assignments = a || [];
      const aIds = assignments.map(a => a.id);
      if (aIds.length > 0) {
        const { data: s } = await supabaseAdmin.from('submissions').select('*').eq('student_id', userId).in('assignment_id', aIds);
        submissions = s || [];
      }
    }
    res.render('student/assignments', { title: 'Assignments', activePage: 'assignments', assignments, submissions });
  } catch (err) { console.error(err); req.session.error = 'Failed to load assignments'; res.redirect('/student'); }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignment_id, text_content } = req.body;
    const existing = await supabaseAdmin.from('submissions').select('id').eq('assignment_id', assignment_id).eq('student_id', req.session.user.id).single();
    if (existing.data) {
      await supabaseAdmin.from('submissions').update({ text_content, status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', existing.data.id);
    } else {
      await supabaseAdmin.from('submissions').insert({ assignment_id, student_id: req.session.user.id, text_content, status: 'submitted' });
    }
    req.session.success = 'Assignment submitted'; res.redirect('/student/assignments');
  } catch (err) { console.error(err); req.session.error = 'Failed to submit'; res.redirect('/student/assignments'); }
};

exports.grades = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: submissions } = await supabaseAdmin.from('submissions').select('*, assignment:assignments(title, max_marks, courses(title))').eq('student_id', userId).eq('status', 'graded').order('submitted_at', { ascending: false });
    const { data: grades } = await supabaseAdmin.from('grades').select('*, courses(title)').eq('student_id', userId).order('created_at', { ascending: false });
    res.render('student/grades', { title: 'My Grades', activePage: 'grades', submissions: submissions || [], grades: grades || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load grades'; res.redirect('/student'); }
};

exports.timetable = async (req, res) => {
  try {
    const classId = req.session.user.class_id;
    let entries = [];
    if (classId) {
      const { data } = await supabaseAdmin.from('timetable_entries').select('*, courses(title), faculty:profiles(full_name)').eq('class_id', classId).order('start_time');
      entries = data || [];
    }
    res.render('student/timetable', { title: 'Timetable', activePage: 'timetable', entries });
  } catch (err) { console.error(err); req.session.error = 'Failed to load timetable'; res.redirect('/student'); }
};

exports.attendance = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: records } = await supabaseAdmin.from('attendance').select('*').eq('student_id', userId).order('attendance_date', { ascending: false }).limit(30);
    const total = (records || []).length;
    const present = (records || []).filter(r => r.status === 'present').length;
    const absent = (records || []).filter(r => r.status === 'absent').length;
    const late = (records || []).filter(r => r.status === 'late').length;
    res.render('student/attendance', { title: 'Attendance', activePage: 'attendance', records: records || [], stats: { total, present, absent, late } });
  } catch (err) { console.error(err); req.session.error = 'Failed to load attendance'; res.redirect('/student'); }
};

exports.announcements = async (req, res) => {
  try {
    const classId = req.session.user.class_id;
    let query = supabaseAdmin.from('announcements').select('*').or('target_role.eq.all,target_role.eq.student');
    const { data: announcements } = await query.order('created_at', { ascending: false });
    res.render('student/announcements', { title: 'Announcements', activePage: 'announcements', announcements: announcements || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load announcements'; res.redirect('/student'); }
};
