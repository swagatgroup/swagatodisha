// Mock data for development when database is not available
const mockStaff = [
    {
        _id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@swagat.edu',
        phone: '9876543210',
        role: 'staff',
        department: 'Admissions',
        designation: 'Admission Officer',
        employeeId: 'STF24001',
        isActive: true,
        joiningDate: new Date('2024-01-15'),
        lastLogin: new Date('2024-12-19'),
        assignedAgents: []
    },
    {
        _id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@swagat.edu',
        phone: '9876543211',
        role: 'staff',
        department: 'Student Affairs',
        designation: 'Student Counselor',
        employeeId: 'STF24002',
        isActive: true,
        joiningDate: new Date('2024-02-20'),
        lastLogin: new Date('2024-12-18'),
        assignedAgents: []
    },
    {
        _id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@swagat.edu',
        phone: '9876543212',
        role: 'staff',
        department: 'Academics',
        designation: 'Academic Coordinator',
        employeeId: 'STF24003',
        isActive: true,
        joiningDate: new Date('2024-01-05'),
        lastLogin: new Date('2024-12-19'),
        assignedAgents: []
    }
];

const mockAgents = [
    {
        _id: '1',
        fullName: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phoneNumber: '9876543210',
        referralCode: 'AGRA24001',
        role: 'agent',
        isActive: true,
        isReferralActive: true,
        createdAt: new Date('2024-01-15'),
        referralStats: {
            totalReferrals: 15,
            approvedReferrals: 12,
            pendingReferrals: 3,
            totalCommission: 24000
        },
        assignedStaff: null
    },
    {
        _id: '2',
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        phoneNumber: '9876543211',
        referralCode: 'AGPR24002',
        role: 'agent',
        isActive: true,
        isReferralActive: true,
        createdAt: new Date('2024-02-20'),
        referralStats: {
            totalReferrals: 8,
            approvedReferrals: 6,
            pendingReferrals: 2,
            totalCommission: 12000
        },
        assignedStaff: {
            _id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@swagat.edu',
            department: 'Admissions',
            designation: 'Admission Officer',
            employeeId: 'STF24001'
        }
    },
    {
        _id: '3',
        fullName: 'Amit Singh',
        email: 'amit@example.com',
        phoneNumber: '9876543212',
        referralCode: 'AGAM24003',
        role: 'agent',
        isActive: true,
        isReferralActive: true,
        createdAt: new Date('2024-01-05'),
        referralStats: {
            totalReferrals: 22,
            approvedReferrals: 18,
            pendingReferrals: 4,
            totalCommission: 36000
        },
        assignedStaff: {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@swagat.edu',
            department: 'Student Affairs',
            designation: 'Student Counselor',
            employeeId: 'STF24002'
        }
    }
];

module.exports = {
    mockStaff,
    mockAgents
};
