const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/StaffDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement was:
// <motion.div className="mb-8 w-full lg:w-1/2 mx-auto">
// {assignedAgentsUI}
// {/* ── Student View Toggle ── */}

// Let's replace the whole block back out and put the assignedAgentsUI BEFORE that motion.div.

const searchString = `                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-8 w-full lg:w-1/2 mx-auto"
                        >

                        {/* Assigned Agents Section */}`;

// Let's just do a regex replace to pull it out
// I'll undo and redo

