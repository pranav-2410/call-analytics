import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";

function App() {
  const [email, setEmail] = useState<string>(""); 
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  useEffect(() => {
    const last = localStorage.getItem("ca_email");
    if (last) {
      setEmail(last);
      setConfirmedEmail(last);
    }
  }, []);

  const onConfirmEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem("ca_email", email);
    setConfirmedEmail(email);
  };

  const onChangeEmail = () => {
    setConfirmedEmail(null);
  };

  return (
    <div className="min-h-screen p-6">
      <header className="max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2">Call Analytics</h1>
        <p className="text-slate-300">A lightweight dashboard with Supabase persistence</p>
      </header>

      <main className="max-w-5xl mx-auto bg-white/5 p-6 rounded-2xl shadow-lg">
        {!confirmedEmail ? (
          <form onSubmit={onConfirmEmail} className="flex gap-3 items-center">
            <input
              className="px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none flex-1"
              placeholder="Enter your email to save custom values"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <button className="bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 rounded-md">
              Continue
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-slate-300">Signed in as</div>
                <div className="font-medium">{confirmedEmail}</div>
              </div>
              <button
                onClick={onChangeEmail}
                className="text-sm underline decoration-dotted text-slate-300">
                Change email
              </button>
            </div>

            <Dashboard email={confirmedEmail} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
