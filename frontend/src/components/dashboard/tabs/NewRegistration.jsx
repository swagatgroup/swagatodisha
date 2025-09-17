import React from 'react';
import UniversalStudentRegistration from '../../shared/UniversalStudentRegistration';

const NewRegistration = ({ onStudentUpdate }) => {
    return (
        <UniversalStudentRegistration
            onStudentUpdate={onStudentUpdate}
            userRole="staff"
            showTitle={true}
        />
    );
};

export default NewRegistration;
