import { useState } from 'react';
import { motion } from 'framer-motion';
import SliderManagement from './SliderManagement';
import QuickAccessManagement from './QuickAccessManagement';

const WebsiteManagement = () => {
    const [activeTab, setActiveTab] = useState('sliders');

    const tabs = [
        { id: 'sliders', name: 'Slider Management', icon: 'fa-solid fa-images' },
        { id: 'quick-access', name: 'Quick Access Documents', icon: 'fa-solid fa-file-lines' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Website Management</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage homepage sliders and quick access documents
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <i className={`${tab.icon} mr-2`}></i>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'sliders' && <SliderManagement />}
                    {activeTab === 'quick-access' && <QuickAccessManagement />}
                </div>
            </div>
        </div>
    );
};

export default WebsiteManagement;

