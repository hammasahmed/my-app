import { useState } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // if you use react-router

export default function Dashboard() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login page
      navigate("/admin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${dark ? "bg-gray-900" : "bg-[#F8F9FA]"}`}>
      <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-3xl text-center ${dark ? "bg-gray-800" : "bg-white"}`}>
        <h1 className={`text-3xl font-bold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>
          Welcome to the Dashboard
        </h1>
        <p className={`mb-6 ${dark ? "text-gray-400" : "text-gray-500"}`}>
          You are successfully logged in as <span className="font-medium">{auth.currentUser?.email}</span>
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setDark(!dark)}
            className={`px-6 py-3 rounded-xl shadow-lg transition-colors ${dark ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300" : "bg-gray-700 text-white hover:bg-gray-600"}`}
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-[#936A71] text-white rounded-xl shadow-lg hover:bg-[#7a565c] transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Example dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className={`p-6 rounded-xl shadow hover:shadow-lg transition ${dark ? "bg-gray-700" : "bg-[#FDE7E7]"}`}>
            <h2 className={`font-semibold text-lg mb-2 ${dark ? "text-white" : ""}`}>Users</h2>
            <p className={dark ? "text-gray-300" : "text-gray-600"}>12 total</p>
          </div>
          <div className={`p-6 rounded-xl shadow hover:shadow-lg transition ${dark ? "bg-gray-700" : "bg-[#E7F8FD]"}`}>
            <h2 className={`font-semibold text-lg mb-2 ${dark ? "text-white" : ""}`}>Reports</h2>
            <p className={dark ? "text-gray-300" : "text-gray-600"}>3 new</p>
          </div>
          <div className={`p-6 rounded-xl shadow hover:shadow-lg transition ${dark ? "bg-gray-700" : "bg-[#E7FDF0]"}`}>
            <h2 className={`font-semibold text-lg mb-2 ${dark ? "text-white" : ""}`}>Tasks</h2>
            <p className={dark ? "text-gray-300" : "text-gray-600"}>5 pending</p>
          </div>
          <div className={`p-6 rounded-xl shadow hover:shadow-lg transition ${dark ? "bg-gray-700" : "bg-[#FEF7E7]"}`}>
            <h2 className={`font-semibold text-lg mb-2 ${dark ? "text-white" : ""}`}>Settings</h2>
            <p className={dark ? "text-gray-300" : "text-gray-600"}>Update your preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}