const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/UserManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add "Assigned Staff" to agent headers
content = content.replace(
    `                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Referrals
                                    </th>`,
    `                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Referrals
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Assigned Staff
                                    </th>`
);

// Add "Assigned Agents" to staff headers
content = content.replace(
    `                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>`,
    `                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Assigned Agents
                                </th>`
);

// Add agent data cells
content = content.replace(
    `                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {user.totalReferrals || 0} (₹{user.totalCommission ? user.totalCommission.toLocaleString() : '0'})
                                        </td>
                                    </>`,
    `                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {user.totalReferrals || 0} (₹{user.totalCommission ? user.totalCommission.toLocaleString() : '0'})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {user.assignedStaff ? (user.assignedStaff.firstName + ' ' + user.assignedStaff.lastName) : 'Unassigned'}
                                        </td>
                                    </>`
);

// Add staff data cells
content = content.replace(
    `                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.department || 'N/A'}
                                    </td>
                                )}`,
    `                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.department || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.assignedAgents?.length || 0}
                                    </td>
                                )}`
);

// The Edit Agent modal already has Assign to Staff. Let's make sure it handles Staff Assignment logic too if needed. No, Staff Edit modal doesn't need "Assign to Agent".

fs.writeFileSync(file, content);
console.log("Patched UserManagement.jsx");
