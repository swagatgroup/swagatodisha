import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useSession } from "../../../contexts/SessionContext";
import api from "../../../utils/api";
import { showError } from "../../../utils/sweetAlert";
import AgentStudentFinancialsModal from "./AgentStudentFinancialsModal";
import { CurrencyRupeeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const AgentPaymentsTab = () => {
  const { selectedSession } = useSession();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [financialStudent, setFinancialStudent] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (selectedSession) {
      loadStudents();
    }
  }, [selectedSession, debouncedSearch]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {
        session: selectedSession,
        page: 1,
        limit: 1000,
        ...(debouncedSearch && { search: debouncedSearch })
      };

      const response = await api.get("/api/agents/my-students", { params });
      
      if (response.data.success) {
        const list = response.data.data?.students ?? response.data.data ?? [];
        setStudents(list);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error loading students for payments:", error);
      showError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Student Payments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage fee installments and upload payment slips for your students.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 w-64"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid / Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => {
                  const fin = student.financialStatus || {};
                  return (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.personalDetails?.fullName || "N/A"}</div>
                        <div className="text-sm text-gray-500">{student.contactDetails?.primaryPhone || "No Phone"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.courseDetails?.selectedCourse || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(fin.totalFees)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-green-600 font-medium">{formatCurrency(fin.paidAmount)} Paid</div>
                        <div className="text-red-500">{formatCurrency(fin.dueAmount)} Due</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          fin.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          fin.paymentStatus === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {fin.paymentStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setFinancialStudent(student);
                            setShowFinancialsModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-sm"
                        >
                          <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                          Manage Slips
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFinancialsModal && (
        <AgentStudentFinancialsModal
          student={financialStudent}
          onClose={() => {
            setShowFinancialsModal(false);
            setFinancialStudent(null);
            loadStudents(); // Trigger a refetch to ensure the table reflects any backend updates
          }}
          onUpdate={loadStudents}
        />
      )}
    </div>
  );
};

export default AgentPaymentsTab;
