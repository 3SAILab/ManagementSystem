import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { getMonthlyCoefficientStatistics } from '../services/statisticsService';

const ArtDataPage = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    employeeIds: [],
    coefficients: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取后端数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getMonthlyCoefficientStatistics();
        if (response.success && response.data) {
          // 处理后端数据
          const data = response.data;
          const employeeIds = [];
          const coefficients = [];

          // 假设后端返回的数据格式是数组，每个元素包含员工信息和系数
          if (Array.isArray(data)) {
            data.forEach(item => {
              employeeIds.push(item.name || `员工 #${item.id}`);
              coefficients.push(parseFloat(item.coefficient || 0));
            });
          } else if (data.employees && Array.isArray(data.employees)) {
            // 如果数据是嵌套格式
            data.employees.forEach(item => {
              employeeIds.push(item.name || `员工 #${item.id}`);
              coefficients.push(parseFloat(item.coefficient || 0));
            });
          }

          // 按系数排序（从低到高）
          const sortedData = employeeIds
            .map((id, index) => ({ id, coefficient: coefficients[index] }))
            .sort((a, b) => a.coefficient - b.coefficient);

          setChartData({
            employeeIds: sortedData.map(item => item.id),
            coefficients: sortedData.map(item => item.coefficient)
          });
        } else {
          setError('获取数据失败');
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('网络请求失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // 图表配置项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}<br/>系数: {c}',
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '12%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'slider',
        yAxisIndex: 0,
        filterMode: 'filter',
        startValue: 0,
        endValue: Math.min(14, chartData.employeeIds.length - 1),
        right: '20px',
        width: '25px',
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'filter',
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'weakFilter',
        bottom: '20px',
        height: '25px',
      },
    ],
    xAxis: {
      type: 'value',
      name: '系数',
      boundaryGap: [0, 0.01],
      axisLabel: { color: '#64748b' },
      nameTextStyle: { color: '#64748b', fontSize: 14 },
      splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'category',
      data: chartData.employeeIds,
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: '系数',
        type: 'bar',
        data: chartData.coefficients,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#818cf8' },
            { offset: 1, color: '#4f46e5' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#a78bfa' },
              { offset: 1, color: '#6d28d9' },
            ]),
          },
        },
      },
    ],
  };

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">美工本月系数统计</h1>
          <p className="text-gray-500 mt-1">使用滚动条或鼠标滚轮缩放查看更多美工</p>
        </div>

        {/* Chart */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  重新加载
                </button>
              </div>
            </div>
          ) : chartData.employeeIds.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-gray-400 text-lg mb-2">📊</div>
                <p className="text-gray-600">暂无数据</p>
              </div>
            </div>
          ) : (
            <ReactECharts
              ref={chartRef}
              option={option}
              style={{ height: '600px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ArtDataPage;