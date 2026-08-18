import React from 'react';
import SinglePageStudentRegistration from '../../shared/SinglePageStudentRegistration';
import { useAuth } from '../../../contexts/AuthContext';

const StudentRegistrationWorkflow = ({ onStudentUpdate }) => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    return (
        <SinglePageStudentRegistration
            onStudentUpdate={onStudentUpdate}
            userRole={user?.role || 'student'}
            showTitle={true}
            referralMode={!isStudent}
            prefilledReferralCode={!isStudent ? (user?.referralCode || '') : ''}
        />
    );
};

export default StudentRegistrationWorkflow;