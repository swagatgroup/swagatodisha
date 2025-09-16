import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        1. Introduction
                    </h2>
                    <p className="mb-4">
                        Swagat Group of Institutions ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application system and services.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        2. Information We Collect
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                2.1 Personal Information
                            </h3>
                            <p className="mb-2">We may collect the following personal information:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Name, email address, phone number, and contact details</li>
                                <li>Date of birth, gender, and demographic information</li>
                                <li>Academic records and educational background</li>
                                <li>Address and location information</li>
                                <li>Parent/Guardian information</li>
                                <li>Identity documents (Aadhar card, passport, etc.)</li>
                                <li>Photographs and signatures</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                2.2 Technical Information
                            </h3>
                            <p className="mb-2">We may automatically collect:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>IP address and device information</li>
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Pages visited and time spent on our website</li>
                                <li>Referring website information</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        3. How We Use Your Information
                    </h2>
                    <div className="space-y-4">
                        <p>We use your information for the following purposes:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Processing and evaluating your application</li>
                            <li>Communicating with you about your application status</li>
                            <li>Providing academic and administrative services</li>
                            <li>Maintaining academic records and transcripts</li>
                            <li>Conducting research and analytics (anonymized data)</li>
                            <li>Complying with legal and regulatory requirements</li>
                            <li>Improving our services and user experience</li>
                            <li>Sending important updates and notifications</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        4. Information Sharing and Disclosure
                    </h2>
                    <div className="space-y-4">
                        <p>We may share your information in the following circumstances:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li><strong>With your consent:</strong> When you explicitly agree to share your information</li>
                            <li><strong>Service providers:</strong> With trusted third parties who assist us in operating our services</li>
                            <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Academic institutions:</strong> With partner institutions for academic purposes</li>
                            <li><strong>Government agencies:</strong> As required by regulatory authorities</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        5. Data Security
                    </h2>
                    <div className="space-y-4">
                        <p>We implement appropriate security measures to protect your information:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Encryption of sensitive data during transmission and storage</li>
                            <li>Regular security audits and assessments</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Secure data centers and infrastructure</li>
                            <li>Employee training on data protection</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        6. Data Retention
                    </h2>
                    <p className="mb-4">
                        We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Academic records may be retained indefinitely for historical and verification purposes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        7. Your Rights
                    </h2>
                    <div className="space-y-4">
                        <p>You have the following rights regarding your personal information:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li><strong>Access:</strong> Request access to your personal information</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                            <li><strong>Objection:</strong> Object to processing of your personal information</li>
                            <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        8. Cookies and Tracking Technologies
                    </h2>
                    <div className="space-y-4">
                        <p>We use cookies and similar technologies to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Remember your preferences and settings</li>
                            <li>Analyze website traffic and usage patterns</li>
                            <li>Improve website functionality and user experience</li>
                            <li>Provide personalized content and services</li>
                        </ul>
                        <p>You can control cookie settings through your browser preferences.</p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        9. Third-Party Links
                    </h2>
                    <p className="mb-4">
                        Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        10. Children's Privacy
                    </h2>
                    <p className="mb-4">
                        Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        11. International Data Transfers
                    </h2>
                    <p className="mb-4">
                        Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        12. Changes to This Privacy Policy
                    </h2>
                    <p className="mb-4">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        13. Contact Us
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <p className="mb-2">
                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <p className="mb-2">
                            <strong>Data Protection Officer</strong><br />
                            Swagat Group of Institutions
                        </p>
                        <p className="mb-2">
                            Email: privacy@swagatgroup.edu.in
                        </p>
                        <p className="mb-2">
                            Phone: [Contact Number]
                        </p>
                        <p>
                            Address: [Institution Address]
                        </p>
                    </div>
                </section>

                <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        This Privacy Policy is effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
