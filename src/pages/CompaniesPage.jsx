import { useState, useEffect } from "react";
import api from "../services/api";
import CompanyTable from "../components/CompanyTable";
import AddCompanyModal from "../components/AddCompanyModal";
import ClipLoader from "react-spinners/ClipLoader";

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/company/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCompanies(res.data.companies);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <ClipLoader size={40} color="#4A90E2" loading={loading} />
      </div>
    );
  }

  if (!companies) {
    return <p className="text-red-500">Failed to load companies.</p>;
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          className="w-full md:max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Add Company
        </button>
      </div>

      <CompanyTable companies={filtered} refresh={fetchCompanies} />

      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCompanies}
        />
      )}
    </div>
  );
};

export default CompaniesPage;
