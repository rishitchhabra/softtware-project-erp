const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');
const { getGreeting } = require('../utils/helpers');

exports.dashboard = async (req, res) => {
  try {
    const [students, faculty, courses, classes, announcements] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
      supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('classes').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('announcements').select('*').order('created_at', { ascending: false }).limit(5)
    ]);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard', activePage: 'dashboard',
      stats: { students: students.count || 0, faculty: faculty.count || 0, courses: courses.count || 0, classes: classes.count || 0 },
      recentAnnouncements: announcements.data || [], greeting: getGreeting()
    });
  } catch (err) { console.error('Admin dashboard error:', err); req.session.error = 'Failed to load dashboard'; res.redirect('/login'); }
};

exports.students = async (req, res) => {
  try {
    const { data: students } = await supabaseAdmin.from('profiles')
      .select('*, classes(name)').eq('role', 'student').order('created_at', { ascending: false });
    const { data: classes } = await supabaseAdmin.from('classes').select('*').order('name');
    res.render('admin/students', { title: 'Students', activePage: 'students', students: students || [], classes: classes || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load students'; res.redirect('/admin'); }
};

exports.addStudent = async (req, res) => {
  try {
    const { user_id, password, full_name, phone, class_id } = req.body;
    if (!user_id || !password) { req.session.error = 'User ID and Password are required'; return res.redirect('/admin/students'); }
    // Check if user_id already exists
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('user_id', user_id.trim().toLowerCase()).single();
    if (existing) { req.session.error = 'User ID already exists'; return res.redirect('/admin/students'); }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    await supabaseAdmin.from('profiles').insert({
      user_id: user_id.trim().toLowerCase(), password_hash, full_name,
      role: 'student', phone: phone || null, class_id: class_id || null
    });
    req.session.success = 'Student added successfully'; res.redirect('/admin/students');
  } catch (err) { console.error(err); req.session.error = 'Failed to add student'; res.redirect('/admin/students'); }
};

exports.deleteStudent = async (req, res) => {
  try {
    await supabaseAdmin.from('profiles').delete().eq('id', req.params.id);
    req.session.success = 'Student deleted'; res.redirect('/admin/students');
  } catch (err) { console.error(err); req.session.error = 'Failed to delete student'; res.redirect('/admin/students'); }
};

exports.faculty = async (req, res) => {
  try {
    const { data: faculty } = await supabaseAdmin.from('profiles').select('*').eq('role', 'faculty').order('created_at', { ascending: false });
    res.render('admin/faculty', { title: 'Faculty', activePage: 'faculty', facultyList: faculty || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load faculty'; res.redirect('/admin'); }
};

exports.addFaculty = async (req, res) => {
  try {
    const { user_id, password, full_name, phone } = req.body;
    if (!user_id || !password) { req.session.error = 'User ID and Password are required'; return res.redirect('/admin/faculty'); }
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('user_id', user_id.trim().toLowerCase()).single();
    if (existing) { req.session.error = 'User ID already exists'; return res.redirect('/admin/faculty'); }
    const password_hash = await bcrypt.hash(password, 10);
    await supabaseAdmin.from('profiles').insert({
      user_id: user_id.trim().toLowerCase(), password_hash, full_name,
      role: 'faculty', phone: phone || null
    });
    req.session.success = 'Faculty added successfully'; res.redirect('/admin/faculty');
  } catch (err) { console.error(err); req.session.error = 'Failed to add faculty'; res.redirect('/admin/faculty'); }
};

exports.deleteFaculty = async (req, res) => {
  try {
    await supabaseAdmin.from('profiles').delete().eq('id', req.params.id);
    req.session.success = 'Faculty deleted'; res.redirect('/admin/faculty');
  } catch (err) { console.error(err); req.session.error = 'Failed to delete faculty'; res.redirect('/admin/faculty'); }
};

exports.classes = async (req, res) => {
  try {
    const { data: classes } = await supabaseAdmin.from('classes').select('*').order('grade_level').order('name');
    const { data: faculty } = await supabaseAdmin.from('profiles').select('id, full_name').eq('role', 'faculty');
    res.render('admin/classes', { title: 'Classes', activePage: 'classes', classes: classes || [], facultyList: faculty || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load classes'; res.redirect('/admin'); }
};

exports.addClass = async (req, res) => {
  try {
    const { name, section, grade_level, class_teacher_id } = req.body;
    await supabaseAdmin.from('classes').insert({ name, section: section || null, grade_level: parseInt(grade_level) || null, class_teacher_id: class_teacher_id || null });
    req.session.success = 'Class created'; res.redirect('/admin/classes');
  } catch (err) { console.error(err); req.session.error = 'Failed to create class'; res.redirect('/admin/classes'); }
};

exports.deleteClass = async (req, res) => {
  try { await supabaseAdmin.from('classes').delete().eq('id', req.params.id); req.session.success = 'Class deleted'; res.redirect('/admin/classes');
  } catch (err) { console.error(err); req.session.error = 'Failed to delete class'; res.redirect('/admin/classes'); }
};

exports.courses = async (req, res) => {
  try {
    const { data: courses } = await supabaseAdmin.from('courses').select('*, classes(name)').order('created_at', { ascending: false });
    const { data: classes } = await supabaseAdmin.from('classes').select('*').order('name');
    const { data: faculty } = await supabaseAdmin.from('profiles').select('id, full_name').eq('role', 'faculty');
    res.render('admin/courses', { title: 'Courses', activePage: 'courses', courses: courses || [], classes: classes || [], facultyList: faculty || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load courses'; res.redirect('/admin'); }
};

exports.addCourse = async (req, res) => {
  try {
    const { title, code, description, class_id, faculty_id } = req.body;
    const { data: course, error } = await supabaseAdmin.from('courses').insert({ title, code, description: description || null, class_id: class_id || null, status: 'active' }).select().single();
    if (error) throw error;
    if (faculty_id) { await supabaseAdmin.from('course_faculty').insert({ course_id: course.id, faculty_id }); }
    if (class_id) {
      const { data: students } = await supabaseAdmin.from('profiles').select('id').eq('role', 'student').eq('class_id', class_id);
      if (students && students.length > 0) { await supabaseAdmin.from('enrollments').insert(students.map(s => ({ course_id: course.id, student_id: s.id }))); }
    }
    req.session.success = 'Course created'; res.redirect('/admin/courses');
  } catch (err) { console.error(err); req.session.error = 'Failed to create course'; res.redirect('/admin/courses'); }
};

exports.deleteCourse = async (req, res) => {
  try { await supabaseAdmin.from('courses').delete().eq('id', req.params.id); req.session.success = 'Course deleted'; res.redirect('/admin/courses');
  } catch (err) { console.error(err); req.session.error = 'Failed to delete course'; res.redirect('/admin/courses'); }
};

exports.timetable = async (req, res) => {
  try {
    res.render('admin/timetable', { title: 'Timetable Management', activePage: 'timetable' });
  } catch (err) { console.error(err); req.session.error = 'Failed to load timetable'; res.redirect('/admin'); }
};

exports.addTimetableEntry = async (req, res) => {
  res.redirect('/admin/timetable');
};

exports.attendance = async (req, res) => {
  try {
    const classId = req.query.class_id || '';
    const { data: classes } = await supabaseAdmin.from('classes').select('*').order('name');
    
    let students = [];
    let todayStats = { present: 0, absent: 0, late: 0 };
    let selectedClassName = '';
    const today = new Date().toISOString().split('T')[0];

    if (classId) {
      // Get class name
      const cls = (classes || []).find(c => c.id === classId);
      selectedClassName = cls ? cls.name : 'Unknown';

      // Get students in this class
      const { data: classStudents } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, full_name')
        .eq('role', 'student')
        .eq('class_id', classId)
        .order('full_name');

      // Get all attendance records for this class
      const { data: records } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('class_id', classId);

      // Process each student
      students = (classStudents || []).map(s => {
        const studentRecords = (records || []).filter(r => r.student_id === s.id);
        const todayRecord = studentRecords.find(r => r.attendance_date === today);
        const presentCount = studentRecords.filter(r => r.status === 'present').length;
        const absentCount = studentRecords.filter(r => r.status === 'absent').length;
        const lateCount = studentRecords.filter(r => r.status === 'late').length;

        if (todayRecord) {
          if (todayRecord.status === 'present') todayStats.present++;
          else if (todayRecord.status === 'absent') todayStats.absent++;
          else if (todayRecord.status === 'late') todayStats.late++;
        }

        return { ...s, todayStatus: todayRecord ? todayRecord.status : null, presentCount, absentCount, lateCount };
      });
    }

    res.render('admin/attendance', {
      title: 'Attendance', activePage: 'attendance',
      classes: classes || [], selectedClass: classId, selectedClassName,
      students, todayStats, today
    });
  } catch (err) { console.error('Attendance error:', err); req.session.error = 'Failed to load attendance'; res.redirect('/admin'); }
};

exports.announcements = async (req, res) => {
  try {
    const { data: announcements } = await supabaseAdmin.from('announcements').select('*').order('created_at', { ascending: false });
    const { data: classes } = await supabaseAdmin.from('classes').select('id, name');
    res.render('admin/announcements', { title: 'Announcements', activePage: 'announcements', announcements: announcements || [], classes: classes || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load announcements'; res.redirect('/admin'); }
};

exports.addAnnouncement = async (req, res) => {
  try {
    const { title, content, target_role, target_class_id } = req.body;
    await supabaseAdmin.from('announcements').insert({ title, content, target_role: target_role || 'all', target_class_id: target_class_id || null, created_by: req.session.user.id });
    req.session.success = 'Announcement posted'; res.redirect('/admin/announcements');
  } catch (err) { console.error(err); req.session.error = 'Failed to post announcement'; res.redirect('/admin/announcements'); }
};

exports.deleteAnnouncement = async (req, res) => {
  try { await supabaseAdmin.from('announcements').delete().eq('id', req.params.id); req.session.success = 'Announcement deleted'; res.redirect('/admin/announcements');
  } catch (err) { console.error(err); req.session.error = 'Failed to delete'; res.redirect('/admin/announcements'); }
};
