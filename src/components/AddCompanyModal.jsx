import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AddCompanyModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState(""); // ✅ use email
  const [password, setPassword] = useState(""); // ✅ use password
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await api.post(
        "/company/create",
        { name, url, email, password }, // ✅ updated payload
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
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          placeholder="Domain"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <input
          type="email"
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`px-5 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-semibold transition-all ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:from-blue-500 hover:to-teal-400"
            }`}
          >
            {loading ? "Adding..." : "Add"}
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
