const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(requireRole('admin'));

router.get('/', admin.dashboard);
router.get('/students', admin.students);
router.post('/students', admin.addStudent);
router.post('/students/:id/delete', admin.deleteStudent);
router.get('/faculty', admin.faculty);
router.post('/faculty', admin.addFaculty);
router.post('/faculty/:id/delete', admin.deleteFaculty);
router.get('/classes', admin.classes);
router.post('/classes', admin.addClass);
router.post('/classes/:id/delete', admin.deleteClass);
router.get('/courses', admin.courses);
router.post('/courses', admin.addCourse);
router.post('/courses/:id/delete', admin.deleteCourse);
router.get('/timetable', admin.timetable);
router.post('/timetable', admin.addTimetableEntry);
router.get('/attendance', admin.attendance);
router.get('/announcements', admin.announcements);
router.post('/announcements', admin.addAnnouncement);
router.post('/announcements/:id/delete', admin.deleteAnnouncement);

module.exports = router;
