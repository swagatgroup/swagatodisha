import React from 'react';
import Swal from 'sweetalert2';

const SweetAlertTest = () => {
    const testSuccessAlert = () => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'This is a success alert test',
            confirmButtonColor: '#7c3aed'
        });
    };

    const testErrorAlert = () => {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'This is an error alert test',
            confirmButtonColor: '#7c3aed'
        });
    };

    const testWarningAlert = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Warning!',
            text: 'This is a warning alert test',
            confirmButtonColor: '#7c3aed'
        });
    };

    const testInfoAlert = () => {
        Swal.fire({
            icon: 'info',
            title: 'Information',
            text: 'This is an info alert test',
            confirmButtonColor: '#7c3aed'
        });
    };

    const testLoadingAlert = () => {
        Swal.fire({
            title: 'Loading...',
            text: 'Please wait',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Auto close after 3 seconds
        setTimeout(() => {
            Swal.close();
        }, 3000);
    };

    const testConfirmAlert = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, do it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#7c3aed'
                });
            }
        });
    };

    const testFormAlert = () => {
        Swal.fire({
            title: 'Submit your email',
            input: 'email',
            inputLabel: 'Email address',
            inputPlaceholder: 'Enter your email address',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Submitted!',
                    text: `Your email: ${result.value}`,
                    icon: 'success',
                    confirmButtonColor: '#7c3aed'
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        🍭 SweetAlert2 Test Suite
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button
                            onClick={testSuccessAlert}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            ✅ Success Alert
                        </button>

                        <button
                            onClick={testErrorAlert}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            ❌ Error Alert
                        </button>

                        <button
                            onClick={testWarningAlert}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            ⚠️ Warning Alert
                        </button>

                        <button
                            onClick={testInfoAlert}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            ℹ️ Info Alert
                        </button>

                        <button
                            onClick={testLoadingAlert}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            ⏳ Loading Alert
                        </button>

                        <button
                            onClick={testConfirmAlert}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            ❓ Confirm Alert
                        </button>

                        <button
                            onClick={testFormAlert}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            📝 Form Alert
                        </button>
                    </div>

                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            🎯 SweetAlert2 Features Implemented:
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✅ Success alerts with custom styling</li>
                            <li>✅ Error alerts with validation messages</li>
                            <li>✅ Loading alerts with spinner</li>
                            <li>✅ Form validation with SweetAlert</li>
                            <li>✅ Custom button colors (Purple theme)</li>
                            <li>✅ Auto-close timers</li>
                            <li>✅ Confirmation dialogs</li>
                            <li>✅ Input forms</li>
                        </ul>
                    </div>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                        >
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SweetAlertTest;
