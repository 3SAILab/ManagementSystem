// ArtDataPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BarChart from '../components/BarChart'; // 引入通用组件
import { useEmployeePermissionStore } from '../store/employee'; // 引入员工权限存储
import { toast } from 'react-toastify'; // 引入 toast 组件

import { getMonthlyCoefficientStatistics, getMonthlyAverageCompletionTimeStatistics } from '../services/statisticsService';

const ArtDataPage = () => {
  const [coefficientData, setCoefficientData] = useState({ employeeIds: [], coefficients: [] });
  const [completionTimeData, setCompletionTimeData] = useState({ employeeIds: [], averageCompletionTimes: [] });
  const [loading, setLoading] = useState({ coefficients: true, completionTimes: true });
  const [error, setError] = useState({ coefficients: null, completionTimes: null });
  const navigate = useNavigate();
  const { employee } = useEmployeePermissionStore();

  // 检查用户是否有团队任务监控面板的权限
  const hasTeamDashboardAccess = useCallback(() => {
    if (!employee) return false;
    
    const { role, department_name, position_name } = employee;
    
    // 统计看板权限（owner角色）
    if (role === 'owner') return true;
    
    // 美工主管权限（manager角色 + 生产部 + 美工职位）
    if (role === 'manager' && department_name === '生产部' && position_name === '美工') return true;
    
    // 渲染主管权限（manager角色 + 生产部 + 渲染职位）
    if (role === 'manager' && department_name === '生产部' && position_name === '渲染') return true;
    
    return false;
  }, [employee]);

  const handleBarClick = useCallback((params) => {
    // 检查权限
    if (!hasTeamDashboardAccess()) {
      return;
    }
    
    const name = params?.name || params?.data?.name || '';
    // 有权限时跳转到团队任务监控面板
    navigate('/team_dashboard', { state: { focusName: name } });
  }, [navigate, hasTeamDashboardAccess]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ coefficients: true, completionTimes: true });
        setError({ coefficients: null, completionTimes: null });

        const [coefficientResponse, completionTimeResponse] = await Promise.all([
          getMonthlyCoefficientStatistics(),
          getMonthlyAverageCompletionTimeStatistics(),
        ]);

        // 处理系数数据
        if (coefficientResponse?.success && Array.isArray(coefficientResponse.data)) {
          const processed = coefficientResponse.data
            .map(item => ({
              id: item.id,
              name: item.name || `员工 #${item.id}`,
              value: parseFloat(item.coefficient) || 0,
            }))
            .sort((a, b) => a.value - b.value);

          setCoefficientData({
            employeeIds: processed.map(item => item.name),
            coefficients: processed.map(item => item.value),
          });
        } else {
          setError(prev => ({ ...prev, coefficients: '获取系数数据失败' }));
        }

        // 处理完成时间数据
        if (completionTimeResponse?.success && Array.isArray(completionTimeResponse.data)) {
          const processed = completionTimeResponse.data
            .map(item => ({
              id: item.id,
              name: item.name || `员工 #${item.id}`,
              value: parseFloat(item.average_completion_time) || 0,
            }))
            .sort((a, b) => a.value - b.value);

          setCompletionTimeData({
            employeeIds: processed.map(item => item.name),
            averageCompletionTimes: processed.map(item => item.value),
          });
        } else {
          setError(prev => ({ ...prev, completionTimes: '获取平均完成时间失败' }));
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError({ coefficients: '网络错误', completionTimes: '网络错误' });
      } finally {
        setLoading({ coefficients: false, completionTimes: false });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">美工数据看板</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">本月美工绩效与效率分析</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          
          {/* 系数图表 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <BarChart
              title="美工本月系数统计"
              subtitle="使用滚动条或鼠标滚轮缩放查看更多美工"
              xAxisName="系数"
              yAxisData={coefficientData.employeeIds}
              seriesName="系数"
              seriesData={coefficientData.coefficients}
              tooltipFormatter={(params) => `${params[0].axisValue}<br/>系数: ${params[0].value}`}
              colorGradient={['#818cf8', '#4f46e5']}
              emphasisColorGradient={['#a78bfa', '#7c3aed']}
              loading={loading.coefficients}
              error={error.coefficients}
              onRetry={() => window.location.reload()}
              isEmpty={coefficientData.employeeIds.length === 0}
              onItemClick={handleBarClick}
            />
          </div>

          {/* 平均完成时间图表 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <BarChart
              title="美工平均完成时间统计"
              subtitle="使用滚动条或鼠标滚轮缩放查看更多美工"
              xAxisName="平均耗时 (小时)"
              yAxisData={completionTimeData.employeeIds}
              seriesName="平均每单完成时间"
              seriesData={completionTimeData.averageCompletionTimes}
              tooltipFormatter={(params) => `${params[0].axisValue}<br/>平均耗时: ${params[0].value} 小时`}
              colorGradient={['#f87171', '#dc2626']}
              emphasisColorGradient={['#fb923c', '#ea580c']}
              loading={loading.completionTimes}
              error={error.completionTimes}
              onRetry={() => window.location.reload()}
              isEmpty={completionTimeData.employeeIds.length === 0}
              onItemClick={handleBarClick}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArtDataPage;