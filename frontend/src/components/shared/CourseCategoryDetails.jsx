import React from 'react';

// Category / session / semesters / duration of a course, shown read-only.
// `details` is either an application's courseDetails (stored copy) or a CollegeCourse.
// BOARD shows the session; UNIVERSITY shows semesters and duration. Missing values show "-".
// When a BOARD course has several sessions, pass sessionOptions + onSessionChange to let the user pick one.
const Item = ({ label, children }) => (
    <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-300">{label}</label>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{children}</div>
    </div>
);

const CourseCategoryDetails = ({ details = {}, sessionOptions = null, onSessionChange = null, sessionError = '' }) => {
    const category = details?.category;
    const duration = details?.durationYears ? `${details.durationYears} ${details.durationYears === 1 ? 'YEAR' : 'YEARS'}` : '-';

    return (
        <>
            <Item label="CATEGORY">{category || '-'}</Item>
            {category === 'BOARD' && (
                <Item label="SESSION">
                    {onSessionChange && sessionOptions?.length > 1 ? (
                        <>
                            <select
                                value={details.session || ''}
                                onChange={(e) => onSessionChange(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4A1D7A] focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">SELECT SESSION</option>
                                {sessionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {sessionError && <p className="text-red-500 text-sm mt-1">{sessionError}</p>}
                        </>
                    ) : (details.session || '-')}
                </Item>
            )}
            {category === 'UNIVERSITY' && (
                <>
                    <Item label="SEMESTERS">{details.semesters || '-'}</Item>
                    <Item label="DURATION">{duration}</Item>
                </>
            )}
            {!category && <Item label="SESSION / SEMESTER">-</Item>}
        </>
    );
};

export default CourseCategoryDetails;
