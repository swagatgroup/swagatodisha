const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Student = require('../models/Student');
const StudentApplication = require('../models/StudentApplication');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

/**
 * Script to investigate user deletions
 * Usage: node backend/scripts/investigateUserDeletion.js [hoursAgo] [userId]
 */

async function investigateUserDeletion(hoursAgo = 24, userId = null) {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const startTime = new Date();
        startTime.setHours(startTime.getHours() - hoursAgo);

        console.log(`\n🔍 Investigating user deletions from the last ${hoursAgo} hours...`);
        console.log(`📅 Time range: ${startTime.toISOString()} to ${new Date().toISOString()}\n`);

        // 1. Check audit logs for any delete attempts
        console.log('1️⃣ Checking audit logs...');
        const auditLogs = await AuditLog.find({
            timestamp: { $gte: startTime },
            $or: [
                { resourceType: 'User' },
                { resourceType: 'Student' }, // Students have associated users
                { 'targetId': userId ? new mongoose.Types.ObjectId(userId) : { $exists: true } }
            ]
        })
        .sort({ timestamp: -1 })
        .populate('performedBy.userId', 'email role fullName')
        .lean();

        if (auditLogs.length > 0) {
            console.log(`   Found ${auditLogs.length} delete attempt(s) in audit logs:\n`);
            auditLogs.forEach((log, index) => {
                console.log(`   ${index + 1}. ${log.action} - ${log.resourceType}`);
                console.log(`      Target ID: ${log.targetId || 'N/A'}`);
                console.log(`      Performed by: ${log.performedBy?.email || 'Unknown'} (${log.performedBy?.role || 'Unknown'})`);
                console.log(`      Success: ${log.result?.success ? '✅' : '❌'}`);
                console.log(`      Time: ${new Date(log.timestamp).toLocaleString()}`);
                console.log(`      IP: ${log.requestDetails?.ip || 'Unknown'}`);
                console.log(`      URL: ${log.requestDetails?.url || 'Unknown'}`);
                if (log.result?.message) {
                    console.log(`      Message: ${log.result.message}`);
                }
                console.log('');
            });
        } else {
            console.log('   ⚠️  No delete attempts found in audit logs (system may have been implemented after deletion)\n');
        }

        // 2. Check for users that might have been deleted (check students for orphaned references)
        console.log('2️⃣ Checking for orphaned user references...');
        const students = await Student.find({
            createdAt: { $gte: startTime }
        }).select('user email fullName createdAt').lean();

        const orphanedUsers = [];
        for (const student of students) {
            if (student.user) {
                const userExists = await User.findById(student.user);
                if (!userExists) {
                    orphanedUsers.push({
                        studentId: student._id,
                        userId: student.user,
                        studentEmail: student.email,
                        studentName: student.fullName,
                        createdAt: student.createdAt
                    });
                }
            }
        }

        if (orphanedUsers.length > 0) {
            console.log(`   ⚠️  Found ${orphanedUsers.length} student(s) with missing user accounts:\n`);
            orphanedUsers.forEach((orphan, index) => {
                console.log(`   ${index + 1}. Student: ${orphan.studentName} (${orphan.studentEmail})`);
                console.log(`      Student ID: ${orphan.studentId}`);
                console.log(`      Missing User ID: ${orphan.userId}`);
                console.log(`      Created: ${new Date(orphan.createdAt).toLocaleString()}`);
                console.log('');
            });
        } else {
            console.log('   ✅ No orphaned user references found\n');
        }

        // 3. Check recent student deletions (which cascade to user deletions)
        console.log('3️⃣ Checking recent student deletions...');
        const recentStudentDeletions = await AuditLog.find({
            timestamp: { $gte: startTime },
            resourceType: 'Student',
            'result.success': true
        })
        .sort({ timestamp: -1 })
        .populate('performedBy.userId', 'email role fullName')
        .lean();

        if (recentStudentDeletions.length > 0) {
            console.log(`   Found ${recentStudentDeletions.length} successful student deletion(s):\n`);
            recentStudentDeletions.forEach((log, index) => {
                console.log(`   ${index + 1}. Student ID: ${log.targetId}`);
                console.log(`      Deleted by: ${log.performedBy?.email || 'Unknown'} (${log.performedBy?.role || 'Unknown'})`);
                console.log(`      Time: ${new Date(log.timestamp).toLocaleString()}`);
                console.log(`      IP: ${log.requestDetails?.ip || 'Unknown'}`);
                console.log(`      URL: ${log.requestDetails?.url || 'Unknown'}`);
                console.log('');
            });
        } else {
            console.log('   ℹ️  No recent student deletions found\n');
        }

        // 4. Check bulk deletions
        console.log('4️⃣ Checking bulk deletions...');
        const bulkDeletions = await AuditLog.find({
            timestamp: { $gte: startTime },
            action: { $in: ['BULK_DELETE_SUCCESS', 'BULK_DELETE_ATTEMPT'] },
            'result.success': true
        })
        .sort({ timestamp: -1 })
        .populate('performedBy.userId', 'email role fullName')
        .lean();

        if (bulkDeletions.length > 0) {
            console.log(`   Found ${bulkDeletions.length} bulk deletion(s):\n`);
            bulkDeletions.forEach((log, index) => {
                console.log(`   ${index + 1}. Resource Type: ${log.resourceType}`);
                console.log(`      Deleted Count: ${log.result?.deletedCount || log.targetIds?.length || 0}`);
                console.log(`      Target IDs: ${log.targetIds?.slice(0, 5).join(', ')}${log.targetIds?.length > 5 ? '...' : ''}`);
                console.log(`      Deleted by: ${log.performedBy?.email || 'Unknown'} (${log.performedBy?.role || 'Unknown'})`);
                console.log(`      Time: ${new Date(log.timestamp).toLocaleString()}`);
                console.log(`      IP: ${log.requestDetails?.ip || 'Unknown'}`);
                console.log('');
            });
        } else {
            console.log('   ℹ️  No bulk deletions found\n');
        }

        // 5. Summary
        console.log('\n📊 SUMMARY:');
        console.log(`   • Audit log entries: ${auditLogs.length}`);
        console.log(`   • Orphaned user references: ${orphanedUsers.length}`);
        console.log(`   • Student deletions: ${recentStudentDeletions.length}`);
        console.log(`   • Bulk deletions: ${bulkDeletions.length}`);

        if (auditLogs.length === 0 && orphanedUsers.length === 0) {
            console.log('\n⚠️  No evidence found. Possible reasons:');
            console.log('   • Deletion happened before audit logging was implemented');
            console.log('   • Deletion was done directly in database');
            console.log('   • Deletion was done through a different system/script');
            console.log('\n💡 Recommendation: Check MongoDB oplog or server logs for more information');
        }

        await mongoose.connection.close();
        console.log('\n✅ Investigation complete');

    } catch (error) {
        console.error('❌ Error during investigation:', error);
        process.exit(1);
    }
}

// Get command line arguments
const hoursAgo = process.argv[2] ? parseInt(process.argv[2]) : 24;
const userId = process.argv[3] || null;

investigateUserDeletion(hoursAgo, userId);

