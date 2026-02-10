import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import this
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate(); // <--- 2. Initialize the hook

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      
      // Save token to context
      login(res.data.token);
      
      // Redirect to Dashboard
      navigate('/'); // <--- 3. This triggers the page change
      
    } catch (err) { 
      alert('Invalid Login'); 
      console.error(err);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/register', { email, password });
      alert('Registered! Now click Login.');
    } catch (err) {
      alert('Registration failed. Email might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">SubTracker Login</h2>
        <input className="w-full border p-2 mb-4 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 mb-4 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded mb-2">Login</button>
        <button type="button" onClick={handleRegister} className="w-full text-blue-600 text-sm">Create Admin Account</button>
      </form>
    </div>
  );
}