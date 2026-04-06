const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const faculty = require('../controllers/facultyController');

router.use(requireRole('faculty'));

router.get('/', faculty.dashboard);
router.get('/courses', faculty.courses);
router.get('/courses/:id', faculty.courseDetail);
router.post('/courses/:id/modules', faculty.addModule);
router.post('/courses/:id/lessons', faculty.addLesson);
router.get('/assignments', faculty.assignments);
router.post('/assignments', faculty.addAssignment);
router.get('/grades', faculty.grades);
router.post('/grades/:id', faculty.gradeSubmission);
router.get('/attendance', faculty.attendance);
router.post('/attendance', faculty.markAttendance);
router.get('/announcements', faculty.announcements);
router.post('/announcements', faculty.addAnnouncement);

module.exports = router;
