const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Admin = require('../models/Admin');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swagatodisha', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Generate unique referral code
const generateUniqueReferralCode = async (user, isAdmin = false) => {
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
        let generatedCode;

        if (isAdmin) {
            // Admin referral code generation
            const namePrefix = user.firstName ? user.firstName.substring(0, 3).toLowerCase() : 'xxx';
            const phoneSuffix = user.phone ? user.phone.slice(-2) : '00';
            const roleMap = {
                'staff': 'o',
                'super_admin': 't'
            };
            const roleLetter = roleMap[user.role] || 'a';
            const yearSuffix = new Date().getFullYear().toString().slice(-2);
            generatedCode = `${namePrefix}${phoneSuffix}${roleLetter}${yearSuffix}`;
        } else {
            // User referral code generation
            const namePrefix = user.fullName ? user.fullName.substring(0, 3).toLowerCase() : 'xxx';
            const phoneSuffix = user.phoneNumber ? user.phoneNumber.slice(-2) : '00';
            const roleMap = {
                'student': 's',
                'agent': 'a',
                'staff': 'o',
                'super_admin': 't'
            };
            const roleLetter = roleMap[user.role] || 'u';
            const yearSuffix = new Date().getFullYear().toString().slice(-2);
            generatedCode = `${namePrefix}${phoneSuffix}${roleLetter}${yearSuffix}`;
        }

        // Check if code already exists in both collections
        const existingUser = await User.findOne({ referralCode: generatedCode });
        const existingAdmin = await Admin.findOne({ referralCode: generatedCode });

        if (!existingUser && !existingAdmin) {
            return generatedCode;
        }

        attempts++;
    }

    // Fallback: use timestamp-based code
    const timestamp = Date.now().toString().slice(-4);
    const rolePrefix = isAdmin ? 'adm' : 'usr';
    const roleLetter = isAdmin ? (user.role === 'staff' ? 'o' : 't') : (user.role.charAt(0));
    return `${rolePrefix}${timestamp}${roleLetter}25`;
};

// Add referral codes to existing users
const addReferralCodesToUsers = async () => {
    try {
        console.log('🔍 Finding users without referral codes...');

        const usersWithoutCodes = await User.find({
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });

        console.log(`📊 Found ${usersWithoutCodes.length} users without referral codes`);

        let successCount = 0;
        let errorCount = 0;

        for (const user of usersWithoutCodes) {
            try {
                const referralCode = await generateUniqueReferralCode(user, false);

                await User.findByIdAndUpdate(user._id, {
                    referralCode: referralCode,
                    isReferralActive: true
                });

                console.log(`✅ User ${user.email} (${user.role}) -> ${referralCode}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error updating user ${user.email}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📈 User Results: ${successCount} successful, ${errorCount} errors`);
        return { success: successCount, errors: errorCount };
    } catch (error) {
        console.error('Error processing users:', error);
        return { success: 0, errors: 1 };
    }
};

// Add referral codes to existing admins
const addReferralCodesToAdmins = async () => {
    try {
        console.log('🔍 Finding admins without referral codes...');

        const adminsWithoutCodes = await Admin.find({
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });

        console.log(`📊 Found ${adminsWithoutCodes.length} admins without referral codes`);

        let successCount = 0;
        let errorCount = 0;

        for (const admin of adminsWithoutCodes) {
            try {
                const referralCode = await generateUniqueReferralCode(admin, true);

                await Admin.findByIdAndUpdate(admin._id, {
                    referralCode: referralCode,
                    isReferralActive: true
                });

                console.log(`✅ Admin ${admin.email} (${admin.role}) -> ${referralCode}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error updating admin ${admin.email}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n📈 Admin Results: ${successCount} successful, ${errorCount} errors`);
        return { success: successCount, errors: errorCount };
    } catch (error) {
        console.error('Error processing admins:', error);
        return { success: 0, errors: 1 };
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();

        console.log('🚀 Starting referral code migration...\n');

        // Process users
        const userResults = await addReferralCodesToUsers();

        console.log('\n' + '='.repeat(50) + '\n');

        // Process admins
        const adminResults = await addReferralCodesToAdmins();

        console.log('\n' + '='.repeat(50));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`Users: ${userResults.success} successful, ${userResults.errors} errors`);
        console.log(`Admins: ${adminResults.success} successful, ${adminResults.errors} errors`);
        console.log(`Total: ${userResults.success + adminResults.success} successful, ${userResults.errors + adminResults.errors} errors`);

        // Verify all users now have referral codes
        console.log('\n🔍 Verifying all accounts have referral codes...');

        const usersWithoutCodes = await User.countDocuments({
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });

        const adminsWithoutCodes = await Admin.countDocuments({
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });

        if (usersWithoutCodes === 0 && adminsWithoutCodes === 0) {
            console.log('✅ SUCCESS: All accounts now have referral codes!');
        } else {
            console.log(`⚠️  WARNING: ${usersWithoutCodes} users and ${adminsWithoutCodes} admins still without referral codes`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the migration
if (require.main === module) {
    main();
}

module.exports = { addReferralCodesToUsers, addReferralCodesToAdmins };
