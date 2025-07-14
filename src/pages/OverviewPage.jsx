import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Bot,
  Building2,
  Users,
  MessageSquareText,
  BarChart3,
} from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <ClipLoader size={40} color="#4A90E2" loading={loading} />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-500">Failed to load stats.</p>;
  }

  const statData = [
    {
      label: "Total Chatbots",
      value: stats.totalChatbots,
      icon: (
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
          <Bot className="w-6 h-6" />
        </div>
      ),
    },
    {
      label: "Total Companies",
      value: stats.totalCompanies,
      icon: (
        <div className="bg-teal-100 text-teal-600 p-3 rounded-lg">
          <Building2 className="w-6 h-6" />
        </div>
      ),
    },
    {
      label: "Unique Users",
      value: stats.unique_users,
      icon: (
        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
          <Users className="w-6 h-6" />
        </div>
      ),
    },
    {
      label: "Total Messages",
      value: stats.totalMessages,
      icon: (
        <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
          <MessageSquareText className="w-6 h-6" />
        </div>
      ),
    },
    {
      label: "Monthly Tokens",
      value: stats.monthlyTokenUsage.toLocaleString(),
      icon: (
        <div className="bg-pink-100 text-pink-600 p-3 rounded-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statData.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center gap-4"
          >
            {stat.icon}
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
