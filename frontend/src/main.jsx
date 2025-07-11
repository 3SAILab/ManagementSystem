import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index';
import './index.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastContainer
      position="top-center" // 居中顶部，视觉上更自然（比 center-center 更推荐）
      autoClose={1000}
      hideProgressBar={true} // 隐藏进度条
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      draggable
      pauseOnFocusLoss
      theme="colored" // 使用彩色主题（现代感更强）
      limit={3} // 可选：限制最多显示几条 toast
    />
    <RouterProvider router={router} />
  </React.StrictMode>
);