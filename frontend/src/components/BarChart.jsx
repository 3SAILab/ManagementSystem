// components/BarChart.js
import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const BarChart = ({
  title,
  subtitle,
  xAxisName,
  yAxisData,
  seriesName,
  seriesData,
  tooltipFormatter,
  colorGradient = ['#818cf8', '#4f46e5'], // 默认蓝色系
  emphasisColorGradient = ['#a78bfa', '#7c3aed'],
  loading,
  error,
  onRetry,
  height = '500px',
  isEmpty = false,
  onItemClick,
}) => {

  const option = React.useMemo(() => {
    if (isEmpty || yAxisData.length === 0 || seriesData.length === 0) return null;

    return {
      title: {
        text: title,
        subtext: subtitle,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1e293b',
        },
        subtextStyle: {
          color: '#64748b',
        },
        padding: [10, 0, 20, 0],
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: tooltipFormatter,
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
          endValue: Math.min(14, yAxisData.length - 1),
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
        { type: 'inside', yAxisIndex: 0 },
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'weakFilter',
          bottom: '10px',
          height: '12px',
          showDataShadow: false,
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
        name: xAxisName,
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
        data: yAxisData,
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
          name: seriesName,
          type: 'bar',
          data: seriesData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: colorGradient[0] },
              { offset: 1, color: colorGradient[1] },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: emphasisColorGradient[0] },
                { offset: 1, color: emphasisColorGradient[1] },
              ]),
            },
          },
          barMinHeight: 5,
        },
      ],
    };
  }, [
    title,
    subtitle,
    xAxisName,
    yAxisData,
    seriesName,
    seriesData,
    tooltipFormatter,
    colorGradient,
    emphasisColorGradient,
    isEmpty,
  ]);

  // 状态渲染函数
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
      <p className="text-gray-600 dark:text-gray-300">加载中...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-red-500 text-2xl mb-2">⚠️</div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
      >
        重新加载
      </button>
    </div>
  );

  const renderNoData = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 dark:text-gray-500 text-2xl mb-2">📊</div>
      <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
    </div>
  );

  const renderChart = () => {
    if (!option) return renderNoData();
    return (
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={onItemClick ? { click: onItemClick } : undefined}
      />
    );
  };

  return (
    <div className="flex-grow">
      {loading
        ? renderLoading()
        : error
        ? renderError()
        : isEmpty
        ? renderNoData()
        : renderChart()}
    </div>
  );
};

export default BarChart;