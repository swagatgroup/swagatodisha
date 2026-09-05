const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/admin/UserManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix staff headers
content = content.replace(
    `                            {userType === 'staff' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Assigned Agents
                                </th>
                            )}`,
    `                            {userType === 'staff' && (
                                <>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Assigned Agents
                                </th>
                                </>
                            )}`
);

// Fix staff cells
content = content.replace(
    `                                {userType === 'staff' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.department || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.assignedAgents?.length || 0}
                                    </td>
                                )}`,
    `                                {userType === 'staff' && (
                                    <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.department || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {user.assignedAgents?.length || 0}
                                    </td>
                                    </>
                                )}`
);

fs.writeFileSync(file, content);
console.log("Fixed adjacent JSX elements.");
