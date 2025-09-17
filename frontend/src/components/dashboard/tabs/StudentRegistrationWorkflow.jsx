import React from 'react';
import UniversalStudentRegistration from '../../shared/UniversalStudentRegistration';

const StudentRegistrationWorkflow = ({ onStudentUpdate }) => {
    return (
        <UniversalStudentRegistration
            onStudentUpdate={onStudentUpdate}
            userRole="student"
            showTitle={true}
        />
    );
};

export default StudentRegistrationWorkflow;