const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const student = require('../controllers/studentController');

router.use(requireRole('student'));

router.get('/', student.dashboard);
router.get('/courses', student.courses);
router.get('/courses/:id', student.courseDetail);
router.get('/assignments', student.assignments);
router.post('/assignments/submit', student.submitAssignment);
router.get('/grades', student.grades);
router.get('/timetable', student.timetable);
router.get('/attendance', student.attendance);
router.get('/announcements', student.announcements);

module.exports = router;
