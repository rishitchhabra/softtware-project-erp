const { supabaseAdmin } = require('../config/supabase');
const { getGreeting } = require('../utils/helpers');

exports.dashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [coursesRes, assignmentsRes, announcements] = await Promise.all([
      supabaseAdmin.from('course_faculty').select('course_id, courses(id, title, code, status, classes(name))').eq('faculty_id', userId),
      supabaseAdmin.from('assignments').select('id, title, due_date, courses(title)').eq('created_by', userId).order('due_date', { ascending: false }).limit(5),
      supabaseAdmin.from('announcements').select('*').order('created_at', { ascending: false }).limit(5)
    ]);
    const myCourses = (coursesRes.data || []).map(cf => cf.courses).filter(Boolean);
    res.render('faculty/dashboard', {
      title: 'Faculty Dashboard', activePage: 'dashboard', greeting: getGreeting(),
      myCourses, recentAssignments: assignmentsRes.data || [],
      announcements: announcements.data || []
    });
  } catch (err) { console.error(err); req.session.error = 'Failed to load dashboard'; res.redirect('/login'); }
};

exports.courses = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: courseLinks } = await supabaseAdmin.from('course_faculty').select('course_id, courses(*, classes(name))').eq('faculty_id', userId);
    const myCourses = (courseLinks || []).map(cl => cl.courses).filter(Boolean);
    res.render('faculty/courses', { title: 'My Courses', activePage: 'courses', myCourses });
  } catch (err) { console.error(err); req.session.error = 'Failed to load courses'; res.redirect('/faculty'); }
};

exports.courseDetail = async (req, res) => {
  try {
    const { data: course } = await supabaseAdmin.from('courses').select('*, classes(name)').eq('id', req.params.id).single();
    const { data: modules } = await supabaseAdmin.from('modules').select('*, lessons(*)').eq('course_id', req.params.id).order('order_index');
    const { data: students } = await supabaseAdmin.from('enrollments').select('student:profiles(id, full_name, user_id)').eq('course_id', req.params.id);
    res.render('faculty/courseDetail', {
      title: course.title, activePage: 'courses', course,
      modules: modules || [], enrolledStudents: (students || []).map(s => s.student).filter(Boolean)
    });
  } catch (err) { console.error(err); req.session.error = 'Failed to load course'; res.redirect('/faculty/courses'); }
};

exports.addModule = async (req, res) => {
  try {
    const { title, order_index } = req.body;
    await supabaseAdmin.from('modules').insert({ course_id: req.params.id, title, order_index: parseInt(order_index) || 0 });
    req.session.success = 'Module added'; res.redirect(`/faculty/courses/${req.params.id}`);
  } catch (err) { console.error(err); req.session.error = 'Failed to add module'; res.redirect(`/faculty/courses/${req.params.id}`); }
};

exports.addLesson = async (req, res) => {
  try {
    const { module_id, title, content_type, content_url, content_text, order_index } = req.body;
    await supabaseAdmin.from('lessons').insert({ module_id, title, content_type, content_url: content_url || null, content_text: content_text || null, order_index: parseInt(order_index) || 0 });
    req.session.success = 'Lesson added'; res.redirect(`/faculty/courses/${req.params.id}`);
  } catch (err) { console.error(err); req.session.error = 'Failed to add lesson'; res.redirect(`/faculty/courses/${req.params.id}`); }
};

exports.assignments = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: assignments } = await supabaseAdmin.from('assignments').select('*, courses(title)').eq('created_by', userId).order('due_date', { ascending: false });
    const { data: courseLinks } = await supabaseAdmin.from('course_faculty').select('courses(id, title)').eq('faculty_id', userId);
    const myCourses = (courseLinks || []).map(cl => cl.courses).filter(Boolean);
    res.render('faculty/assignments', { title: 'Assignments', activePage: 'assignments', assignments: assignments || [], myCourses });
  } catch (err) { console.error(err); req.session.error = 'Failed to load assignments'; res.redirect('/faculty'); }
};

exports.addAssignment = async (req, res) => {
  try {
    const { course_id, title, description, due_date, max_marks } = req.body;
    await supabaseAdmin.from('assignments').insert({ course_id, title, description, due_date, max_marks: parseInt(max_marks) || 100, created_by: req.session.user.id });
    req.session.success = 'Assignment created'; res.redirect('/faculty/assignments');
  } catch (err) { console.error(err); req.session.error = 'Failed to create assignment'; res.redirect('/faculty/assignments'); }
};

