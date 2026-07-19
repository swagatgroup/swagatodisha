export const STATUS_COLORS = {
    DRAFT: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        hex: '#6B7280'
    },
    SUBMITTED: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        hex: '#6366F1'
    },
    UNDER_REVIEW: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        hex: '#EAB308'
    },
    APPROVED: {
        bg: 'bg-teal-100',
        text: 'text-teal-800',
        hex: '#14B8A6'
    },
    COMPLETE: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        hex: '#22C55E'
    },
    COMPLETED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        hex: '#22C55E'
    },
    REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        hex: '#EF4444'
    },
    CANCELLED: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        hex: '#A855F7'
    },
    PENDING: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        hex: '#F97316'
    },
    RESUBMITTED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        hex: '#3B82F6'
    },
    ACTIVE: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        hex: '#22C55E'
    },
    INACTIVE: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        hex: '#6B7280'
    },
    VERIFIED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        hex: '#22C55E'
    },
    DEFAULT: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        hex: '#9CA3AF'
    }
};

export const getStatusBadgeClasses = (status) => {
    if (!status) return `${STATUS_COLORS.DEFAULT.bg} ${STATUS_COLORS.DEFAULT.text}`;
    const normalizedStatus = status.toString().toUpperCase().trim();
    const colorObj = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.DEFAULT;
    return `${colorObj.bg} ${colorObj.text}`;
};

export const getStatusHexColor = (status) => {
    if (!status) return STATUS_COLORS.DEFAULT.hex;
    const normalizedStatus = status.toString().toUpperCase().trim();
    const colorObj = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.DEFAULT;
    return colorObj.hex;
};
