import React from 'react';
import SinglePageStudentRegistration from '../../shared/SinglePageStudentRegistration';

const NewRegistration = ({ onStudentUpdate }) => {
    return (
        <SinglePageStudentRegistration
            onStudentUpdate={onStudentUpdate}
            userRole="staff"
            showTitle={true}
        />
    );
};

export default NewRegistration;