exports.grades = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: assignments } = await supabaseAdmin.from('assignments').select('id, title, max_marks, courses(title)').eq('created_by', userId);
    const assignmentIds = (assignments || []).map(a => a.id);
    let submissions = [];
    if (assignmentIds.length > 0) {
      const { data } = await supabaseAdmin.from('submissions').select('*, student:profiles(full_name, user_id), assignment:assignments(title, max_marks)').in('assignment_id', assignmentIds).order('submitted_at', { ascending: false });
      submissions = data || [];
    }
    res.render('faculty/grades', { title: 'Grading', activePage: 'grades', submissions, assignments: assignments || [] });
  } catch (err) { console.error(err); req.session.error = 'Failed to load grading'; res.redirect('/faculty'); }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { marks_obtained, feedback } = req.body;
    await supabaseAdmin.from('submissions').update({ marks_obtained: parseInt(marks_obtained), feedback, status: 'graded' }).eq('id', req.params.id);
    req.session.success = 'Submission graded'; res.redirect('/faculty/grades');
  } catch (err) { console.error(err); req.session.error = 'Failed to grade'; res.redirect('/faculty/grades'); }
};

exports.attendance = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { data: courseLinks } = await supabaseAdmin.from('course_faculty').select('courses(id, title, class_id, classes(id, name))').eq('faculty_id', userId);
    const myClasses = [];
    const seen = new Set();
    (courseLinks || []).forEach(cl => {
      if (cl.courses && cl.courses.classes && !seen.has(cl.courses.classes.id)) {
        seen.add(cl.courses.classes.id);
        myClasses.push(cl.courses.classes);
      }
    });
    let students = [], records = [];
    const classId = req.query.class_id;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    if (classId) {
      const { data: s } = await supabaseAdmin.from('profiles').select('id, full_name, user_id').eq('role', 'student').eq('class_id', classId);
      students = s || [];
      const { data: r } = await supabaseAdmin.from('attendance').select('*').eq('class_id', classId).eq('attendance_date', date);
      records = r || [];
    }
    res.render('faculty/attendance', {
      title: 'Attendance', activePage: 'attendance', myClasses, students, records,
      selectedClass: classId || '', selectedDate: date
    });
  } catch (err) { console.error(err); req.session.error = 'Failed to load attendance'; res.redirect('/faculty'); }
};

exports.markAttendance = async (req, res) => {
  try {
    const { class_id, attendance_date, ...statuses } = req.body;
    // Delete old records for this date/class
    await supabaseAdmin.from('attendance').delete().eq('class_id', class_id).eq('attendance_date', attendance_date);
    const records = [];
    Object.keys(statuses).forEach(key => {
      if (key.startsWith('status_')) {
        const studentId = key.replace('status_', '');
        records.push({ student_id: studentId, class_id, attendance_date, status: statuses[key], marked_by: req.session.user.id });
      }
    });
    if (records.length > 0) await supabaseAdmin.from('attendance').insert(records);
    req.session.success = 'Attendance saved'; res.redirect(`/faculty/attendance?class_id=${class_id}&date=${attendance_date}`);
  } catch (err) { console.error(err); req.session.error = 'Failed to save attendance'; res.redirect('/faculty/attendance'); }
};

exports.announcements = async (req, res) => {
  try {
    const { data: announcements } = await supabaseAdmin.from('announcements').select('*')
      .or(`target_role.eq.all,target_role.eq.faculty,created_by.eq.${req.session.user.id}`)
      .order('created_at', { ascending: false });
    const { data: courseLinks } = await supabaseAdmin.from('course_faculty').select('courses(id, title)').eq('faculty_id', req.session.user.id);
    const myCourses = (courseLinks || []).map(cl => cl.courses).filter(Boolean);
    res.render('faculty/announcements', { title: 'Announcements', activePage: 'announcements', announcements: announcements || [], myCourses });
  } catch (err) { console.error(err); req.session.error = 'Failed to load announcements'; res.redirect('/faculty'); }
};

exports.addAnnouncement = async (req, res) => {
  try {
    const { title, content, target_role } = req.body;
    await supabaseAdmin.from('announcements').insert({ title, content, target_role: target_role || 'all', created_by: req.session.user.id });
    req.session.success = 'Announcement posted'; res.redirect('/faculty/announcements');
  } catch (err) { console.error(err); req.session.error = 'Failed to post'; res.redirect('/faculty/announcements'); }
};
