import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ApplicationStatusSearch from '../ApplicationStatusSearch';
import { useAuth } from '../../contexts/AuthContext';
import { LuArrowUpRight, LuBriefcase, LuGraduationCap, LuLoaderCircle, LuUsers } from 'react-icons/lu';
import AuthShell from '../site/AuthShell';
import Icon from '../site/Icon';

const LoginPortal = () => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');

    // If we're loading, or if we have a token but user hasn't populated yet, show a loader.
    // This prevents the login UI from flashing if the user presses the Back button.
    if (loading || (token && !user)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sw-surface-muted" role="status" aria-live="polite">
                <Icon icon={LuLoaderCircle} size="lg" className="animate-spin" />
                <span className="sr-only">Loading</span>
            </div>
        );
    }

    // Double check localStorage to avoid React batching race conditions where logout() hasn't cleared context yet
    if (user && token) {
        const dashboardPath = {
            student: '/dashboard/student',
            user: '/dashboard/student',
            agent: '/dashboard/agent',
            staff: '/dashboard/staff',
            super_admin: '/dashboard/admin',
        }[user.role] || '/dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    const sections = [
        {
            id: 'student',
            title: 'Student Login',
            icon: 'fa-solid fa-user-graduate',
            color: 'from-blue-500 to-cyan-500',
            link: '/login/student',
            description: 'Access your student dashboard, track applications, and manage your profile.'
        },
        {
            id: 'agent',
            title: 'Agent Login',
            icon: 'fa-solid fa-user-tie',
            color: 'from-[#4A1D7A] to-[#6B3F99]',
            link: '/login/agent',
            description: 'Manage your referrals, track commissions, and view student progress.'
        },
        {
            id: 'staff',
            title: 'Staff Login',
            icon: 'fa-solid fa-users-gear',
            color: 'from-green-500 to-emerald-500',
            link: '/login/staff',
            description: 'Staff portal for administrative tasks, reviews, and system management.'
        }
    ];

    const ICONS = {
        student: LuGraduationCap,
        agent: LuBriefcase,
        staff: LuUsers,
    }
    const PANES = {
        student: 'sw-pane-timetable',
        agent: 'sw-pane-career',
        staff: 'sw-pane-notice',
    }

    return (
        <AuthShell>
            <div className="w-full max-w-sw-container">
                <div className="mb-10 text-center">
                    <h1 className="text-sw-display font-bold">
                        Welcome to Swagat Odisha
                    </h1>
                    <p className="mt-3 text-sw-subtitle text-sw-text-secondary">
                        Please select your portal to continue or track your application
                    </p>
                </div>

                <ul className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <Link
                                to={section.link}
                                className="group flex h-full flex-col rounded-sw-md bg-sw-black p-4 text-sw-white transition-transform duration-sw ease-sw motion-safe:hover:-translate-y-1"
                            >
                                <span className={`sw-pane ${PANES[section.id]} flex aspect-[16/9] w-full items-center justify-center rounded-sw-sm`}>
                                    <Icon icon={ICONS[section.id]} size="xl" strokeWidth={1.25} />
                                </span>
                                <span className="mt-4 flex items-end justify-between gap-3">
                                    <span className="sw-text-gradient text-sw-h3 font-semibold">{section.title}</span>
                                    <Icon icon={LuArrowUpRight} size="md" strokeWidth={2.75} className="mb-0.5 shrink-0 text-sw-gray-300 transition-transform duration-sw-fast motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
                                </span>
                                <span className="mt-2 text-sw-body text-sw-text-on-dark-secondary">
                                    {section.description}
                                </span>
                                <span className="mt-4 text-sw-small font-semibold underline-offset-4 group-hover:underline">
                                    Login Now
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Track Your Application */}
                <ApplicationStatusSearch />
            </div>
        </AuthShell>
    );
};

export default LoginPortal;
