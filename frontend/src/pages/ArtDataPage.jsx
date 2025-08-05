import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

import { getMonthlyCoefficientStatistics, getMonthlyAverageCompletionTimeStatistics } from '../services/statisticsService';

/**
 * 美工数据页组件
 * 展示美工本月系数和平均完成时间的图表
 */
const ArtDataPage = () => {
  // 状态管理
  const [coefficientData, setCoefficientData] = useState({ employeeIds: [], coefficients: [] });
  const [completionTimeData, setCompletionTimeData] = useState({ employeeIds: [], averageCompletionTimes: [] });
  const [loading, setLoading] = useState({ coefficients: true, completionTimes: true });
  const [error, setError] = useState({ coefficients: null, completionTimes: null });

  // --- 数据获取逻辑 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ coefficients: true, completionTimes: true });
        setError({ coefficients: null, completionTimes: null });

        // 并行获取两个数据集
        const [coefficientResponse, completionTimeResponse] = await Promise.all([
          getMonthlyCoefficientStatistics(),
          getMonthlyAverageCompletionTimeStatistics(),
        ]);

        // 处理系数数据
        if (coefficientResponse?.success && Array.isArray(coefficientResponse.data)) {
          const processedCoefficientData = coefficientResponse.data
            .map(item => ({
              id: item.id,
              name: item.name || `员工 #${item.id}`,
              value: parseFloat(item.coefficient) || 0,
            }))
            .sort((a, b) => a.value - b.value); // 按系数排序

          setCoefficientData({
            employeeIds: processedCoefficientData.map(item => item.name),
            coefficients: processedCoefficientData.map(item => item.value),
          });
        } else {
          setError(prev => ({ ...prev, coefficients: '获取系数数据失败或格式不正确' }));
        }

        // 处理平均完成时间数据
        if (completionTimeResponse?.success && Array.isArray(completionTimeResponse.data)) {
          const processedCompletionTimeData = completionTimeResponse.data
            .map(item => ({
              id: item.id,
              name: item.name || `员工 #${item.id}`,
              value: parseFloat(item.average_completion_time) || 0,
            }))
            .sort((a, b) => a.value - b.value); // 按时间排序

          setCompletionTimeData({
            employeeIds: processedCompletionTimeData.map(item => item.name),
            averageCompletionTimes: processedCompletionTimeData.map(item => item.value),
          });
        } else {
          setError(prev => ({ ...prev, completionTimes: '获取平均完成时间数据失败或格式不正确' }));
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError({ coefficients: '网络请求失败', completionTimes: '网络请求失败' });
      } finally {
        setLoading({ coefficients: false, completionTimes: false });
      }
    };

    fetchData();
  }, []); // 仅在组件挂载时执行一次

  // --- 图表配置逻辑 (使用 useMemo 优化性能) ---

  // 系数图表配置
  const coefficientChartOption = useMemo(() => {
    if (coefficientData.employeeIds.length === 0) return null;

    return {
      title: {
        text: '美工本月系数统计',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1e293b', // Tailwind gray-800
        },
        subtext: '使用滚动条或鼠标滚轮缩放查看更多美工',
        subtextStyle: {
          color: '#64748b', // Tailwind gray-500
        },
        padding: [10, 0, 20, 0], // [top, right, bottom, left]
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}<br/>系数: {c}',
        backgroundColor: 'rgba(30, 41, 59, 0.85)', // Tailwind gray-900 with opacity
        borderColor: '#334155', // Tailwind gray-700
        textStyle: {
          color: '#f1f5f9', // Tailwind gray-100
          fontSize: 14,
        },
        padding: 10,
        borderRadius: 4,
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '12%',
        top: '20%', // 为标题留出空间
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'filter',
          startValue: 0,
          endValue: Math.min(14, coefficientData.employeeIds.length - 1),
          right: '10px',
          width: '12px',
          showDataShadow: false, // 隐藏数据阴影，更简洁
          handleSize: '80%',
          handleStyle: {
            color: '#cbd5e1', // Tailwind gray-300
          },
          textStyle: {
            color: '#94a3b8', // Tailwind gray-400
          },
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
          bottom: '10px',
          height: '12px',
          showDataShadow: false,
          handleSize: '80%',
          handleStyle: {
            color: '#cbd5e1',
          },
          textStyle: {
            color: '#94a3b8',
          },
        },
      ],
      xAxis: {
        type: 'value',
        name: '系数',
        nameLocation: 'middle',
        nameGap: 30,
        boundaryGap: [0, 0.01],
        axisLabel: {
          color: '#64748b', // Tailwind gray-500
          fontSize: 12,
        },
        nameTextStyle: {
          color: '#475569', // Tailwind gray-600
          fontSize: 14,
          fontWeight: 'normal',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e2e8f0', // Tailwind gray-200
          },
        },
      },
      yAxis: {
        type: 'category',
        data: coefficientData.employeeIds,
        axisLabel: {
          color: '#475569', // Tailwind gray-600
          fontSize: 12,
          margin: 10,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: '系数',
          type: 'bar',
          data: coefficientData.coefficients,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#818cf8' }, // Tailwind indigo-400
              { offset: 1, color: '#4f46e5' }, // Tailwind indigo-600
            ]),
            borderRadius: [0, 4, 4, 0],
          },
          emphasis: {
            focus: 'series', // 高亮时聚焦整个系列
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#a78bfa' }, // Tailwind violet-400
                { offset: 1, color: '#7c3aed' }, // Tailwind violet-600
              ]),
            },
          },
          barMinHeight: 5, // 最小高度，避免值为0时完全不可见
        },
      ],
    };
  }, [coefficientData]); // 仅在 coefficientData 变化时重新计算

  // 平均完成时间图表配置
  const completionTimeChartOption = useMemo(() => {
    if (completionTimeData.employeeIds.length === 0) return null;

    return {
      title: {
        text: '美工平均完成时间统计',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1e293b',
        },
        subtext: '使用滚动条或鼠标滚轮缩放查看更多美工',
        subtextStyle: {
          color: '#64748b',
        },
        padding: [10, 0, 20, 0],
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}<br/>平均耗时: {c} 小时',
        backgroundColor: 'rgba(30, 41, 59, 0.85)',
        borderColor: '#334155',
        textStyle: {
          color: '#f1f5f9',
          fontSize: 14,
        },
        padding: 10,
        borderRadius: 4,
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '12%',
        top: '20%',
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'filter',
          startValue: 0,
          endValue: Math.min(14, completionTimeData.employeeIds.length - 1),
          right: '10px',
          width: '12px',
          showDataShadow: false,
          handleSize: '80%',
          handleStyle: {
            color: '#cbd5e1',
          },
          textStyle: {
            color: '#94a3b8',
          },
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
          bottom: '10px',
          height: '12px',
          showDataShadow: false,
          handleSize: '80%',
          handleStyle: {
            color: '#cbd5e1',
          },
          textStyle: {
            color: '#94a3b8',
          },
        },
      ],
      xAxis: {
        type: 'value',
        name: '平均耗时 (小时)',
        nameLocation: 'middle',
        nameGap: 30,
        boundaryGap: [0, 0.01],
        axisLabel: {
          color: '#64748b',
          fontSize: 12,
        },
        nameTextStyle: {
          color: '#475569',
          fontSize: 14,
          fontWeight: 'normal',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e2e8f0',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: completionTimeData.employeeIds,
        axisLabel: {
          color: '#475569',
          fontSize: 12,
          margin: 10,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: '平均每单完成时间',
          type: 'bar',
          data: completionTimeData.averageCompletionTimes,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#f87171' }, // Tailwind red-400
              { offset: 1, color: '#dc2626' }, // Tailwind red-600
            ]),
            borderRadius: [0, 4, 4, 0],
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#fb923c' }, // Tailwind orange-400
                { offset: 1, color: '#ea580c' }, // Tailwind orange-600
              ]),
            },
          },
          barMinHeight: 5,
        },
      ],
    };
  }, [completionTimeData]); // 仅在 completionTimeData 变化时重新计算

  // --- 渲染逻辑 ---

  // 渲染加载状态
  const renderLoading = (dataType) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
      <p className="text-gray-600">正在加载{dataType}数据...</p>
    </div>
  );

  // 渲染错误状态
  const renderError = (errorMessage, onRetry) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-500 text-2xl mb-2">⚠️</div>
      <p className="text-gray-600 mb-4">{errorMessage}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        重新加载
      </button>
    </div>
  );

  // 渲染空数据状态
  const renderNoData = (dataType) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 text-2xl mb-2">📊</div>
      <p className="text-gray-600">暂无{dataType}数据</p>
    </div>
  );

  // 渲染图表
  const renderChart = (option, height = '500px') => {
    if (!option) {
        // 如果 option 为 null（例如数据为空），可以渲染一个提示或空状态
        // 这里我们假设 renderNoData 会在数据为空时被调用，所以这里可以返回 null 或一个备用图表
        // 为了简化，我们在这里处理一下
        return <div className="text-center py-10 text-gray-500">图表配置无效</div>;
    }
    return (
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        // notMerge 和 lazyUpdate 可以根据需要调整
        // notMerge={true} // 如果 option 变化很大，可以设置为 true
        // lazyUpdate={true} // 启用懒更新，提高性能
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6"> {/* 使用 bg-gray-50 更柔和 */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 bg-gray-50"> {/* 添加轻微背景色区分 */}
          <h1 className="text-2xl font-bold text-gray-800">美工数据看板</h1> {/* 更改标题为看板，更现代 */}
          <p className="text-gray-500 mt-1">本月美工绩效与效率分析</p> {/* 更新副标题 */}
        </div>

        {/* Charts Grid - 使用 Grid 布局实现响应式 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6"> {/* lg: 1024px 以上两列 */}

          {/* 系数图表 Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex-grow">
              {loading.coefficients ? (
                renderLoading('系数')
              ) : error.coefficients ? (
                renderError(error.coefficients, () => window.location.reload())
              ) : coefficientData.employeeIds.length === 0 ? (
                renderNoData('系数')
              ) : (
                renderChart(coefficientChartOption)
              )}
            </div>
          </div>

          {/* 平均完成时间图表 Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex-grow">
              {loading.completionTimes ? (
                renderLoading('平均完成时间')
              ) : error.completionTimes ? (
                renderError(error.completionTimes, () => window.location.reload())
              ) : completionTimeData.employeeIds.length === 0 ? (
                renderNoData('平均完成时间')
              ) : (
                renderChart(completionTimeChartOption)
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArtDataPage;
