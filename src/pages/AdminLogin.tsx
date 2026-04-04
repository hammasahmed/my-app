import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Logged in:", userCredential.user);
      navigate("/dash");

      setError("");

      // 👉 redirect or do something
      // window.location.href = "/dashboard";

    } catch (err) {
      console.error((err as Error).message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDE7E7] flex items-center justify-center p-4">
      <div className="bg-[#F8F9FA] rounded-[40px] shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden p-4 md:p-6 gap-6">
        
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Hello Again!</h1>
            <p className="text-gray-500 text-sm font-medium">Let's get into your system</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-rose-200 outline-none"
            />

            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-rose-200 outline-none"
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-[#936A71] text-white font-semibold rounded-xl shadow-lg hover:bg-[#7a565c]"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-4 border border-[#936A71] text-[#936A71] font-semibold rounded-xl hover:bg-[#936A71]/10 transition-colors"
            >
              View Site
            </button>
          </form>
        </div>

        <div className="hidden md:block flex-1 relative rounded-[32px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809" 
            alt="Illustration"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}