import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts'; // 核心库
import { getSalesData } from '../services/statisticsService';
import { useNavigate } from 'react-router-dom';

// ECharts 颜色主题
const chartColors = [
  '#3b82f6', '#16a34a', '#f97316', '#8b5cf6',
  '#ec4899', '#f59e0b', '#10b981', '#6366f1'
];

// 全局 ECharts 工具提示样式
const tooltip = {
  trigger: 'item',
  formatter: '{a} <br/>{b}: {c} ({d}%)'
};

// 全局文本样式
const label = {
  show: true,
  position: 'inside',
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold'
};

export default function SalesDataPages() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalDeposit: 0,
    totalReceived: 0,
    totalFinalPaid: 0,
    totalPendingFinal: 0,
  });

  // 图表引用
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);
  const chartRef4 = useRef(null);
  const chartInstances = useRef({});

  // 获取销售数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSalesData();
        if (result.success) {
          setData(result.data);
          setMetrics({
            totalSales: result.data.total_sales || 0,
            totalDeposit: result.data.total_deposit || 0,
            totalReceived: result.data.total_received || 0,
            totalFinalPaid: result.data.total_final_paid || 0,
            totalPendingFinal: result.data.total_pending_final || 0,
          });
        } else {
          setError(result.error || '获取数据失败');
        }
      } catch (error) {
        console.error("获取销售数据失败:", error);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 数据处理：将后端数据转换为图表所需格式
  const sourceStats = data ? {
    '线上': { sales: data.online_sales || 0, count: data.online_orders || 0 },
    '线下': { sales: data.offline_sales || 0, count: data.offline_orders || 0 }
  } : {};
  // 销售人员业绩以及id
  const salesStats = data ? data.sales_performance || {} : {};
  const categoryStats = data ? data.category_stats || {} : {};


  // 初始化图表
  useEffect(() => {
    if (!data) return;

    // 初始化第一个图表（线上 vs 线下销售额对比）
    if (chartRef1.current && !chartInstances.current.chart1) {
      chartInstances.current.chart1 = echarts.init(chartRef1.current);
    }
    if (chartInstances.current.chart1) {
      chartInstances.current.chart1.setOption({
        tooltip: { 
          ...tooltip,
          formatter: function(params) {
            return `${params.name}<br/>销售额: ¥${params.value.toLocaleString()}<br/>占比: ${params.percent}%`;
          }
        },
        series: [
          {
            name: '销售额',
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { 
              ...label,
              fontSize: 11,
              formatter: function(params) {
                return `${params.name}\n¥${params.value.toLocaleString()}`;
              }
            },
            data: Object.keys(sourceStats).map(key => ({
              value: sourceStats[key].sales,
              name: key
            }))
          }
        ],
        color: chartColors
      });
    }

    // 初始化第二个图表（线上 vs 线下订单数量对比）
    if (chartRef2.current && !chartInstances.current.chart2) {
      chartInstances.current.chart2 = echarts.init(chartRef2.current);
    }
    if (chartInstances.current.chart2) {
      chartInstances.current.chart2.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function(params) {
            const data = params[0];
            return `${data.name}<br/>订单数量: ${data.value} 单`;
          }
        },
        grid: { left: '10%', right: '5%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: Object.keys(sourceStats),
          axisTick: { alignWithLabel: true },
          axisLabel: { fontSize: 12 }
        },
        yAxis: { 
          type: 'value', 
          min: 0,
          axisLabel: { fontSize: 11 }
        },
        series: [
          {
            name: '订单数量',
            type: 'bar',
            barWidth: '50%',
            label: {
              show: true,
              position: 'top',
              fontSize: 11,
              color: '#374151'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#8b5cf6' },
                { offset: 1, color: '#c084fc' }
              ])
            },
            data: Object.values(sourceStats).map(s => s.count)
          }
        ]
      });
    }

    // 初始化第三个图表（销售个人业绩）
    if (chartRef3.current && !chartInstances.current.chart3) {
      chartInstances.current.chart3 = echarts.init(chartRef3.current);
    }
    if (chartInstances.current.chart3) {
      // 按销售额排序销售人员（从高到低，但在水平柱状图中需要反转显示顺序）
      const sortedSalespeople = Object.keys(salesStats)
        .sort((a, b) => salesStats[b].sales - salesStats[a].sales)
        .reverse(); // 反转顺序，让最高业绩显示在顶部
      
      chartInstances.current.chart3.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function(params) {
            const data = params[0];
            return `${data.name}<br/>销售额: ¥${data.value.toLocaleString()}`;
          }
        },
        grid: { left: '15%', right: '8%', bottom: '10%', containLabel: true },
        xAxis: { 
          type: 'value', 
          min: 0,
          axisLabel: {
            formatter: '{value} 元'
          }
        },
        yAxis: {
          type: 'category',
          data: sortedSalespeople,
          axisLabel: { 
            margin: 10,
            fontSize: 12
          }
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              color: '#374151',
              fontSize: 11,
              formatter: function(params) {
                return '¥' + params.value.toLocaleString();
              }
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#60a5fa' }
              ])
            },
            data: sortedSalespeople.map(name => ({
              value: salesStats[name].sales,    // ECharts 用来渲染的值
              itemId: salesStats[name].id       // 我们自定义的元数据，用于跳转
            }))
          }
        ]
      });

      // 添加点击事件监听
    chartInstances.current.chart3.on('click', function(event) {
      // event 参数包含点击的详细信息
      const clickedData = event.data; // 被点击的数据对象
      const salespersonId = clickedData.itemId; // 销售人员ID

      // 跳转到销售个人页面
      navigate(`/my_tasks/${salespersonId}`);
    });
    }

    // 初始化第四个图表（产品类目分布）
    if (chartRef4.current && !chartInstances.current.chart4) {
      chartInstances.current.chart4 = echarts.init(chartRef4.current);
    }
    if (chartInstances.current.chart4) {
      // 按销售额排序产品类目
      const sortedCategories = Object.keys(categoryStats)
        .sort((a, b) => categoryStats[b] - categoryStats[a]);
      
      chartInstances.current.chart4.setOption({
        tooltip: { 
          ...tooltip,
          formatter: function(params) {
            return `${params.name}<br/>销售额: ¥${params.value.toLocaleString()}<br/>占比: ${params.percent}%`;
          }
        },
        series: [
          {
            name: '销售额',
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '50%'],
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
            },
            label: { 
              ...label,
              fontSize: 10,
              formatter: function(params) {
                return `${params.name}\n¥${params.value.toLocaleString()}`;
              }
            },
            data: sortedCategories.map(cat => ({
              value: categoryStats[cat],
              name: cat
            }))
          }
        ],
        color: chartColors
      });
    }

    // 自适应屏幕变化
    const handleResize = () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) {
          chart.resize();
        }
      });
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) {
          chart.dispose();
        }
      });
      chartInstances.current = {};
    };
  }, [data, sourceStats, salesStats, categoryStats]);

  // 加载状态
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载销售数据...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">加载失败</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
      {/* 页面标题 */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">本月销售数据可视化看板</h1>
        <p className="text-gray-500 mt-1">实时销售数据统计与分析</p>
      </header>

      {/* 核心数据总览 */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">核心数据总览</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-gray-500 font-medium text-sm">总销售额</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ¥{metrics.totalSales.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-gray-500 font-medium text-sm">总定金额</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ¥{metrics.totalDeposit.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-gray-500 font-medium text-sm">实际总到款</h3>
            <p className="text-2xl font-bold text-green-700 mt-1">
              ¥{metrics.totalReceived.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-gray-500 font-medium text-sm">尾款已支付</h3>
            <p className="text-2xl font-bold text-teal-600 mt-1">
              ¥{metrics.totalFinalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-gray-500 font-medium text-sm">待催收尾款</h3>
            <p className="text-2xl font-bold text-red-500 mt-1">
              ¥{metrics.totalPendingFinal.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* 线上线下对比 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">线上 vs 线下销售额对比</h2>
          <div className="h-80">
            <div ref={chartRef1} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">线上 vs 线下订单数量对比</h2>
          <div className="h-80">
            <div ref={chartRef2} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </section>

      {/* 业绩与产品分析 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">销售个人业绩 (按销售额)</h2>
          <div className="h-80">
            <div ref={chartRef3} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">产品类目分布 (按销售额)</h2>
          <div className="h-80">
            <div ref={chartRef4} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </section>
    </div>
  );
}