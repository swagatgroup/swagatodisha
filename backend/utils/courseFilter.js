// Dashboard course filters (query params) -> StudentApplication match on the course copy stored at registration.
// courseCategory: BOARD | UNIVERSITY; courseSession only applies to BOARD, semester (1..N) only to UNIVERSITY.
// Returns null when no course filter is active.
const buildCourseFilter = ({ courseCategory, courseSession, semester } = {}) => {
    if (!['BOARD', 'UNIVERSITY'].includes(courseCategory)) return null;
    const filter = { 'courseDetails.category': courseCategory };
    if (courseCategory === 'BOARD' && courseSession) {
        filter['courseDetails.session'] = String(courseSession).toUpperCase();
    }
    if (courseCategory === 'UNIVERSITY' && semester && Number.isInteger(Number(semester))) {
        filter['courseDetails.semesters'] = Number(semester);
    }
    return filter;
};

module.exports = { buildCourseFilter };
