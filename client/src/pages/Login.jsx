import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/Button';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const loadingToast = toast.loading(isRegister ? 'Creating account...' : 'Logging in...');

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      toast.dismiss(loadingToast);
      
      if (isRegister) {
        toast.success('Welcome! Please log in.');
        setIsRegister(false);
      } else {
        toast.success('Welcome back!');
        login(res.data.token);
        navigate('/');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <Toaster />
      
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-brand-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 text-white p-12 max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Track every penny.</h1>
          <p className="text-xl opacity-90">Manage your agency's subscriptions, licenses, and contracts in one beautiful dashboard.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-brand-black">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-brand-gray mb-8">Enter your details to access your workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-2">Email Address</label>
              <input 
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                placeholder="name@company.com" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-black mb-2">Password</label>
              <input 
                type="password"
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                placeholder="••••••••" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required
              />
            </div>

            <Button className="w-full text-lg">{isRegister ? 'Sign Up' : 'Log In'}</Button>
          </form>

          <p className="mt-6 text-center text-brand-gray">
            {isRegister ? "Already have an account?" : "Don't have an account?"} 
            <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-brand-primary font-bold hover:underline">
              {isRegister ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}