import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, PiggyBank, Package, Receipt, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import * as echarts from 'echarts';
import { getContracts, updateContractStatus } from '../services/contractService';
import { getMonthlySales, getMonthlySalesStatistics } from '../services/statisticsService';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    monthlyPendingOrderCount: 0,
    monthlyPendingOrderCountChange: 0,
  });
  // 过滤条件
  const [filters, setFilters] = useState({
    name: '',
    status: [],
    contract_type: [],
    page: 1,
    page_size: 10
});

  const chartInstance = useRef(null);

  useEffect(() => {
    const initChart = async () => {
      const res = await getMonthlySalesStatistics();
      console.log("res.data", res.data);
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
          data: ['收入'],
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
          data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} 元',
          },
        },
        series: [
          {
            name: '收入',
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
            data: res.data,
          },
          /** 
          {
            name: '目标',
            type: 'line',
            smooth: true,
            symbol: 'circle', // 数据点为圆形
            symbolSize: 6, // 数据点大小
            itemStyle: {
              color: '#3792fc', // 深蓝色
            },
            lineStyle: {
              width: 2,
            },
            data: [9000, 10000, 8000, 9500, 7000, 20000, 18000, 15000, 17000, 20000, 23000, 26000],
          },
          */
        ],
      };

      chartInstance.current = echarts.init(document.getElementById('revenue-chart'));
      chartInstance.current.setOption(option);

      // 自适应屏幕变化
      window.addEventListener('resize', () => {
        chartInstance.current.resize();
      });

      return () => {
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    };

    initChart();
  }, []);

  // 合同列表
  const [contracts, setContracts] = useState([]);
  // 总条数
  const [total, setTotal] = useState(0);
  // 获取合同
  useEffect(() => {
    getContracts(filters).then(res => {
      setContracts(res.data.contracts);
      setTotal(res.data.total);
    });
  }, [filters]);
  // 获取员工本月销售统计数据
  useEffect(() => {
    getMonthlySales().then(res => {
      console.log(res.data);
      setStatistics(res.data);
    });
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const handleOpenModal = (contract) => {
    setEditingContract(contract);
    setNewStatus(contract.status);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContract(null);
    setNewStatus('');
  };
  const handleConfirmStatusChange = async () => {
    const res = await updateContractStatus(editingContract.id, newStatus);
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
              {getTrendIndicator(statistics.monthlySalesChange || 0)}
            </div>
            <p className="text-3xl font-bold text-slate-800">¥{statistics.monthlySales || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><PiggyBank className="w-7 h-7 text-green-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">本月提点</p>
              {getTrendIndicator(statistics.monthlyCommissionChange || 0)}
            </div>
            <p className="text-3xl font-bold text-slate-800">¥{statistics.monthlyCommission || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Package className="w-7 h-7 text-blue-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">本月订单数</p>
              {getTrendIndicator(statistics.monthlyOrderCountChange || 0)}
            </div>
            <p className="text-3xl font-bold text-slate-800">{statistics.monthlyOrderCount || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg"><Receipt className="w-7 h-7 text-yellow-600" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">待结算订单</p>
              {getTrendIndicator(statistics.monthlyPendingOrderCountChange || 0)}
            </div>
            <p className="text-3xl font-bold text-yellow-500">{statistics.monthlyPendingOrderCount || 0}</p>
          </div>
        </div>
      </div>

      {/* 收入图表 + 来源详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收入图表 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">收入</h3>
            <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
              <button className="px-3 py-1 rounded-md bg-white shadow-sm">月度</button>
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
            <div id="revenue-chart" style={{ width: '100%', height: '100%' }}></div>
          </div>

          <div className="flex gap-8 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
              <span>收入</span>
              <span className="ml-2 font-medium">¥50,300</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          来源详情
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
                <th className="p-4 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contracts.map((contract) => {
                // 提点保留两位小数
                //如果是坏单，提点为预付金额*提点
                const commission = contract.status === '坏单' ? Math.round(contract.paid_amount * contract.commission_rate / 100 * 100) / 100 : Math.round(contract.total_amount * contract.commission_rate / 100 * 100) / 100;
                return (
                  <tr key={contract.id} 
                  onClick={() => navigate(`/contract_detail/${contract.id}`)}
                  className={`hover:bg-slate-50 cursor-pointer`}
                  >
                    <td className="p-4 font-medium text-slate-800">{contract.client_name || '未知客户'}</td>
                    <td className="p-4 text-slate-600">¥{contract.total_amount.toLocaleString()}</td>
                    <td className="p-4 text-slate-600">{new Date(contract.created_at).toLocaleDateString()}</td>
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
                      {/* 修改后的按钮 */}
                      <button
                        className="px-3 py-1 rounded-md bg-white shadow-sm text-sm"
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止行点击事件触发
                          handleOpenModal(contract);
                        }}
                      >
                        更改状态
                      </button>
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
      {/* **新增模态框** */}
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
