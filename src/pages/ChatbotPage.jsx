import { useEffect, useState } from "react";
import api from "../services/api";
import MessageHistory from "../components/MessageHistory";
import ClipLoader from "react-spinners/ClipLoader";
import UploadContextModal from "../components/UploadContextModal";
import EditClientConfigModal from "../components/EditClientConfigModal";

const MODAL_TYPES = {
  NONE: null,
  MESSAGE_HISTORY: "message_history",
  CONFIG: "config",
};

const ManageChatbotsPage = () => {
  const [chatbots, setChatbots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(MODAL_TYPES.NONE);
  const [editingId, setEditingId] = useState(null);
  const [newLimit, setNewLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [renewing, setRenewing] = useState(null);
  const [subscriptions, setSubscriptions] = useState({});
  const [selectedPlan, setSelectedPlan] = useState("1");
  const [availablePlans, setAvailablePlans] = useState([]);

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/chatbot/all", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setChatbots(res.data.chatbots || []);
    } catch (err) {
      console.error("Failed to fetch chatbots:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailablePlans(res.data.plans || []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  };

  useEffect(() => {
    fetchChatbots();
    fetchPlans();
  }, []);

  const fetchSubscription = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get(`/chatbot/${id}/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions((prev) => ({ ...prev, [id]: res.data.subscription }));
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    }
  };

  useEffect(() => {
    if (chatbots.length > 0) {
      chatbots.forEach((cb) => fetchSubscription(cb._id));
    }
  }, [chatbots]);

  const handleRenew = async (id) => {
    const token = localStorage.getItem("adminToken");
    const planDetails = availablePlans.find((p) => p._id === selectedPlan);
    const durationDays = planDetails?.duration_days || 30;
    const months = Math.ceil(durationDays / 30);

    if (!selectedPlan) {
      alert("Please select a plan.");
      return;
    }

    try {
      await api.post(
        `/chatbot/${id}/renew`,
        { plan_id: selectedPlan, months },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Plan renewed successfully");
      fetchSubscription(id);
      setRenewing(null);
    } catch (err) {
      console.error("Renewal error:", err);
      alert("❌ Renewal failed");
    }
  };

  const updateTokenLimit = async (id, limit) => {
    try {
      const token = localStorage.getItem("adminToken");
      await api.put(
        `/chatbot/update-token-limit/${id}`,
        { token_limit: parseInt(limit, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchChatbots();
      setEditingId(null);
      setNewLimit("");
    } catch (err) {
      console.error("Failed to update token limit:", err);
    }
  };

  const handleDownloadReport = async (chatbotId) => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem("adminToken");
      const response = await api.get(`/report/download/${chatbotId}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${chatbotId}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download report:", err);
      alert("❌ Failed to download report. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const filtered = chatbots.filter((cb) =>
    cb.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <ClipLoader size={40} color="#4A90E2" loading={loading} />
      </div>
    );
  }

  if (!chatbots) {
    return <p className="text-red-500">Failed to load chatbots.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <h2 className="text-3xl font-bold mb-6">🚀 Manage Chatbots</h2>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search chatbots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 rounded-lg bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-8">
        {filtered.map((cb) => {
          const sub = subscriptions[cb._id];
          const plan = sub?.plan_id;

          return (
          <div
            key={cb._id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {cb.name}
                </h3>
                <p className="text-sm text-gray-500">🏢 {cb.company_name}</p>
                <p className="text-sm text-gray-500">🌐 {cb.company_url}</p>
                <p className="text-xs text-gray-400">🆔 {cb._id}</p>
              </div>
              <UploadContextModal chatbotId={cb._id} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Stat
                label="📊 Token Usage (Monthly)"
                value={cb.used_tokens || 0}
              />
              <Stat label="💬 Total Messages" value={cb.total_messages || 0} />
              <Stat label="👥 Unique Users" value={cb.unique_users || 0} />
              <Stat
                label="🔋 Remaining Tokens"
                value={
                  cb.token_limit != null && cb.used_tokens != null
                    ? Math.max(cb.token_limit - cb.used_tokens, 0)
                    : "Unlimited"
                }
              />
              <div>
                <p className="text-sm text-gray-500">📦 Total Token Limit</p>
                {editingId === cb._id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300"
                    />
                    <button
                      onClick={() => updateTokenLimit(cb._id, newLimit)}
                      className="text-green-600"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setNewLimit("");
                      }}
                      className="text-red-500"
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-semibold text-gray-800">
                      {cb.token_limit || "Unlimited"}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(cb._id);
                        setNewLimit(cb.token_limit || "");
                      }}
                      className="text-blue-500"
                      title="Edit token limit"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Details */}
            <div className="col-span-full">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full">
                <p className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📦 <span>Plan Details</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-500">🏷️</span>
                    <span>
                      <strong>Name:</strong> {plan?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    <span>
                      <strong>Duration:</strong> {plan?.duration_days || "N/A"}{" "}
                      days
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">👥</span>
                    <span>
                      <strong>Max Users:</strong> {plan?.max_users || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">💰</span>
                    <span>
                      <strong>Price:</strong> ₹{plan?.price || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">⏳</span>
                    <span>
                      <strong>Expires:</strong>{" "}
                      {sub?.end_date
                        ? new Date(sub.end_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700">🙍‍♂️</span>
                    <span>
                      <strong>Users Used:</strong> {cb.unique_users} /{" "}
                      {plan?.max_users || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <ActionButton
                color="blue"
                onClick={() => {
                  setSelected(cb);
                  setShowModal(MODAL_TYPES.MESSAGE_HISTORY);
                }}
              >
                🧾 Message History
              </ActionButton>

              <ActionButton
                color="indigo"
                onClick={() => handleDownloadReport(cb._id)}
                disabled={isDownloading}
              >
                {isDownloading ? "⏳ Downloading..." : "📄 Download Report"}
              </ActionButton>

              <ActionButton color="green" onClick={() => setRenewing(cb._id)}>
                ♻️ Renew Plan
              </ActionButton>

              <ActionButton
                color="yellow"
                onClick={() => {
                  setSelected(cb);
                  setShowModal(MODAL_TYPES.CONFIG);
                }}
              >
                ⚙️ Edit Config
              </ActionButton>
            </div>
          </div>
          )
        })}
      </div>

      {/* Renew Plan Modal */}
      {renewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] relative shadow-lg">
            <button
              onClick={() => setRenewing(null)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Renew Plan
            </h3>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option disabled value="">
                Select a plan
              </option>
              {availablePlans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name} – ₹{plan.price} / {plan.duration_days} days (
                  {plan.max_users} users)
                </option>
              ))}
            </select>
            <button
              onClick={() => handleRenew(renewing)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Confirm Renew
            </button>
          </div>
        </div>
      )}

      {/* Message History Modal */}
      {showModal === MODAL_TYPES.MESSAGE_HISTORY && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-8 relative shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              🧾 Message History – {selected.name}
            </h3>
            <MessageHistory chatbotId={selected._id} />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowModal(MODAL_TYPES.NONE);
                  setSelected(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Config Modal */}
      {showModal === MODAL_TYPES.CONFIG && selected && (
        <EditClientConfigModal
          chatbot={selected}
          onClose={() => {
            setShowModal(MODAL_TYPES.NONE);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl mt-2 font-semibold text-gray-800">{value}</p>
  </div>
);

const ActionButton = ({
  children,
  onClick,
  color = "blue",
  disabled = false,
}) => {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-white rounded-lg font-medium shadow transition ${
        colors[color]
      } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};

export default ManageChatbotsPage;
