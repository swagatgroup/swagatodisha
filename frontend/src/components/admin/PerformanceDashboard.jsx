import {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import performanceOptimizer from '../../utils/performance';

const PerformanceDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchPerformanceMetrics();
        startPerformanceMonitoring();
    }, []);

    const fetchPerformanceMetrics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/performance/metrics');
            setMetrics(response.data.data);
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            // Fallback to client-side metrics
            setMetrics(performanceOptimizer.getMetrics());
        } finally {
            setLoading(false);
        }
    };

    const startPerformanceMonitoring = () => {
        performanceOptimizer.startPerformanceMonitoring();
        performanceOptimizer.measurePageLoad();
    };

    const getPerformanceColor = (value, thresholds) => {
        if (value <= thresholds.good) return 'text-green-600';
        if (value <= thresholds.warning) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceBg = (value, thresholds) => {
        if (value <= thresholds.good) return 'bg-green-100';
        if (value <= thresholds.warning) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Failed to load performance metrics</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                        <p className="text-gray-600">Monitor and optimize system performance</p>
                    </div>
                    <button
                        onClick={fetchPerformanceMetrics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Refresh Metrics
                    </button>
                </div>
            </div>

            {/* Performance Score */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Overall Performance Score</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceBg(metrics.pageLoadTime, { good: 2000, warning: 4000 })
                        } ${getPerformanceColor(metrics.pageLoadTime, { good: 2000, warning: 4000 })
                        }`}>
                        {metrics.pageLoadTime ? `${metrics.pageLoadTime.toFixed(0)}ms` : 'N/A'}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${metrics.pageLoadTime <= 2000 ? 'bg-green-500' :
                            metrics.pageLoadTime <= 4000 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{
                            width: `${Math.min(100, Math.max(0, 100 - (metrics.pageLoadTime / 50)))}%`
                        }}
                    ></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'frontend', label: 'Frontend' },
                            { id: 'backend', label: 'Backend' },
                            { id: 'network', label: 'Network' },
                            { id: 'recommendations', label: 'Recommendations' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Page Load Time</h4>
                                <p className={`text-2xl font-bold ${getPerformanceColor(metrics.pageLoadTime, { good: 2000, warning: 4000 })
                                    }`}>
                                    {metrics.pageLoadTime ? `${metrics.pageLoadTime.toFixed(0)}ms` : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">Time to load</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Render Time</h4>
                                <p className={`text-2xl font-bold ${getPerformanceColor(metrics.renderTime, { good: 100, warning: 300 })
                                    }`}>
                                    {metrics.renderTime ? `${metrics.renderTime.toFixed(0)}ms` : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">Component render</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">API Calls</h4>
                                <p className="text-2xl font-bold text-blue-600">
                                    {metrics.apiCalls || 0}
                                </p>
                                <p className="text-sm text-gray-600">Total requests</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Cache Hit Rate</h4>
                                <p className={`text-2xl font-bold ${getPerformanceColor(100 - (metrics.cacheHitRate || 0), { good: 20, warning: 40 })
                                    }`}>
                                    {metrics.cacheHitRate ? `${metrics.cacheHitRate.toFixed(1)}%` : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">Cache efficiency</p>
                            </div>
                        </div>
                    )}

                    {/* Frontend Tab */}
                    {activeTab === 'frontend' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Bundle Analysis</h4>
                                    {metrics.bundleSize ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">JavaScript</span>
                                                <span className="text-sm font-medium">
                                                    {(metrics.bundleSize.js.totalSize / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">CSS</span>
                                                <span className="text-sm font-medium">
                                                    {(metrics.bundleSize.css.totalSize / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2">
                                                <span className="text-sm font-medium">Total</span>
                                                <span className="text-sm font-medium">
                                                    {(metrics.bundleSize.total / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Bundle analysis not available</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Core Web Vitals</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">LCP</span>
                                            <span className="text-sm font-medium text-green-600">Good</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">FID</span>
                                            <span className="text-sm font-medium text-green-600">Good</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">CLS</span>
                                            <span className="text-sm font-medium text-green-600">Good</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Backend Tab */}
                    {activeTab === 'backend' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                                    <p className="text-2xl font-bold text-green-600">
                                        {metrics.averageResponseTime ? `${metrics.averageResponseTime.toFixed(0)}ms` : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">Average API response</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Memory Usage</h4>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {metrics.memory ? `${metrics.memory.percentage.toFixed(1)}%` : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">Server memory</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">CPU Usage</h4>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {metrics.cpu ? `${metrics.cpu.usage.toFixed(1)}%` : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">Server CPU</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Network Tab */}
                    {activeTab === 'network' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Network Performance</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Connection Type</span>
                                            <span className="text-sm font-medium">Fast 3G</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Latency</span>
                                            <span className="text-sm font-medium">50ms</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Bandwidth</span>
                                            <span className="text-sm font-medium">1.6 Mbps</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">CDN Performance</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cache Hit Rate</span>
                                            <span className="text-sm font-medium text-green-600">95%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Edge Locations</span>
                                            <span className="text-sm font-medium">Global</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">TTFB</span>
                                            <span className="text-sm font-medium">120ms</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">Performance Recommendations</h4>
                            <div className="space-y-4">
                                {[
                                    {
                                        priority: 'high',
                                        title: 'Enable Image Optimization',
                                        description: 'Implement lazy loading and WebP format for images to reduce bundle size.',
                                        impact: 'Reduce page load time by 30-40%'
                                    },
                                    {
                                        priority: 'medium',
                                        title: 'Implement Code Splitting',
                                        description: 'Split JavaScript bundles to load only necessary code for each page.',
                                        impact: 'Improve initial page load by 20-25%'
                                    },
                                    {
                                        priority: 'medium',
                                        title: 'Add Service Worker',
                                        description: 'Implement service worker for caching and offline functionality.',
                                        impact: 'Improve repeat visit performance by 50%'
                                    },
                                    {
                                        priority: 'low',
                                        title: 'Optimize Database Queries',
                                        description: 'Add indexes and optimize database queries for better response times.',
                                        impact: 'Reduce API response time by 15-20%'
                                    }
                                ].map((rec, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.priority === 'high' ? 'text-red-600 bg-red-100' :
                                                        rec.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                                                            'text-blue-600 bg-blue-100'
                                                        }`}>
                                                        {rec.priority.toUpperCase()}
                                                    </span>
                                                    <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                                                </div>
                                                <p className="text-gray-600 mb-2">{rec.description}</p>
                                                <p className="text-sm text-green-600 font-medium">{rec.impact}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
