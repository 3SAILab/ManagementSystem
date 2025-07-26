import { useState } from 'react';
import { Mail, Lock, BrainCircuit } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Typewriter from '../components/Typewriter'
import {login} from '../services/authService'
import '../index.css';
import { toast } from 'react-toastify';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请输入账号和密码');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      navigate('/', { replace: true });
      toast.success('登录成功！');
    } else {
      toast.error(result.error || '登录失败，请检查账号和密码');
    }
  };

  return (
    <div className="auth-view w-full min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl lg:min-h-[700px] rounded-2xl shadow-2xl overflow-hidden bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="shape-1"></div>
            <div className="shape-2"></div>
            <div className="shape-3"></div>
            <div className="central-sphere"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-wider">SIGMA AI</h1>
            </div>
            <Typewriter />
          </div>
          <div className="relative z-10 text-sm text-indigo-200">
            &copy; 2024 SIGMA AI. All Rights Reserved.
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-10">
              <div className="flex items-center gap-3 justify-center">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-wider">SIGMA AI</h1>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mb-2">欢迎回来 👋</h2>
            <p className="text-slate-500 mb-8">请点击登录进入您的工作台</p>

            <form id="login-form" className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  邮箱地址
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    密码
                  </label>
                  <Link to="/reset_password" id="forgot-password-link" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    忘记密码?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  登录
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;