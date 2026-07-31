import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { KeyRound, User, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ username, password });
      localStorage.setItem('token', data.token);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login failed', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-900/50 p-6 text-center border-b border-slate-700">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <KeyRound className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">VICKY'S GARAGE</h1>
          <p className="text-slate-400 mt-1 text-sm">Secure Login Panel</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-3 flex items-center justify-center transition-colors disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
