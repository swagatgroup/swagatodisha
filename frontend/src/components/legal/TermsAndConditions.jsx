import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                Terms and Conditions
            </h1>

            <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        1. Acceptance of Terms
                    </h2>
                    <p className="mb-4">
                        By accessing and using the Swagat Group of Institutions application system, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        2. Application Process
                    </h2>
                    <div className="space-y-4">
                        <p>
                            <strong>2.1 Eligibility:</strong> Applicants must meet the minimum eligibility criteria as specified for each course. False information provided during the application process will result in immediate disqualification.
                        </p>
                        <p>
                            <strong>2.2 Application Submission:</strong> All applications must be submitted through the official online portal. Incomplete applications will not be considered.
                        </p>
                        <p>
                            <strong>2.3 Document Verification:</strong> All submitted documents will be verified for authenticity. Any forged or fraudulent documents will result in immediate rejection of the application.
                        </p>
                        <p>
                            <strong>2.4 Application Fee:</strong> Application fees, if applicable, are non-refundable except in cases of technical errors on our part.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        3. Admission Process
                    </h2>
                    <div className="space-y-4">
                        <p>
                            <strong>3.1 Selection Criteria:</strong> Admission will be based on merit, entrance examination scores, and other criteria as specified for each course.
                        </p>
                        <p>
                            <strong>3.2 Right to Modify:</strong> The institution reserves the right to modify admission criteria, selection process, or course offerings at any time.
                        </p>
                        <p>
                            <strong>3.3 Admission Decision:</strong> The admission decision is final and binding. No appeals will be entertained except in cases of technical errors.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        4. Fee Structure and Payment
                    </h2>
                    <div className="space-y-4">
                        <p>
                            <strong>4.1 Fee Payment:</strong> All fees must be paid as per the schedule provided. Late payment may result in additional charges or cancellation of admission.
                        </p>
                        <p>
                            <strong>4.2 Fee Refund:</strong> Fee refund policy will be as per the institution's guidelines and applicable government regulations.
                        </p>
                        <p>
                            <strong>4.3 Fee Revision:</strong> The institution reserves the right to revise fees with prior notice to students.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        5. Academic Regulations
                    </h2>
                    <div className="space-y-4">
                        <p>
                            <strong>5.1 Attendance:</strong> Students must maintain minimum attendance as per university/institution guidelines.
                        </p>
                        <p>
                            <strong>5.2 Academic Performance:</strong> Students must maintain satisfactory academic performance throughout the course.
                        </p>
                        <p>
                            <strong>5.3 Code of Conduct:</strong> All students must adhere to the institution's code of conduct and disciplinary policies.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        6. Privacy and Data Protection
                    </h2>
                    <div className="space-y-4">
                        <p>
                            <strong>6.1 Data Collection:</strong> We collect personal information necessary for the application and admission process.
                        </p>
                        <p>
                            <strong>6.2 Data Usage:</strong> Personal data will be used solely for academic and administrative purposes.
                        </p>
                        <p>
                            <strong>6.3 Data Security:</strong> We implement appropriate security measures to protect your personal information.
                        </p>
                        <p>
                            <strong>6.4 Data Sharing:</strong> Personal information will not be shared with third parties without your consent, except as required by law.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        7. Intellectual Property
                    </h2>
                    <div className="space-y-4">
                        <p>
                            <strong>7.1 Course Materials:</strong> All course materials, including lectures, notes, and resources, are the intellectual property of the institution.
                        </p>
                        <p>
                            <strong>7.2 Usage Rights:</strong> Students may use course materials for personal academic purposes only.
                        </p>
                        <p>
                            <strong>7.3 Prohibited Use:</strong> Unauthorized distribution, reproduction, or commercial use of course materials is strictly prohibited.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        8. Limitation of Liability
                    </h2>
                    <div className="space-y-4">
                        <p>
                            The institution shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of this application system or any services provided.
                        </p>
                        <p>
                            We do not guarantee uninterrupted access to the application system and shall not be liable for any technical issues or downtime.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        9. Termination
                    </h2>
                    <div className="space-y-4">
                        <p>
                            The institution reserves the right to terminate or suspend any application or admission at any time for violation of these terms and conditions.
                        </p>
                        <p>
                            Students may withdraw their application at any time before the admission process is completed.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        10. Governing Law
                    </h2>
                    <p>
                        These terms and conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the jurisdiction of the courts in Odisha.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        11. Contact Information
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <p className="mb-2">
                            <strong>Swagat Group of Institutions</strong>
                        </p>
                        <p className="mb-2">
                            Address: [Institution Address]
                        </p>
                        <p className="mb-2">
                            Phone: [Contact Number]
                        </p>
                        <p className="mb-2">
                            Email: [Email Address]
                        </p>
                        <p>
                            Website: [Website URL]
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        12. Changes to Terms
                    </h2>
                    <p>
                        We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting on our website. Continued use of our services after changes constitutes acceptance of the new terms.
                    </p>
                </section>

                <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        By using our application system, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
