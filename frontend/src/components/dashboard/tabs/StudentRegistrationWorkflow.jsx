import React from 'react';
import SinglePageStudentRegistration from '../../shared/SinglePageStudentRegistration';

const StudentRegistrationWorkflow = ({ onStudentUpdate }) => {
    return (
        <SinglePageStudentRegistration
            onStudentUpdate={onStudentUpdate}
            userRole="student"
            showTitle={true}
        />
    );
};

export default StudentRegistrationWorkflow;