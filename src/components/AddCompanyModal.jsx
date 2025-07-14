import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AddCompanyModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await api.post(
        "/company/create",
        { name, url },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Company added successfully.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add company.");
      console.error("Failed to add company:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl border border-gray-200 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Company</h2>

        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Domain"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`px-5 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-semibold shadow-md transition-all ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:from-blue-500 hover:to-teal-400"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Adding...
              </div>
            ) : (
              "Add"
            )}
          </button>

          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;
