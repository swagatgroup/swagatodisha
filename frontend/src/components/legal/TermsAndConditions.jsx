import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="max-h-96 overflow-y-auto text-sm text-gray-600 space-y-4">
            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">1. Application Process</h5>
                <p>
                    By submitting this application, you agree to provide accurate and complete information.
                    Any false or misleading information may result in rejection of your application or
                    termination of admission if discovered later.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">2. Document Verification</h5>
                <p>
                    All submitted documents will be verified for authenticity. The institution reserves
                    the right to request additional documents or verification at any time during the
                    admission process.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">3. Fee Structure</h5>
                <p>
                    The fee structure is subject to change as per institutional policies. All fees
                    are non-refundable once paid, except in cases of course cancellation by the
                    institution. Payment must be made as per the prescribed schedule.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">4. Academic Standards</h5>
                <p>
                    Students must maintain minimum academic standards as prescribed by the institution.
                    Failure to meet these standards may result in academic probation or dismissal.
                    Regular attendance and participation in all academic activities are mandatory.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">5. Code of Conduct</h5>
                <p>
                    All students must adhere to the institution's code of conduct and disciplinary
                    policies. Any violation may result in disciplinary action including suspension
                    or expulsion. Students are expected to maintain high standards of behavior both
                    on and off campus.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">6. Privacy and Data Protection</h5>
                <p>
                    Your personal information will be used for academic and administrative purposes
                    only. The institution will not share your personal data with third parties
                    without your consent, except as required by law or for legitimate institutional
                    purposes.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">7. Admission Criteria</h5>
                <p>
                    Admission is subject to meeting all eligibility criteria, availability of seats,
                    and performance in entrance examinations (if applicable). The institution reserves
                    the right to modify admission criteria at any time.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">8. Course Modifications</h5>
                <p>
                    The institution reserves the right to modify course curriculum, schedule, or
                    delivery methods as per academic requirements and regulatory guidelines.
                    Students will be informed of any significant changes in advance.
                </p>
            </div>

            <div className="border-b pb-4">
                <h5 className="font-semibold text-gray-900 mb-2">9. Refund Policy</h5>
                <p>
                    Refunds will be processed as per the institution's refund policy. Application
                    fees are generally non-refundable. Tuition fee refunds are subject to specific
                    terms and conditions outlined in the fee structure.
                </p>
            </div>

            <div>
                <h5 className="font-semibold text-gray-900 mb-2">10. Governing Law</h5>
                <p>
                    These terms and conditions are governed by the laws of India. Any disputes
                    arising from this application or admission process will be subject to the
                    jurisdiction of the courts in the state where the institution is located.
                </p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> By checking the "I agree" box, you confirm that you have
                    read, understood, and agree to be bound by these terms and conditions. Please read
                    them carefully before proceeding with your application.
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditions;