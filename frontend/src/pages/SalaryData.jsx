// ArtDataPage.js
import React, { useEffect, useState } from 'react';
import BarChart from '../components/BarChart'; // 引入通用组件

import { getEmployeeSalary } from '../services/authService';

const SalaryDataPage = () => {
  const [salaryData, setSalaryData] = useState({ employeeIds: [], totalSalary: [] });
  const [loading, setLoading] = useState({ salary: true });
  const [error, setError] = useState({ salary: null });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    avgSalary: 0,
    maxSalary: 0,
    minSalary: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ salary: true });
        setError({ salary: null });

        const salaryResponse = await getEmployeeSalary();

        // 处理薪资数据
        if (salaryResponse?.success && Array.isArray(salaryResponse.data)) {
          const processed = salaryResponse.data
            .map(item => ({
              id: item.id,
              name: item.name || `员工 #${item.id}`,
              value: parseFloat(item.total_salary) || 0,
            }))
            .sort((a, b) => a.value - b.value);

          // 计算统计数据
          const values = processed.map(item => item.value);
          const totalEmployees = processed.length;
          const avgSalary = totalEmployees > 0 ? values.reduce((a, b) => a + b, 0) / totalEmployees : 0;
          const maxSalary = Math.max(...values);
          const minSalary = Math.min(...values);

          setSalaryData({
            employeeIds: processed.map(item => item.name),
            totalSalary: processed.map(item => item.value),
          });

          setStats({
            totalEmployees,
            avgSalary: Math.round(avgSalary),
            maxSalary: Math.round(maxSalary),
            minSalary: Math.round(minSalary)
          });
        } else {
          setError(prev => ({ ...prev, salary: '获取薪资数据失败' }));
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError({ salary: '网络错误' });
      } finally {
        setLoading({ salary: false });
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? `¥${value.toLocaleString()}` : value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            薪资数据看板
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            本月薪资统计与分析
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="员工总数"
            value={stats.totalEmployees}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>}
            color="bg-blue-500"
          />
          <StatCard
            title="平均薪资"
            value={stats.avgSalary}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>}
            color="bg-green-500"
          />
          <StatCard
            title="最高薪资"
            value={stats.maxSalary}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>}
            color="bg-purple-500"
          />
          <StatCard
            title="最低薪资"
            value={stats.minSalary}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>}
            color="bg-orange-500"
          />
        </div>

        {/* 主要内容区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          
          {/* 图表标题栏 */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">薪资分布图</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  按薪资从低到高排序，使用滚动条或鼠标滚轮缩放查看更多员工
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">薪资数据</span>
              </div>
            </div>
          </div>

          {/* 图表容器 */}
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <BarChart
                title=""
                subtitle=""
                xAxisName="薪资"
                yAxisData={salaryData.employeeIds}
                seriesName="薪资"
                seriesData={salaryData.totalSalary}
                tooltipFormatter={(params) => `${params[0].axisValue}<br/>薪资: ¥${params[0].value.toLocaleString()}`}
                colorGradient={['#818cf8', '#4f46e5']}
                emphasisColorGradient={['#a78bfa', '#7c3aed']}
                loading={loading.salary}
                error={error.salary}
                onRetry={() => window.location.reload()}
                isEmpty={salaryData.employeeIds.length === 0}
              />
            </div>
          </div>

          {/* 底部信息 */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>数据更新时间: {new Date().toLocaleString('zh-CN')}</span>
                <span>•</span>
                <span>共 {stats.totalEmployees} 名员工</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>实时数据</span>
              </div>
            </div>
          </div>
        </div>

        {/* 数据说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">数据说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">薪资构成</h4>
              <ul className="space-y-1">
                <li>• 基本工资：员工的基础薪资</li>
                <li>• 工作绩效：根据工作表现计算的绩效工资</li>
                <li>• 出勤绩效：根据出勤情况计算的绩效工资</li>
                <li>• 总薪资：以上三项的总和</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">图表说明</h4>
              <ul className="space-y-1">
                <li>• 横轴：员工姓名（按薪资从低到高排序）</li>
                <li>• 纵轴：薪资金额（人民币）</li>
                <li>• 颜色：蓝色渐变表示薪资水平</li>
                <li>• 交互：鼠标悬停查看详细薪资信息</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDataPage;