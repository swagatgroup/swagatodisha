import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/sweetAlert';

const ReferralDashboard = () => {
    const { user } = useAuth();
    const [referralData, setReferralData] = useState({
        referralCode: '',
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        recentReferrals: [],
        financialDetails: null
    });
    const [bankDetails, setBankDetails] = useState({
        bankAccountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
        verificationStatus: 'PENDING',
        verificationNotes: ''
    });
    const [savingBank, setSavingBank] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/referral/data');
            if (response.data.success) {
                setReferralData(response.data.data);
                if (response.data.data.financialDetails) {
                    setBankDetails({
                        bankAccountNumber: response.data.data.financialDetails.bankAccountNumber || '',
                        ifscCode: response.data.data.financialDetails.ifscCode || '',
                        accountHolderName: response.data.data.financialDetails.accountHolderName || '',
                        bankName: response.data.data.financialDetails.bankName || '',
                        verificationStatus: response.data.data.financialDetails.verificationStatus || 'PENDING',
                        verificationNotes: response.data.data.financialDetails.verificationNotes || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBankDetailsSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingBank(true);
            const response = await api.put('/api/referral/bank-details', bankDetails);
            if (response.data.success) {
                showSuccess(response.data.message || 'Bank details updated successfully');
                // Update local state if the status changed to PENDING
                if (response.data.data) {
                    setBankDetails(prev => ({
                        ...prev,
                        verificationStatus: response.data.data.verificationStatus || 'PENDING',
                        verificationNotes: response.data.data.verificationNotes || ''
                    }));
                }
            }
        } catch (error) {
            console.error('Error updating bank details:', error);
            showError('Failed to update bank details');
        } finally {
            setSavingBank(false);
        }
    };

    const copyReferralCode = async () => {
        try {
            await navigator.clipboard.writeText(referralData.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying referral code:', error);
        }
    };

    const shareReferralLink = () => {
        const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;
        const shareText = `Join Swagat Group of Institutions! Use my referral code: ${referralData.referralCode} to register. 🎓✨`;

        if (navigator.share) {
            navigator.share({
                title: 'Join Swagat Group of Institutions',
                text: shareText,
                url: referralLink
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const fullText = `${shareText}\n\nRegister here: ${referralLink}`;
            navigator.clipboard.writeText(fullText);
            alert('Referral link copied to clipboard!');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Refer & Earn</h2>
                <p className="text-gray-600">Invite students to join Swagat and unlock exciting tiered rewards for each successful referral!</p>
            </div>

            {/* Referral Code Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg"
            >
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Your Referral Code</h3>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="bg-white/20 rounded-lg px-4 py-2 text-2xl font-mono font-bold tracking-wider">
                            {referralData.referralCode || 'N/A'}
                        </div>
                        <button
                            onClick={copyReferralCode}
                            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors duration-200 font-medium"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-blue-100 text-sm">
                        Share this code to earn massive rewards!
                    </p>
                </div>
            </motion.div>

            {/* Prize Notification */}
            {referralData.isEligibleForPrize && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 text-white shadow-lg text-center border-2 border-yellow-300"
                >
                    <h3 className="text-xl font-bold mb-1">🎉 Congratulations! You have reached 100+ Referrals! 🎉</h3>
                    <p className="text-yellow-50 font-medium">You are now eligible for a special prize (Bullet / iPhone 17 Pro Max). We will contact you soon!</p>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow-md border border-gray-100 p-6"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <i className="fa-solid fa-users text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                            <p className="text-2xl font-bold text-gray-900">{referralData.totalReferrals}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-md border border-gray-100 p-6"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <i className="fa-solid fa-check-circle text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Successful</p>
                            <p className="text-2xl font-bold text-gray-900">{referralData.successfulReferrals}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow-md border border-gray-100 p-6"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <i className="fa-solid fa-hourglass-half text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{referralData.pendingReferrals}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow-md border border-gray-100 p-6"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                            <i className="fa-solid fa-wallet text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-900">₹{referralData.totalEarnings}</p>
                            <p className="text-xs text-purple-500 font-medium mt-1">Tier-based rewards active</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Share Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Referral Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={shareReferralLink}
                        className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <i className="fa-solid fa-share-nodes mr-3 text-lg"></i>
                        Share via Social Media
                    </button>
                    <button
                        onClick={copyReferralCode}
                        className="flex items-center justify-center p-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors shadow-sm font-medium"
                    >
                        <i className="fa-regular fa-copy mr-3 text-lg"></i>
                        Copy Referral Code
                    </button>
                </div>
            </motion.div>

            {/* Rewards Tiers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
            >
                <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <i className="fa-solid fa-gift text-purple-600 mr-3"></i> 
                        Referral Benefits Tier 
                        {user?.role === 'agent' && (
                            <span className="text-sm text-red-500 font-semibold ml-3 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">* Terms & conditions apply</span>
                        )}
                    </h3>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Tier 1 */}
                        <div className="border border-gray-200 rounded-xl p-5 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">1</div>
                            <h4 className="font-semibold text-gray-800 text-sm">1 - 10 Referrals</h4>
                            <p className="text-2xl font-bold text-green-600 mt-2">₹2,000</p>
                            <p className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-wider">Per Student</p>
                        </div>
                        
                        {/* Tier 2 */}
                        <div className="border border-gray-200 rounded-xl p-5 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">2</div>
                            <h4 className="font-semibold text-gray-800 text-sm">11 - 25 Referrals</h4>
                            <p className="text-2xl font-bold text-green-600 mt-2">₹3,000</p>
                            <p className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-wider">Per Student</p>
                        </div>
                        
                        {/* Tier 3 */}
                        <div className="border border-gray-200 rounded-xl p-5 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">3</div>
                            <h4 className="font-semibold text-gray-800 text-sm">26 - 50 Referrals</h4>
                            <p className="text-2xl font-bold text-green-600 mt-2">₹4,000</p>
                            <p className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-wider">Per Student</p>
                        </div>
                        
                        {/* Tier 4 */}
                        <div className="border border-gray-200 rounded-xl p-5 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">4</div>
                            <h4 className="font-semibold text-gray-800 text-sm">51 - 100 Referrals</h4>
                            <p className="text-2xl font-bold text-green-600 mt-2">₹5,000</p>
                            <p className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-wider">Per Student</p>
                        </div>
                        
                        {/* Ultimate Tier */}
                        <div className="border-2 border-purple-400 bg-purple-50 rounded-xl p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl text-yellow-900 shadow-sm">ULTIMATE</div>
                            <div className="w-12 h-12 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-motorcycle"></i>
                            </div>
                            <h4 className="font-bold text-purple-900 text-sm">100+ Referrals</h4>
                            <p className="text-base font-extrabold text-purple-700 mt-2 leading-tight">Royal Enfield 350</p>
                            <p className="text-xs text-purple-500 font-semibold mt-0.5 tracking-tight">or iPhone 17 Pro Max</p>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50/80 border-l-4 border-blue-500 p-5 rounded-r-xl">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <i className="fa-solid fa-circle-info text-blue-500 mt-0.5 text-lg"></i>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">Future Years Benefit</h3>
                                <div className="text-sm text-blue-800 leading-relaxed">
                                    <p>If referred students continue their courses in the second year and third year (where applicable), you will get the <span className="font-bold">same referral amount again!</span> However, if anyone discontinues the course, the referrer will not receive the amount for those future years.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bank Details Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
            >
                <div className="border-b border-gray-100 pb-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <i className="fa-solid fa-building-columns text-blue-600 mr-2"></i>
                            Bank Account Details for Payouts
                        </h3>
                        <div>
                            {bankDetails.verificationStatus === 'VERIFIED' && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Verified</span>
                            )}
                            {bankDetails.verificationStatus === 'PENDING' && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Pending Verification</span>
                            )}
                            {bankDetails.verificationStatus === 'REJECTED' && (
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">Rejected</span>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Add your bank details to receive referral earnings.</p>
                    
                    {bankDetails.verificationStatus === 'REJECTED' && bankDetails.verificationNotes && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600"><span className="font-semibold">Rejection Reason:</span> {bankDetails.verificationNotes}</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder's Name</label>
                            <input
                                type="text"
                                required
                                value={bankDetails.accountHolderName}
                                onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="As per bank records"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                required
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="e.g. State Bank of India"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                required
                                value={bankDetails.bankAccountNumber}
                                onChange={(e) => setBankDetails({...bankDetails, bankAccountNumber: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter account number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                            <input
                                type="text"
                                required
                                value={bankDetails.ifscCode}
                                onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="e.g. SBIN0001234"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={savingBank}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium disabled:opacity-50"
                        >
                            {savingBank ? 'Saving...' : 'Save Bank Details'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium mb-1">Note: Verification Required</p>
                    <p className="text-sm text-blue-700">Team Swagat Odisha will verify these details. While claiming the amount, once you add everything, please contact Team Swagat Odisha for help.</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                        <a href="tel:+919876543210" className="inline-flex items-center text-sm font-medium text-blue-900 bg-white px-3 py-1.5 rounded shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors">
                            <i className="fa-solid fa-phone mr-2"></i> +91 98765 43210
                        </a>
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-green-700 bg-white px-3 py-1.5 rounded shadow-sm border border-green-200 hover:bg-green-50 transition-colors">
                            <i className="fa-brands fa-whatsapp mr-2"></i> WhatsApp Support
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* Recent Referrals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-lg shadow-sm border border-gray-100"
            >
                <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Recent Referrals</h3>
                </div>
                <div className="p-6">
                    {referralData.recentReferrals.length > 0 ? (
                        <div className="space-y-3">
                            {referralData.recentReferrals.map((referral, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                                    <div className="flex items-center mb-3 sm:mb-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                                            <span className="text-blue-700 font-bold text-sm">
                                                {referral.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-bold text-gray-900">{referral.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{referral.course}</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right ml-14 sm:ml-0">
                                        <span className={`inline-flex px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${referral.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                referral.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                    'bg-red-100 text-red-800 border border-red-200'
                                            }`}>
                                            {referral.status}
                                        </span>
                                        <p className="text-xs text-gray-500 font-medium mt-1.5">{formatDate(referral.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-users-slash text-2xl text-gray-400"></i>
                            </div>
                            <p className="text-gray-500 font-medium">No referrals yet. Start sharing your code to earn rewards!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ReferralDashboard;
