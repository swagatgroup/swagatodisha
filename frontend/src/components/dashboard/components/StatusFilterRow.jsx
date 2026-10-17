import React from 'react';
import { APPLICATION_STATUSES } from '../../../utils/applicationStatuses';

// Shared status counter/filter row used by all dashboards
const StatusFilterRow = ({ counts = {}, activeKey = 'all', onSelect }) => (
    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 md:gap-3 mb-6">
        {APPLICATION_STATUSES.map(({ key, label, countKey, activeClass, inactiveClass }) => (
            <button
                key={key}
                type="button"
                onClick={() => onSelect && onSelect(key)}
                className={`px-2 py-3 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md ${
                    activeKey === key ? activeClass + ' shadow-lg scale-[1.02]' : inactiveClass
                }`}
            >
                <div className="flex flex-col items-center">
                    <span className="text-xs font-medium mb-1 opacity-80">{label}</span>
                    <span className="text-xl font-bold">{counts[countKey] || 0}</span>
                </div>
            </button>
        ))}
    </div>
);

export default StatusFilterRow;
