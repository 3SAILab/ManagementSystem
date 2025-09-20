import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 如果使用 React Router 进行页面跳转
import { sendVerificationCode, resetPassword } from '../../../api/auth';
const PasswordReset = ({ onSuccess, onError, className = '' }) => {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false); // 标记是否已发送验证码
    const [countdown, setCountdown] = useState(0); // 倒计时
    const [errors, setErrors] = useState({}); // 存储表单或API错误信息
    const [message, setMessage] = useState(''); // 存储成功或提示信息

    const navigate = useNavigate(); // 如果使用 React Router

    // 倒计时逻辑
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // 发送验证码
    const handleSendCode = async () => {
        // 基本校验
        if (!email) {
            setErrors({ email: '请输入邮箱地址' });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrors({ email: '请输入有效的邮箱地址' });
            return;
        }

        setIsLoading(true);
        setErrors({});
        setMessage('');

        try {
            const response = await sendVerificationCode(email, 'reset_password');
            console.log("发送验证码响应:", response);
            if (response.success) {
                setIsCodeSent(true);
                setCountdown(60); // 设置60秒倒计时
                setMessage('验证码已发送，请查收邮箱。');
                if (onSuccess) onSuccess('验证码发送成功');
            } else {
                setErrors({ general: response.error || '发送验证码失败' });
                if (onError) onError(new Error(response.error || '发送验证码失败'));
            }
        } catch (error) {
            console.error("发送验证码错误:", error);
            // 优先显示后端返回的具体错误信息
            const backendMsg = error.response?.data?.message || error.response?.data?.detail;
            const errorMsg = backendMsg || error.message || '网络错误，请稍后重试';
            setErrors({ general: errorMsg });
            if (onError) onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // 验证验证码并重置密码
    const handleResetPassword = async (e) => {
        e.preventDefault(); // 阻止表单默认提交

        // 前端校验
        const newErrors = {};
        if (!verificationCode) newErrors.verificationCode = '请输入验证码';
        if (!newPassword) newErrors.newPassword = '请输入新密码';
        if (newPassword.length < 8) newErrors.newPassword = '密码长度至少8位';
        if (!confirmPassword) newErrors.confirmPassword = '请确认新密码';
        if (newPassword !== confirmPassword) newErrors.confirmPassword = '两次输入的密码不一致';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});
        setMessage('');

        try {
            const resetResponse = await resetPassword(email, verificationCode, newPassword);

            // 处理重置密码的结果
            if (resetResponse.success) {
                setMessage(resetResponse.message || '密码重置成功！');
                // 清空表单
                setEmail('');
                setVerificationCode('');
                setNewPassword('');
                setConfirmPassword('');
                setIsCodeSent(false);
                setCountdown(0);
                if (onSuccess) onSuccess(resetResponse.message || '密码重置成功');
                setTimeout(() => navigate('/auth/login'), 1000); // 1秒后跳转
            } else {
                // 如果重置密码接口返回了具体的错误信息
                const errorMsg = resetResponse.message || '密码重置失败';
                setErrors({ general: errorMsg });
                if (onError) onError(new Error(errorMsg));
            }

        } catch (error) {
            console.error("密码重置错误:", error);
            // 优先显示后端返回的具体错误信息
            const backendMsg = error.response?.data?.message || error.response?.data?.detail;
            const errorMsg = backendMsg || error.message || '操作失败，请稍后重试';
            setErrors({ general: errorMsg });
            if (onError) onError(error);
        } finally {
            // 只有在完成所有API调用后才停止加载
            // 如果验证码错误，已在 earlier return 处停止
            if (!errors.verificationCode) {
               setIsLoading(false);
            }
        }
    };

    // 清除特定字段的错误
    const clearError = (fieldName) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    // 重新开始流程 (例如，输错邮箱后重新输入)
    const handleRestart = () => {
        setIsCodeSent(false);
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setMessage('');
        // countdown 会在下次发送成功后重置
    };

    return (
        <div className={`min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 ${className}`}>
             <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg relative">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate(-1)} // 或者 navigate('/login')
                    className="absolute top-4 left-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    disabled={isLoading}
                >
                    ← 返回
                </button>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 pt-6">
                    重置密码
                </h2>

                {/* 阶段一：输入邮箱并发送验证码 */}
                {!isCodeSent ? (
                    <div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                邮箱地址
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="请输入您的邮箱地址"
                                disabled={isLoading}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <button
                            onClick={handleSendCode}
                            disabled={isLoading || countdown > 0}
                            className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition flex items-center justify-center
                                ${(isLoading || countdown > 0) ?
                                    'bg-gray-400 cursor-not-allowed' :
                                    'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    发送中...
                                </>
                            ) : (countdown > 0 ? `重新发送 (${countdown}s)` : '发送验证码')}
                        </button>
                    </div>
                ) : (
                    /* 阶段二：输入验证码和新密码 */
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label htmlFor="email-display" className="block text-sm font-medium text-gray-700 mb-1">
                                验证邮箱
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email-display"
                                    value={email}
                                    readOnly
                                    className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={handleRestart}
                                    className="absolute inset-y-0 right-0 px-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                    disabled={isLoading}
                                >
                                    更改
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">验证码已发送至此邮箱</p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                                验证码
                            </label>
                            <input
                                type="text"
                                id="verificationCode"
                                value={verificationCode}
                                onChange={(e) => { setVerificationCode(e.target.value); clearError('verificationCode'); }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.verificationCode ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="请输入您收到的验证码"
                                disabled={isLoading}
                            />
                            {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                新密码
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); clearError('newPassword'); }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="请输入新密码"
                                disabled={isLoading}
                            />
                            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                            <p className="mt-1 text-xs text-gray-500">密码长度至少6位</p>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                确认新密码
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="请再次输入新密码"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition flex items-center justify-center
                                ${isLoading ?
                                    'bg-gray-400 cursor-not-allowed' :
                                    'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    处理中...
                                </>
                            ) : '重置密码'}
                        </button>
                    </form>
                )}

                {/* 通用错误或成功消息显示 */}
                {errors.general && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        <strong>错误:</strong> {errors.general}
                    </div>
                )}
                {message && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;