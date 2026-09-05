const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/backend/controllers/adminController.js';
let content = fs.readFileSync(file, 'utf8');

const oldUpdateAgent = `exports.updateAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        // Remove password from update data
        delete updateData.password;

        const agent = await User.findByIdAndUpdate(
            agentId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.json({
            success: true,
            message: 'Agent updated successfully',
            data: agent
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating agent',
            error: error.message
        });
    }
};`;

const newUpdateAgent = `exports.updateAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const updateData = req.body;

        delete updateData.password;

        // First find the existing agent to check assignedStaff changes
        const existingAgent = await User.findById(agentId);
        if (!existingAgent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        // Handle assignment changes
        if (updateData.assignedStaff !== undefined && String(updateData.assignedStaff) !== String(existingAgent.assignedStaff)) {
            // Remove from old staff if exists
            if (existingAgent.assignedStaff) {
                await Admin.findByIdAndUpdate(existingAgent.assignedStaff, {
                    $pull: { assignedAgents: agentId }
                });
            }
            
            // Add to new staff if provided
            if (updateData.assignedStaff) {
                await Admin.findByIdAndUpdate(updateData.assignedStaff, {
                    $addToSet: { assignedAgents: agentId }
                });
            }
        }

        const agent = await User.findByIdAndUpdate(
            agentId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password').populate('assignedStaff', 'firstName lastName email department designation employeeId');

        res.json({
            success: true,
            message: 'Agent updated successfully',
            data: agent
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating agent',
            error: error.message
        });
    }
};`;

if(content.includes('exports.updateAgent = async')) {
    content = content.replace(oldUpdateAgent, newUpdateAgent);
    fs.writeFileSync(file, content);
    console.log("Updated updateAgent!");
} else {
    console.log("Could not find updateAgent block");
}
