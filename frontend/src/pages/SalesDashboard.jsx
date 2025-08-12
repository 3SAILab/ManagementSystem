import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, PiggyBank, Package, Receipt, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import * as echarts from 'echarts';
import { getContracts, updateContractStatus, deleteContract } from '../services/contractService';
import { getMonthlySales, getMonthlySalesStatistics, getMonthlySalesByCycle, getMonthlySalesAmountStatistics, getMonthlySalesAmountByCycle } from '../services/statisticsService';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import DateUtils from '../utils/dateUtils';

const getTrendIndicator = (change) => {
  const isPositive = change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-red-500' : 'text-green-500';
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
const rechargeBadgeClass = (is_recharged) => {
  switch (is_recharged) {
    case true:
      return 'bg-green-100 text-green-800';
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

const SalesDashboard = () => {
  const navigate = useNavigate();
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

  const commissionChartRef = useRef(null);
  const commissionChartInstance = useRef(null);
  const salesAmountChartRef = useRef(null);
  const salesAmountChartInstance = useRef(null);
  // 提点图表当前视图
  const [currentCommissionView, setCurrentCommissionView] = useState('月度');
  // 提点图表数据状态
  const [commissionChartData, setCommissionChartData] = useState([]);
  // 提点图表标签
  const [commissionChartLabels, setCommissionChartLabels] = useState([]);
  // 销售额图表当前视图
  const [currentSalesAmountView, setCurrentSalesAmountView] = useState('月度');
  // 销售额图表数据状态
  const [salesAmountChartData, setSalesAmountChartData] = useState([]);
  // 销售额图表标签
  const [salesAmountChartLabels, setSalesAmountChartLabels] = useState([]);
  // 加载状态
  const [loadingStates, setLoadingStates] = useState({
    contracts: false,
    statistics: false,
    commissionChart: false,
    salesAmountChart: false
  });
  // 获取提点图表数据
  useEffect(() => {
    const fetchCommissionChartData = async () => {
      try {
        if (currentCommissionView === '月度') {
          const res = await getMonthlySalesStatistics();
          setCommissionChartData(res.data || []);
          setCommissionChartLabels(['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']);
        } else if (currentCommissionView === '周期') {
          const res = await getMonthlySalesByCycle();
          setCommissionChartData(res.data.map(cycle => cycle.total_amount));
          setCommissionChartLabels(res.data.map(cycle => `${cycle.cycle} 周期`));
        }
      } catch (error) {
        console.error('获取图表数据失败:', error);
        setCommissionChartData([]);
        setCommissionChartLabels([]);
      }
    };

    fetchCommissionChartData();
  }, [currentCommissionView]);
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
          symbol: 'circle', // 数据点为圆形
          symbolSize: 6, // 数据点大小
          itemStyle: {
            color: '#6366F1', // indigo-500
          },
          lineStyle: {
            width: 2,
          },
          data: commissionChartData,
        },
      ],
    };

    // 初始化图表实例
    if (!commissionChartInstance.current) {
      commissionChartInstance.current = echarts.init(commissionChartRef.current);
    }

    // 设置图表配置
    commissionChartInstance.current.setOption(option, true);

    // 自适应屏幕变化
    const handleResize = () => {
      if (commissionChartInstance.current) {
        commissionChartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (commissionChartInstance.current) {
        commissionChartInstance.current.dispose();
        commissionChartInstance.current = null;
      }
    };
  }, [commissionChartData]); // 依赖于提点图表数据变化
  // 获取销售额图表数据
  useEffect(() => {
    const fetchSalesAmountChartData = async () => {
      try {
        if (currentSalesAmountView === '月度') {
          const res = await getMonthlySalesAmountStatistics();
          setSalesAmountChartData(res.data || []);
          setSalesAmountChartLabels(['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']);
        } else if (currentSalesAmountView === '周期') {
          const res = await getMonthlySalesAmountByCycle();
          setSalesAmountChartData(res.data.map(cycle => cycle.total_amount));
          setSalesAmountChartLabels(res.data.map(cycle => `${cycle.cycle} 周期`));
        }
      } catch (error) {
        console.error('获取图表数据失败:', error);
        setSalesAmountChartData([]);
        setSalesAmountChartLabels([]);
      }
    };

    fetchSalesAmountChartData();
  }, [currentSalesAmountView]);
  // 初始化销售额图表
  useEffect(() => {
    if (!salesAmountChartRef.current || salesAmountChartData.length === 0) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#F59E0B',
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
          symbol: 'circle', // 数据点为圆形
          symbolSize: 6, // 数据点大小
          itemStyle: {
            color: '#F59E0B', // indigo-500
          },
          lineStyle: {
            width: 2,
          },
          data: salesAmountChartData,
        },
      ],
    };

    // 初始化图表实例
    if (!salesAmountChartInstance.current) {
      salesAmountChartInstance.current = echarts.init(salesAmountChartRef.current);
    }

    // 设置图表配置
    salesAmountChartInstance.current.setOption(option, true);

    // 自适应屏幕变化
    const handleResize = () => {
      if (salesAmountChartInstance.current) {
        salesAmountChartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
  }, [salesAmountChartData]); // 依赖于销售额图表数据变化
  // 合同列表
  const [contracts, setContracts] = useState([]);
  // 总条数
  const [total, setTotal] = useState(0);
  // 刷新状态
  const [refresh, setRefresh] = useState(false);
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
          getContracts(filters),
          getMonthlySales()
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
  }, [filters,refresh]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [settlementTime, setSettlementTime] = useState('');
  const handleOpenModal = (contract) => {
    setEditingContract(contract);
    setNewStatus(contract.status);
    setSettlementTime(DateUtils.toInputDateTimeLocal(contract.settlement_time));
    console.log(settlementTime);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContract(null);
    setNewStatus('');
    setSettlementTime('');
  };
  const handleConfirmStatusChange = async () => {
    // 如果状态是已结算，结算时间不能为空
    if(newStatus === '已结算' && settlementTime === undefined){
      toast.error('结算时间不能为空');
      return;
    }
    const res = await updateContractStatus(editingContract.id, newStatus, settlementTime);
    if(res.success){
      toast.success('合同状态更新成功');
      // 更新合同列表
      getContracts(filters).then(res => {
        setContracts(res.data.contracts);
      });
      handleCloseModal();
    }else{
      toast.error(res.error);
    }
    setRefresh(!refresh);
  };
  const handleDeleteContract = async (contractId) => {
    const result = await Swal.fire({
      text: `确定要删除吗？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    });
    if (!result.isConfirmed) return;
    const res = await deleteContract(contractId);
    if(res.success){
      toast.success('合同删除成功');
      getContracts(filters).then(res => {
        setContracts(res.data.contracts);
      });
    }else{
      toast.error(res.error);
    }
  };
  return (
    <div className="p-6 space-y-6">
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
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
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
              暂无数据
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
                <th className="p-4 text-sm font-semibold text-slate-600">是否充值</th>
                <th className="p-4 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contracts.map((contract) => {
                // 提点保留两位小数
                //如果是坏单，提点为预付金额*提点
                //如果是待结算，提点为预付金额*提点
                //如果是已结算，提点为合同金额*提点
                let commission = 0;
                if(contract.status === '坏单'){
                  commission = Math.round(contract.paid_amount * contract.commission_rate / 100 * 100) / 100;
                }else if(contract.status === '待结算'){
                  commission = Math.round(contract.paid_amount * contract.commission_rate / 100 * 100) / 100;
                }else if(contract.status === '已结算'){
                  commission = Math.round(contract.total_amount * contract.commission_rate / 100 * 100) / 100;
                }
                return (
                  <tr key={contract.id} 
                  onClick={() => navigate(`/contract_detail/${contract.id}`)}
                  className={`hover:bg-slate-50 cursor-pointer`}
                  >
                    <td className="p-4 font-medium text-slate-800">{contract.client_name || '未知客户'}</td>
                    <td className="p-4 text-slate-600">¥{contract.total_amount.toLocaleString()}</td>
                    <td className="p-4 text-slate-600">{DateUtils.formatDateYMD(contract.transaction_time)}</td>
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
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${rechargeBadgeClass(contract.is_recharged)}`}>
                        {contract.is_recharged ? '是' : '否'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 rounded-md bg-indigo-500 text-white text-sm shadow-sm hover:bg-indigo-600 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(contract);
                          }}
                        >
                          更改状态
                        </button>
                        <button
                          className="px-3 py-1 rounded-md bg-red-500 text-white text-sm shadow-sm hover:bg-red-600 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContract(contract.id);
                          }}
                        >
                          删除
                        </button>
                      </div>
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
              onPageChange={(page) => setFilters({...filters, page: page})}
            />
          </div>
        </div>


      </div>
      {/* **更改合同状态模态框** */}
      {isModalOpen && editingContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">更改订单状态</h3>
            <p className="mb-2 text-slate-600">客户: {editingContract.client_name || '未知客户'}</p>
            <p className="mb-4 text-slate-600">合同金额: ¥{editingContract.total_amount.toLocaleString()}</p>
            
            <label htmlFor="status-select" className="block text-sm font-medium text-slate-700 mb-1">
              选择新状态:
            </label>
            <select
              id="status-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md mb-6"
            >
              <option value="待结算">待结算</option>
              <option value="已结算">已结算</option>
              <option value="坏单">坏单</option>
            </select>
            {/** 如果状态是已结算需要选择结算时间，并且结算时间不能为空 */}
            {newStatus === '已结算' && (
              <div className="space-y-2">
                <label htmlFor="settlement-time" className="block text-sm font-medium text-slate-700">
                  结算时间<span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="settlement-time"
                  name="settlement-time"
                  value={settlementTime}
                  onChange={(e) => setSettlementTime(e.target.value)}
                  className="form-input block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
