import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';

const ReferralDashboard = () => {
    const { user } = useAuth();
    const [referralData, setReferralData] = useState({
        referralCode: '',
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        recentReferrals: []
    });
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
            }
        } catch (error) {
            console.error('Error loading referral data:', error);
        } finally {
            setLoading(false);
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
                            <h4 className="font-semibold text-gray-800 text-sm">26 - 40 Referrals</h4>
                            <p className="text-2xl font-bold text-green-600 mt-2">₹4,000</p>
                            <p className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-wider">Per Student</p>
                        </div>
                        
                        {/* Tier 4 */}
                        <div className="border border-gray-200 rounded-xl p-5 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">4</div>
                            <h4 className="font-semibold text-gray-800 text-sm">40 - 100 Referrals</h4>
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
