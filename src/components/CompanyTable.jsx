import { useState } from "react";
import CompanyModal from "./AddCompanyModal";
import UploadContextModal from "./UploadContextModal";
import api from "../services/api";
import { toast } from "react-toastify";
import AddChatbotModal from "./AddChatbotModal";

const CompanyTable = ({ companies, refresh }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const handleCreateChatbot = async (companyId, name) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await api.post(
        "/chatbot/create",
        { companyId, name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Chatbot created ✅");
      refresh();
    } catch (error) {
      console.error(
        "Error creating chatbot:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to create chatbot.");
    }
  };

  const handleDeleteChatbot = async (chatbotId) => {
    if (!window.confirm("Are you sure you want to delete this chatbot?"))
      return;

    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/chatbot/delete/${chatbotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Chatbot deleted");
      refresh();
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast.error("Failed to delete chatbot.");
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (
      !window.confirm(
        "This will delete the company and all its chatbots. Continue?"
      )
    )
      return;

    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/company/delete/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Company deleted");
      refresh();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company.");
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left text-gray-700 border-separate border-spacing-y-2">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Domain</th>
            <th className="p-3">Upload</th>
            <th className="p-3">Del Chatbot</th>
            <th className="p-3">Del Company</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company._id}
              className="bg-white border border-gray-200 rounded-md shadow hover:shadow-md transition"
            >
              <td className="p-3">{company.name}</td>
              <td className="p-3">{company.url}</td>

              <td className="p-3">
                {company.chatbots?.length > 0 ? (
                  <UploadContextModal chatbotId={company.chatbots[0]._id} />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              <td className="p-3">
                {Array.isArray(company.chatbots) &&
                company.chatbots.length > 0 ? (
                  <button
                    onClick={() => handleDeleteChatbot(company.chatbots[0]._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium"
                  >
                    Delete Chatbot
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowAddModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-medium"
                  >
                    Create Chatbot
                  </button>
                )}
              </td>

              <td className="p-3">
                <button
                  onClick={() => handleDeleteCompany(company._id)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded font-medium"
                >
                  Delete Company
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && selectedCompany && (
        <AddChatbotModal
          company={selectedCompany}
          onClose={() => {
            setSelectedCompany(null);
            setShowAddModal(false);
          }}
          onCreate={handleCreateChatbot}
        />
      )}

      {showCompanyModal && selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => {
            setSelectedCompany(null);
            setShowCompanyModal(false);
          }}
          refresh={refresh}
        />
      )}
    </div>
  );
};

export default CompanyTable;
