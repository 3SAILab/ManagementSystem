import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, PiggyBank, Package, Receipt, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import * as echarts from 'echarts';
import { getReadonlyContracts } from '../services/contractService';
import { getReadonlyMonthlySales, getReadonlyMonthlySalesStatistics, getReadonlyMonthlySalesByCycle, getReadonlyMonthlySalesAmountStatistics, getReadonlyMonthlySalesAmountByCycle } from '../services/statisticsService';
import Pagination from '../components/Pagination';
import { useNavigate, useParams } from 'react-router-dom';

const getTrendIndicator = (change) => {
  const isPositive = change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
  return (
    <span className={`${colorClass} flex items-center text-sm ml-1`}>
      <Icon size={16} className="mr-1" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
};

const statusBadgeClass = (status) => {
  switch (status) {
    case '已结算':
      return 'bg-green-100 text-green-800';
    case '待结算':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const typeBadgeClass = (type) => {
  switch (type) {
    case '首单':
      return 'bg-blue-100 text-blue-800';
    case '复购':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ReadOnlySalesDashboard = () => {
  const navigate = useNavigate();
  const { id, name } = useParams();

  // 统计数据
  const [statistics, setStatistics] = useState({
    monthlySales: 0,
    monthlySalesChange: 0,
    monthlyCommission: 0,
    monthlyCommissionChange: 0,
    monthlyOrderCount: 0,
    monthlyOrderCountChange: 0,
    pendingOrderCount: 0,
  });

  // 过滤条件
  const [filters, setFilters] = useState({
    name: '',
    status: [],
    contract_type: [],
    page: 1,
    page_size: 10
  });

  // 提点图表
  const commissionChartRef = useRef(null);
  const commissionChartInstance = useRef(null);
  const [currentCommissionView, setCurrentCommissionView] = useState('月度');
  const [commissionChartData, setCommissionChartData] = useState([]);
  const [commissionChartLabels, setCommissionChartLabels] = useState([]);

  // 销售额图表
  const salesAmountChartRef = useRef(null);
  const salesAmountChartInstance = useRef(null);
  const [currentSalesAmountView, setCurrentSalesAmountView] = useState('月度');
  const [salesAmountChartData, setSalesAmountChartData] = useState([]);
  const [salesAmountChartLabels, setSalesAmountChartLabels] = useState([]);

  // 合同列表
  const [contracts, setContracts] = useState([]);
  // 总条数
  const [total, setTotal] = useState(0);
  // 加载状态
  const [loadingStates, setLoadingStates] = useState({
    contracts: false,
    statistics: false,
    commissionChart: false,
    salesAmountChart: false
  });

  // 并行获取所有数据
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoadingStates(prev => ({ 
          ...prev, 
          contracts: true, 
          statistics: true
        }));
        
        // 只获取合同列表和统计数据
        const [contractsRes, statisticsRes] = await Promise.all([
          getReadonlyContracts(id, filters),
          getReadonlyMonthlySales(id)
        ]);

        // 分别处理结果
        if (contractsRes.success) {
          setContracts(contractsRes.data.contracts);
          setTotal(contractsRes.data.total);
        }
        if (statisticsRes.success) {
          setStatistics(statisticsRes.data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoadingStates(prev => ({ 
          ...prev, 
          contracts: false, 
          statistics: false
        }));
      }
    };
    fetchAllData();
  }, [filters, id]);

  // 获取提点图表数据
  useEffect(() => {
    const fetchCommissionChartData = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, commissionChart: true }));
        
        const commissionChartDataRes = await (currentCommissionView === '月度' 
          ? getReadonlyMonthlySalesStatistics(id) 
          : getReadonlyMonthlySalesByCycle(id)
        );

        if (commissionChartDataRes.success) {
          if (currentCommissionView === '月度') {
            setCommissionChartData(commissionChartDataRes.data || []);
            setCommissionChartLabels(['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']);
          } else if (currentCommissionView === '周期') {
            const cycleData = commissionChartDataRes.data || [];
            setCommissionChartData(cycleData.map(cycle => cycle.total_amount || 0));
            setCommissionChartLabels(cycleData.map(cycle => `${cycle.cycle || '未知'} 周期`));
          }
        }
      } catch (error) {
        console.error('获取提点图表数据失败:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, commissionChart: false }));
      }
    };
    fetchCommissionChartData();
  }, [id, currentCommissionView]);

  // 获取销售额图表数据
  useEffect(() => {
    const fetchSalesAmountChartData = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, salesAmountChart: true }));
        
        const salesAmountChartDataRes = await (currentSalesAmountView === '月度' 
          ? getReadonlyMonthlySalesAmountStatistics(id) 
          : getReadonlyMonthlySalesAmountByCycle(id)
        );

        if (salesAmountChartDataRes.success) {
          if (currentSalesAmountView === '月度') {
            setSalesAmountChartData(salesAmountChartDataRes.data || []);
            setSalesAmountChartLabels(['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']);
          } else if (currentSalesAmountView === '周期') {
            const cycleData = salesAmountChartDataRes.data || [];
            setSalesAmountChartData(cycleData.map(cycle => cycle.total_amount || 0));
            setSalesAmountChartLabels(cycleData.map(cycle => `${cycle.cycle || '未知'} 周期`));
          }
        }
      } catch (error) {
        console.error('获取销售额图表数据失败:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, salesAmountChart: false }));
      }
    };
    fetchSalesAmountChartData();
  }, [id, currentSalesAmountView]);

  // 初始化提点图表
  useEffect(() => {
    if (!commissionChartRef.current || commissionChartData.length === 0) return;
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        data: ['提点'],
        top: 10,
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: commissionChartLabels,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} 元',
        },
      },
      series: [
        {
          name: '提点',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#6366F1',
          },
          lineStyle: {
            width: 2,
          },
          data: commissionChartData,
        },
      ],
    };

    if (!commissionChartInstance.current) {
      commissionChartInstance.current = echarts.init(commissionChartRef.current);
    }
    commissionChartInstance.current.setOption(option, true);

    const handleResize = () => {
      if (commissionChartInstance.current) {
        commissionChartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (commissionChartInstance.current) {
        commissionChartInstance.current.dispose();
        commissionChartInstance.current = null;
      }
    };
  }, [commissionChartData, commissionChartLabels]);

  // 初始化销售额图表
  useEffect(() => {
    if (!salesAmountChartRef.current || salesAmountChartData.length === 0) return;
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        data: ['销售额'],
        top: 10,
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: salesAmountChartLabels,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} 元',
        },
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#6366F1',
          },
          lineStyle: {
            width: 2,
          },
          data: salesAmountChartData,
        },
      ],
    };

    if (!salesAmountChartInstance.current) {
      salesAmountChartInstance.current = echarts.init(salesAmountChartRef.current);
    }
    salesAmountChartInstance.current.setOption(option, true);

    const handleResize = () => {
      if (salesAmountChartInstance.current) {
        salesAmountChartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (salesAmountChartInstance.current) {
        salesAmountChartInstance.current.dispose();
        salesAmountChartInstance.current = null;
      }
    };
  }, [salesAmountChartData, salesAmountChartLabels]);

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题区域 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                <span className="text-indigo-600">{name}</span> 的销售看板
              </h1>
              <p className="text-slate-500 text-sm mt-1">查看销售数据和业绩表现</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg"><DollarSign className="w-7 h-7 text-indigo-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">本月销售额</p>
              {statistics.monthlySalesChange !== undefined && getTrendIndicator(statistics.monthlySalesChange || 0)}
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {statistics.monthlySales !== undefined ? `¥${statistics.monthlySales || 0}` : '加载中...'}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><PiggyBank className="w-7 h-7 text-green-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">本月提点</p>
              {statistics.monthlyCommissionChange !== undefined && getTrendIndicator(statistics.monthlyCommissionChange || 0)}
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {statistics.monthlyCommission !== undefined ? `¥${statistics.monthlyCommission || 0}` : '加载中...'}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Package className="w-7 h-7 text-blue-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">本月订单数</p>
              {statistics.monthlyOrderCountChange !== undefined && getTrendIndicator(statistics.monthlyOrderCountChange || 0)}
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {statistics.monthlyOrderCount !== undefined ? (statistics.monthlyOrderCount || 0) : '加载中...'}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg"><Receipt className="w-7 h-7 text-yellow-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">待结算订单</p>
            </div>
            <p className="text-3xl font-bold text-yellow-500">
              {statistics.pendingOrderCount !== undefined ? (statistics.pendingOrderCount || 0) : '加载中...'}
            </p>
          </div>
        </div>
      </div>

      {/* 提点图表 + 销售额图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 提点图表 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">提点</h3>
            <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
              <button
                onClick={() => setCurrentCommissionView('月度')}
                className={`px-3 py-1 rounded-md bg-white shadow-sm ${currentCommissionView === '月度' ? 'font-bold' : ''}`}
              >
                月度
              </button>
              <button
                onClick={() => setCurrentCommissionView('周期')}
                className={`px-3 py-1 rounded-md bg-white shadow-sm ${currentCommissionView === '周期' ? 'font-bold' : ''}`}
              >
                周期
              </button>
            </div>
          </div>
          <div className="flex items-center mb-5">
            <h2 className="text-2xl font-bold">¥{statistics.monthlyCommission || 0}</h2>
            <span className="text-green-500 flex items-center text-sm ml-2">
              <span className="w-4 h-4 mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8l-6 6h12z" />
                </svg>
              </span>
              {getTrendIndicator(statistics.monthlyCommissionChange || 0)}
            </span>
            <span className="text-slate-500 text-sm ml-2">同比上期</span>
          </div>
          <div className="h-64 mb-4">
            {loadingStates.commissionChart ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-2"></div>
                <span className="text-slate-500">加载图表中...</span>
              </div>
            ) : (
              <div ref={commissionChartRef} style={{ width: '100%', height: '256px' }}></div>
            )}
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
              <span>提点</span>
              <span className="ml-2 font-medium">¥{statistics.monthlyCommission}</span>
            </div>
          </div>
        </div>

        {/* 销售额图表 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">销售额</h3>
            <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
              <button
                onClick={() => setCurrentSalesAmountView('月度')}
                className={`px-3 py-1 rounded-md bg-white shadow-sm ${currentSalesAmountView === '月度' ? 'font-bold' : ''}`}
              >
                月度
              </button>
              <button
                onClick={() => setCurrentSalesAmountView('周期')}
                className={`px-3 py-1 rounded-md bg-white shadow-sm ${currentSalesAmountView === '周期' ? 'font-bold' : ''}`}
              >
                周期
              </button>
            </div>
          </div>
          <div className="flex items-center mb-5">
            <h2 className="text-2xl font-bold">¥{statistics.monthlySales || 0}</h2>
            <span className="text-green-500 flex items-center text-sm ml-2">
              <span className="w-4 h-4 mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8l-6 6h12z" />
                </svg>
              </span>
              {getTrendIndicator(statistics.monthlySalesChange || 0)}
            </span>
            <span className="text-slate-500 text-sm ml-2">同比上期</span>
          </div>
          <div className="h-64 mb-4">
            {loadingStates.salesAmountChart ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-2"></div>
                <span className="text-slate-500">加载图表中...</span>
              </div>
            ) : (
              <div ref={salesAmountChartRef} style={{ width: '100%', height: '256px' }}></div>
            )}
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
              <span>销售额</span>
              <span className="ml-2 font-medium">¥{statistics.monthlySales || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 订单尾款跟踪表格 */}
      <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-visible min-h-0">
        {/* 表格头部 */}
        <div className="bg-white">
          <h3 className="p-4 border-b border-slate-200 text-lg font-semibold">合同尾款跟踪</h3>
          {contracts.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              {loadingStates.contracts ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  加载中...
                </div>
              ) : (
                '暂无数据'
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-sm font-semibold text-slate-600">客户名称</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">合同金额</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">接入日期</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">已付金额</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">提点</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">类型</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contracts.map((contract) => {
                  // 提点保留两位小数
                  // 如果是坏单，提点为预付金额*提点
                  const commission = contract.status === '坏单'
                    ? Math.round(contract.paid_amount * contract.commission_rate / 100 * 100) / 100
                    : Math.round(contract.total_amount * contract.commission_rate / 100 * 100) / 100;
                  return (
                    <tr
                      key={contract.id}
                      onClick={() => navigate(`/readonly_contract_detail/${contract.id}`)}
                      className={`hover:bg-slate-50 cursor-pointer`}
                    >
                      <td className="p-4 font-medium text-slate-800">{contract.client_name || '未知客户'}</td>
                      <td className="p-4 text-slate-600">¥{contract.total_amount.toLocaleString()}</td>
                      <td className="p-4 text-slate-600">{new Date(contract.transaction_time).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-600">¥{contract.paid_amount.toLocaleString()}</td>
                      <td className="p-4 text-slate-600">¥{commission.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${typeBadgeClass(contract.contract_type)}`}>
                          {contract.contract_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusBadgeClass(contract.status)}`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {/* 分页 */}
        <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center">
          <span>显示 {contracts.length} / 共 {total} 条数据</span>
          <div className="flex items-center gap-2">
            {/* 分页按钮 */}
            <Pagination
              totalItems={total}
              itemsPerPage={filters.page_size}
              currentPage={filters.page}
              onPageChange={(page) => setFilters({ ...filters, page: page })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlySalesDashboard;