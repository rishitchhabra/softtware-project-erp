const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 'Lunch', 5, 6, 7, 8];
const MAX_TEACHER_PERIODS_PER_DAY = 6;

// ─── Sections ───────────────────────────────────────────────
router.get('/sections', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tt_sections')
    .select('id, class_id, name, display_order').order('display_order').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/sections', async (req, res) => {
  const { classId, name } = req.body;
  if (!classId || !name) return res.status(400).json({ error: 'Missing classId or name' });
  const { data, error } = await supabaseAdmin.from('tt_sections')
    .insert({ class_id: classId, name }).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Auto-add subjects assigned to this class
  const { data: sc } = await supabaseAdmin.from('tt_subject_classes').select('subject_id').eq('class_id', classId);
  if (sc && sc.length > 0) {
    const rows = sc.map(r => ({ section_id: data.id, subject_id: r.subject_id }));
    await supabaseAdmin.from('tt_section_subjects').insert(rows);
  }
  res.status(201).json(data);
});

router.delete('/sections', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing section id' });
  const { error } = await supabaseAdmin.from('tt_sections').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Subject-Class (assign course to class + periods/week) ──
router.post('/subject-classes', async (req, res) => {
  const { subjectId, classId, periodsPerWeek } = req.body;
  if (!subjectId || !classId) return res.status(400).json({ error: 'Missing subjectId or classId' });
  const { error } = await supabaseAdmin.from('tt_subject_classes')
    .upsert({ subject_id: subjectId, class_id: classId, periods_per_week: periodsPerWeek || 0 },
      { onConflict: 'subject_id,class_id' });
  if (error) return res.status(500).json({ error: error.message });

  // Also add to all sections of this class
  const { data: sections } = await supabaseAdmin.from('tt_sections').select('id').eq('class_id', classId);
  if (sections && sections.length > 0) {
    const rows = sections.map(s => ({ section_id: s.id, subject_id: subjectId }));
    await supabaseAdmin.from('tt_section_subjects')
      .upsert(rows, { onConflict: 'section_id,subject_id' });
  }
  res.status(201).json({ success: true });
});

router.put('/subject-classes', async (req, res) => {
  const { subjectId, classId, periodsPerWeek } = req.body;
  if (!subjectId || !classId) return res.status(400).json({ error: 'Missing fields' });
  const { error } = await supabaseAdmin.from('tt_subject_classes')
    .update({ periods_per_week: periodsPerWeek || 0 })
    .eq('subject_id', subjectId).eq('class_id', classId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.delete('/subject-classes', async (req, res) => {
  const { subjectId, classId } = req.query;
  if (!subjectId || !classId) return res.status(400).json({ error: 'Missing fields' });
  await supabaseAdmin.from('tt_subject_classes').delete()
    .eq('subject_id', subjectId).eq('class_id', classId);

  // Remove from all sections of this class
  const { data: sections } = await supabaseAdmin.from('tt_sections').select('id').eq('class_id', classId);
  if (sections && sections.length > 0) {
    for (const s of sections) {
      await supabaseAdmin.from('tt_section_subjects').delete()
        .eq('section_id', s.id).eq('subject_id', subjectId);
    }
  }
  res.json({ success: true });
});

// ─── Section Subjects ───────────────────────────────────────
router.put('/section-subjects', async (req, res) => {
  const { sectionId, subjectId, periodsPerWeek } = req.body;
  if (!sectionId || !subjectId) return res.status(400).json({ error: 'Missing fields' });
  const { error } = await supabaseAdmin.from('tt_section_subjects')
    .update({ periods_per_week: periodsPerWeek })
    .eq('section_id', sectionId).eq('subject_id', subjectId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Teacher-Subject Map ────────────────────────────────────
router.get('/teacher-subject-map', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tt_teacher_subject_map').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(r => ({
    teacherId: r.teacher_id, subjectId: r.subject_id,
    classId: r.class_id, sectionId: r.section_id || null
  })));
});

router.post('/teacher-subject-map', async (req, res) => {
  const { teacherId, subjectId, classId, sectionId } = req.body;
  if (!teacherId || !subjectId || !classId) return res.status(400).json({ error: 'Missing fields' });
  const row = { teacher_id: teacherId, subject_id: subjectId, class_id: classId };
  if (sectionId) row.section_id = sectionId;
  const { error } = await supabaseAdmin.from('tt_teacher_subject_map').upsert(row);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true });
});

router.delete('/teacher-subject-map', async (req, res) => {
  const { teacherId, subjectId, classId, sectionId } = req.query;
  if (!teacherId || !subjectId || !classId) return res.status(400).json({ error: 'Missing fields' });
  let query = supabaseAdmin.from('tt_teacher_subject_map').delete()
    .eq('teacher_id', teacherId).eq('subject_id', subjectId).eq('class_id', classId);
  if (sectionId) { query = query.eq('section_id', sectionId); }
  else { query = query.is('section_id', null); }
  const { error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Timetable CRUD ─────────────────────────────────────────
router.get('/timetable', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('tt_timetable_entries')
    .select('section_id, day, period, subject_id, teacher_id');
  if (error) return res.status(500).json({ error: error.message });

  const timetable = {};
  for (const { section_id, day, period, subject_id, teacher_id } of data || []) {
    if (!timetable[section_id]) timetable[section_id] = {};
    if (!timetable[section_id][day]) timetable[section_id][day] = {};
    timetable[section_id][day][period] = { subjectId: subject_id, teacherId: teacher_id };
  }
  res.json(timetable);
});

router.post('/timetable', async (req, res) => {
  const { sectionId, day, period, subjectId, teacherId } = req.body;
  if (!sectionId || !day || !period) return res.status(400).json({ error: 'Missing fields' });
  const { error } = await supabaseAdmin.from('tt_timetable_entries').upsert(
    { section_id: sectionId, day, period: String(period), subject_id: subjectId || null, teacher_id: teacherId || null },
    { onConflict: 'section_id,day,period' });
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true });
});

router.put('/timetable', async (req, res) => {
  const { entries } = req.body;
  if (!entries || !Array.isArray(entries)) return res.status(400).json({ error: 'Missing entries' });
  const rows = entries.map(e => ({
    section_id: e.sectionId, day: e.day, period: String(e.period),
    subject_id: e.subjectId || null, teacher_id: e.teacherId || null
  }));
  const { error } = await supabaseAdmin.from('tt_timetable_entries')
    .upsert(rows, { onConflict: 'section_id,day,period' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.delete('/timetable', async (req, res) => {
  const { sectionId, day, period } = req.query;
  if (!sectionId) return res.status(400).json({ error: 'Missing sectionId' });
  let query = supabaseAdmin.from('tt_timetable_entries').delete().eq('section_id', sectionId);
  if (day) query = query.eq('day', day);
  if (period) query = query.eq('period', period);
  const { error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Full Data Endpoint (loads everything for the timetable page) ──
router.get('/data', async (req, res) => {
  try {
    const [
      classesRes, facultyRes, coursesRes, sectionsRes,
      subjectClassesRes, sectionSubjectsRes, teacherMapRes, timetableRes
    ] = await Promise.all([
      supabaseAdmin.from('classes').select('id, name, grade_level').order('grade_level').order('name'),
      supabaseAdmin.from('profiles').select('id, full_name, user_id').eq('role', 'faculty').order('full_name'),
      supabaseAdmin.from('courses').select('id, title, code').order('title'),
      supabaseAdmin.from('tt_sections').select('*').order('display_order').order('name'),
      supabaseAdmin.from('tt_subject_classes').select('*'),
      supabaseAdmin.from('tt_section_subjects').select('*'),
      supabaseAdmin.from('tt_teacher_subject_map').select('*'),
      supabaseAdmin.from('tt_timetable_entries').select('section_id, day, period, subject_id, teacher_id')
    ]);

    // Build classes with sections
    const classes = (classesRes.data || []).map(cls => {
      const classSections = (sectionsRes.data || []).filter(s => s.class_id === cls.id);
      return {
        ...cls,
        sections: classSections.map(sec => {
          const subs = (sectionSubjectsRes.data || []).filter(ss => ss.section_id === sec.id);
          return { id: sec.id, name: sec.name, displayOrder: sec.display_order, subjects: subs.map(s => s.subject_id) };
        })
      };
    });

    // Build subjects with class/section periods
    const subjects = (coursesRes.data || []).map(c => {
      const classIds = (subjectClassesRes.data || []).filter(sc => sc.subject_id === c.id).map(sc => sc.class_id);
      const classPeriods = {};
      (subjectClassesRes.data || []).filter(sc => sc.subject_id === c.id).forEach(sc => {
        classPeriods[sc.class_id] = sc.periods_per_week;
      });
      const sectionPeriods = {};
      (sectionSubjectsRes.data || []).filter(ss => ss.subject_id === c.id && ss.periods_per_week != null).forEach(ss => {
        sectionPeriods[ss.section_id] = ss.periods_per_week;
      });
      return { id: c.id, name: c.title, code: c.code, classIds, classPeriods, sectionPeriods };
    });

    // Teachers
    const teachers = (facultyRes.data || []).map(f => ({
      id: f.id, name: f.full_name, teacherCode: f.user_id
    }));

    // Teacher-subject map
    const teacherSubjectMap = (teacherMapRes.data || []).map(r => ({
      teacherId: r.teacher_id, subjectId: r.subject_id,
      classId: r.class_id, sectionId: r.section_id || null
    }));

    // Timetable
    const timetable = {};
    for (const { section_id, day, period, subject_id, teacher_id } of timetableRes.data || []) {
      if (!timetable[section_id]) timetable[section_id] = {};
      if (!timetable[section_id][day]) timetable[section_id][day] = {};
      timetable[section_id][day][period] = { subjectId: subject_id, teacherId: teacher_id };
    }

    res.json({ classes, subjects, teachers, teacherSubjectMap, timetable, DAYS, PERIODS });
  } catch (err) {
    console.error('TT data error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Generate Algorithm (Period-Consistent) ─────────────────
router.post('/generate', async (req, res) => {
  const { sectionId, classId, teacherSelections } = req.body;
  if (!sectionId || !classId) return res.status(400).json({ error: 'Missing sectionId or classId' });

  try {
    // Load all data needed for generation
    const [classesRes, sectionsRes, subjectClassesRes, sectionSubjectsRes, teacherMapRes, timetableRes] = await Promise.all([
      supabaseAdmin.from('classes').select('id, name').order('name'),
      supabaseAdmin.from('tt_sections').select('*').order('display_order'),
      supabaseAdmin.from('tt_subject_classes').select('*'),
      supabaseAdmin.from('tt_section_subjects').select('*'),
      supabaseAdmin.from('tt_teacher_subject_map').select('*'),
      supabaseAdmin.from('tt_timetable_entries').select('section_id, day, period, subject_id, teacher_id')
    ]);

    // Build class+section structure
    const classes = (classesRes.data || []).map(cls => ({
      ...cls,
      sections: (sectionsRes.data || []).filter(s => s.class_id === cls.id).map(sec => ({
        id: sec.id, name: sec.name,
        subjects: (sectionSubjectsRes.data || []).filter(ss => ss.section_id === sec.id).map(ss => ss.subject_id)
      }))
    }));

    // Build timetableData
    const timetableData = {};
    for (const { section_id, day, period, subject_id, teacher_id } of timetableRes.data || []) {
      if (!timetableData[section_id]) timetableData[section_id] = {};
      if (!timetableData[section_id][day]) timetableData[section_id][day] = {};
      timetableData[section_id][day][period] = { subjectId: subject_id, teacherId: teacher_id };
    }

    // Find the section
    const section = classes.find(c => c.id === classId)?.sections?.find(s => s.id === sectionId);
    if (!section) return res.status(404).json({ error: 'Section not found' });
    const sectionSubjectIds = section.subjects || [];

    // Build subject requirements
    const teachingPeriods = PERIODS.filter(p => p !== 'Lunch');
    const requirements = [];
    for (const subId of sectionSubjectIds) {
      const sc = (subjectClassesRes.data || []).find(r => r.subject_id === subId && r.class_id === classId);
      const ss = (sectionSubjectsRes.data || []).find(r => r.subject_id === subId && r.section_id === sectionId);
      const ppw = ss?.periods_per_week ?? sc?.periods_per_week ?? 0;
      if (ppw === 0) continue;

      const selectedTeacher = teacherSelections?.[subId] || null;
      const allTeachers = [...new Set(
        (teacherMapRes.data || [])
          .filter(m => m.subject_id === subId && m.class_id === classId && (!m.section_id || m.section_id === sectionId))
          .map(m => m.teacher_id)
      )];

      const courseName = (await supabaseAdmin.from('courses').select('title').eq('id', subId).single()).data?.title || 'Unknown';
      requirements.push({ subjectId: subId, subjectName: courseName, periodsPerWeek: ppw, teacherId: selectedTeacher, teachers: allTeachers });
    }

    // Sort: most periods first, then fewest teachers
    requirements.sort((a, b) => {
      if (b.periodsPerWeek !== a.periodsPerWeek) return b.periodsPerWeek - a.periodsPerWeek;
      return a.teachers.length - b.teachers.length;
    });

    // Build teacher busy map from OTHER sections
    const teacherBusy = {};
    const teacherDayCount = {};
    for (const cls of classes) {
      for (const sec of cls.sections) {
        if (sec.id === sectionId) continue;
        const saved = timetableData[sec.id] || {};
        for (const day of DAYS) {
          for (const period of teachingPeriods) {
            const cell = saved?.[day]?.[period];
            if (cell?.teacherId) {
              const tid = cell.teacherId;
              if (!teacherBusy[tid]) teacherBusy[tid] = {};
              if (!teacherBusy[tid][day]) teacherBusy[tid][day] = {};
              teacherBusy[tid][day][period] = true;
              if (!teacherDayCount[tid]) teacherDayCount[tid] = {};
              teacherDayCount[tid][day] = (teacherDayCount[tid][day] || 0) + 1;
            }
          }
        }
      }
    }

    // Local trackers
    const localBusy = {};
    const localDayCount = {};
    const isTeacherFree = (tid, day, period) => {
      if (teacherBusy[tid]?.[day]?.[period] || localBusy[tid]?.[day]?.[period]) return false;
      const existingCount = (teacherDayCount[tid]?.[day] || 0) + (localDayCount[tid]?.[day] || 0);
      return existingCount < MAX_TEACHER_PERIODS_PER_DAY;
    };
    const markBusy = (tid, day, period) => {
      if (!localBusy[tid]) localBusy[tid] = {};
      if (!localBusy[tid][day]) localBusy[tid][day] = {};
      localBusy[tid][day][period] = true;
      if (!localDayCount[tid]) localDayCount[tid] = {};
      localDayCount[tid][day] = (localDayCount[tid][day] || 0) + 1;
    };

    const grid = {};
    for (const day of DAYS) grid[day] = {};
    const warnings = [];

    // ─── Period-Consistent Assignment ───
    for (const req of requirements) {
      const tid = req.teacherId;
      if (!tid) {
        warnings.push({ subjectName: req.subjectName, message: 'No teacher selected — skipped' });
        continue;
      }
      let remaining = req.periodsPerWeek;

      const periodScores = teachingPeriods.map(period => {
        const freeDays = DAYS.filter(day => !grid[day][period] && isTeacherFree(tid, day, period));
        return { period, freeDays, score: freeDays.length };
      });
      periodScores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return Math.random() - 0.5;
      });

      for (const { period, freeDays } of periodScores) {
        if (remaining <= 0) break;
        const shuffled = [...freeDays].sort(() => Math.random() - 0.5);
        for (const day of shuffled) {
          if (remaining <= 0) break;
          if (grid[day][period]) continue;
          if (!isTeacherFree(tid, day, period)) continue;
          grid[day][period] = { subjectId: req.subjectId, teacherId: tid };
          markBusy(tid, day, period);
          remaining--;
        }
      }

      if (remaining > 0) {
        warnings.push({ subjectName: req.subjectName, message: `Only ${req.periodsPerWeek - remaining}/${req.periodsPerWeek} periods placed` });
      }
    }

    res.json({ grid, warnings, requirements });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Apply Generated Timetable ──────────────────────────────
router.post('/apply', async (req, res) => {
  const { sectionId, grid } = req.body;
  if (!sectionId || !grid) return res.status(400).json({ error: 'Missing sectionId or grid' });

  try {
    // 1. Clear existing entries
    await supabaseAdmin.from('tt_timetable_entries').delete().eq('section_id', sectionId);

    // 2. Build and insert new entries
    const entries = [];
    for (const day in grid) {
      for (const period in grid[day]) {
        const cell = grid[day][period];
        if (cell) {
          entries.push({
            section_id: sectionId, day, period: String(period),
            subject_id: cell.subjectId || null, teacher_id: cell.teacherId || null
          });
        }
      }
    }
    if (entries.length > 0) {
      const { error } = await supabaseAdmin.from('tt_timetable_entries')
        .upsert(entries, { onConflict: 'section_id,day,period' });
      if (error) throw error;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
