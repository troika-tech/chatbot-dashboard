import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import SessionModal from "../components/SessionModal";

const UserDashboard = () => {
  const [company, setCompany] = useState(null);
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sessionFilter, setSessionFilter] = useState("");
  const [allSessions, setAllSessions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sessionMessages, setSessionMessages] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [viewMode, setViewMode] = useState("email"); // default to 'session'
  const [allEmails, setAllEmails] = useState([]);

  const limit = 10;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
  }

  const fetchSubscription = async (chatbotId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get(`/chatbot/${chatbotId}/subscription`, {
        headers,
      });

      if (!res.data || !res.data.end_date) {
        toast.error("Subscription not found");
        return;
      }

      setPlan(res.data);
    } catch (err) {
      toast.error("Failed to fetch subscription");
      console.error("Failed to fetch subscription:", err);
    }
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [companyRes, usageRes] = await Promise.all([
        api.get("/user/company", { headers }),
        api.get("/user/usage", { headers }),
      ]);

      const companyData = companyRes.data;
      console.log("👉 Company Response:", companyData);
      setCompany(companyData);
      setUsage(usageRes.data);

      const chatbotId = companyData.chatbot_id;

      if (chatbotId) {
        await fetchSubscription(chatbotId); // ✅ Fetch plan
      } else {
        toast.error("❌ No chatbot ID found for this user.");
        setPlan(null); // Prevent crashing
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
      console.error("fetchData error:", err);
      setPlan(null); // Ensure no crash
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      let url = `/user/messages?page=${page}&limit=${limit}`;

      // Apply filter based on current view mode
      if (viewMode === "session" && sessionFilter) {
        url += `&session_id=${sessionFilter}`;
      } else if (viewMode === "email" && sessionFilter) {
        url += `&email=${sessionFilter}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(res.data.messages);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch messages");
      console.error(err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [sessionRes, emailRes] = await Promise.all([
        api.get("/user/sessions", { headers }),
        api.get("/user/messages/unique-emails", { headers }),
      ]);

      setAllSessions(sessionRes.data.sessions);
      console.log("Fetched emails:", emailRes.data.emails);

      setAllEmails(emailRes.data.emails); // if returned as objects
    } catch (err) {
      console.error("Failed to fetch filter options", err);
    }
  };

  const openSessionModal = async (sessionId) => {
    setSelectedSessionId(sessionId);
    try {
      const res = await api.get(
        `/user/messages?session_id=${sessionId}&limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSessionMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching session messages:", err);
    }
  };

  const fetchSessionIds = async () => {
    try {
      const res = await api.get("/user/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllSessions(res.data.sessions);
    } catch (err) {
      console.error("Failed to fetch session IDs", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFilterOptions(); // 👈 New
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMessages();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [page, sessionFilter, viewMode]);

  useEffect(() => {
    setPage(1); // reset to page 1 when session changes
  }, [sessionFilter, viewMode]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleDownload = async () => {
    try {
      const res = await api.get("/user/report/download", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `chatbot_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Report downloaded");
    } catch (err) {
      toast.error("Failed to download report");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-lg text-gray-700">Loading dashboard...</div>
    );
  if (!company || !plan || !usage)
    return (
      <div className="p-10 text-red-600 text-lg">
        Failed to load data. Please try again.
      </div>
    );

  return (
      <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 font-[Inter,sans-serif]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 User Dashboard
          </h1>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg shadow transition-all duration-200"
            >
              📄 Download Report
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg shadow transition-all duration-200"
            >
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              🏢 Company Details
            </h2>
            <p>
              <strong>Name:</strong> {company.name}
            </p>
            <p>
              <strong>Email:</strong> {company.email}
            </p>
            <p>
              <strong>Domain:</strong> {company.url}
            </p>
          </div>

          {plan ? (
            <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-indigo-500">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                📦 Plan Details
              </h2>
              <p>
                <strong>Plan:</strong> {plan.name}
              </p>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Days Remaining: {plan.days_remaining}</span>
                  <span>Validity: {plan.duration_days} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      plan.days_remaining / plan.duration_days < 0.2
                        ? "bg-red-500"
                        : plan.days_remaining / plan.duration_days < 0.5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${
                        (plan.days_remaining / plan.duration_days) * 100
                      }%`,
                      transition: "width 0.5s ease-in-out",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-indigo-500 text-gray-500 italic">
              No active plan found.
            </div>
          )}

          <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              📈 Usage
            </h2>
            <p>
              <strong>Messages:</strong> {usage.total_messages}
            </p>
            <p>
              <strong>Users:</strong> {usage.unique_users} / {plan.max_users}
            </p>
          </div>
        </div>

        {/* Message History */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              💬 Message History
            </h2>
            <div className="flex gap-4 items-center">
              {/* Toggle view mode */}
              <select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  setSessionFilter(""); // reset filter when switching view
                }}
                className="px-3 py-2 border rounded shadow-sm text-sm"
              >
                <option value="session">🔁 Group by Session</option>
                <option value="email">📧 Group by Email</option>
              </select>

              {/* Dynamic filter dropdown based on view mode */}
              <select
                className="px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-sm"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
              >
                <option value="">All</option>
                {viewMode === "session"
                  ? allSessions.map((session, i) => (
                      <option key={i} value={session.session_id}>
                        {session.session_id}
                      </option>
                    ))
                  : allEmails.map((email, i) => (
                      <option key={i} value={email}>
                        {email}
                      </option>
                    ))}
              </select>
            </div>
          </div>
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-3">Time</th>
                <th className="p-3">Sender</th>
                <th className="p-3">Message</th>
                <th className="p-3">Session ID</th>
              </tr>
            </thead>
            <tbody>
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-100 hover:bg-gray-50"
                    onClick={() => openSessionModal(msg.session_id)} // 👈 Add this
                  >
                    <td className="p-3 text-gray-700 text-sm leading-tight whitespace-nowrap">
                      {msg.timestamp ? (
                        <>
                          <div className="font-medium text-gray-900">
                            {new Date(msg.timestamp).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="p-3 capitalize">{msg.sender}</td>
                    <td className="p-3">{msg.content}</td>
                    <td className="p-3 text-xs text-gray-500">
                      {msg.session_id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}

          <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
            <button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>

            <span className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-full shadow text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next →
            </button>
          </div>
        </div>

        <SessionModal
          sessionId={selectedSessionId}
          messages={sessionMessages}
          onClose={() => {
            setSelectedSessionId(null);
            setSessionMessages(null);
          }}
        />
      </div>
  );
};

export default UserDashboard;
