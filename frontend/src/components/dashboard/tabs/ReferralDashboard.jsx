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
            const response = await api.get('/api/students/referral-data');
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
        const shareText = `Join Swagat Group of Institutions! Use my referral code: ${referralData.referralCode} and get ₹500 bonus when you enroll! 🎓✨`;

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
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Refer & Earn</h2>
                <p className="text-gray-600">Invite your friends to join Swagat and earn ₹500 for each successful referral!</p>
            </div>

            {/* Referral Code Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
            >
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Your Referral Code</h3>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="bg-white/20 rounded-lg px-4 py-2 text-2xl font-mono font-bold">
                            {referralData.referralCode}
                        </div>
                        <button
                            onClick={copyReferralCode}
                            className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors duration-200"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-blue-100 text-sm">
                        Share this code with your friends to earn rewards!
                    </p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                            <p className="text-2xl font-semibold text-gray-900">{referralData.totalReferrals}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Successful</p>
                            <p className="text-2xl font-semibold text-gray-900">{referralData.successfulReferrals}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">{referralData.pendingReferrals}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-lg shadow p-6"
                >
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p className="text-2xl font-semibold text-gray-900">₹{referralData.totalEarnings}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Share Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Referral Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={shareReferralLink}
                        className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Share via Social Media
                    </button>
                    <button
                        onClick={copyReferralCode}
                        className="flex items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Referral Code
                    </button>
                </div>
            </motion.div>

            {/* Recent Referrals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Referrals</h3>
                </div>
                <div className="p-6">
                    {referralData.recentReferrals.length > 0 ? (
                        <div className="space-y-4">
                            {referralData.recentReferrals.map((referral, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-sm">
                                                {referral.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">{referral.name}</p>
                                            <p className="text-sm text-gray-500">{referral.course}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${referral.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-800' :
                                                referral.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {referral.status}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">{formatDate(referral.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-500">No referrals yet. Start sharing your code!</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* How it Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-lg shadow p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How Refer & Earn Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-blue-600 font-bold text-lg">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Share Your Code</h4>
                        <p className="text-sm text-gray-600">Share your referral code with friends and family</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-green-600 font-bold text-lg">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">They Enroll</h4>
                        <p className="text-sm text-gray-600">Your friend uses your code to register and enroll</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-purple-600 font-bold text-lg">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Earn ₹500</h4>
                        <p className="text-sm text-gray-600">You get ₹500 bonus when they successfully enroll</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ReferralDashboard;
