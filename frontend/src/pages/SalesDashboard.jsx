import React, { useState, useEffect } from 'react';
import { DollarSign, PiggyBank, Package, Receipt, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { getContracts } from '../services/contractService';
import { getMonthlySales } from '../services/statisticsService';
import Pagination from '../components/Pagination';

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
  // 被选中的合同Id
  const [contractId, setContractId] = useState(null);
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
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          收入图表
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          来源详情
        </div>
      </div>
      
      {/* 订单尾款跟踪表格 */}
      <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-visible min-h-0">
        {/* 表格头部 */}
        <div className="bg-white">
          <h3 className="p-4 border-b border-slate-200 text-lg font-semibold">订单尾款跟踪</h3>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contracts.map((contract) => {
                const status = contract.total_amount - contract.paid_amount > 0 ? '待结算' : '已结算';
                const commission = Math.round(contract.total_amount * contract.commission_rate / 100);
                return (
                  <tr key={contract.id} 
                  onClick={() => setContractId(contract.id)}
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
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusBadgeClass(status)}`}>
                        {status}
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
              onPageChange={(page) => setFilters({...filters, page: page})}
            />
          </div>
        </div>


      </div>
      
    </div>
  );
};

export default SalesDashboard;
