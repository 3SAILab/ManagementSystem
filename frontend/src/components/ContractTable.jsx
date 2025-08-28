import React from 'react';
//import { useNavigate } from 'react-router-dom';

const ContractTable = ({ contracts = [] }) => {
  //const navigate = useNavigate();

  // 提点计算函数
  const calculateCommission = (contract) => {
    // 如果是坏单，提点为预付金额*提点率
    // 否则为合同金额*提点率
    const baseAmount = contract.status === '坏单' 
      ? contract.paid_amount 
      : contract.total_amount;
    
    return Math.round(baseAmount * contract.commission_rate / 100 * 100) / 100;
  };
  // 类型徽章样式
  const typeBadgeClass = (type) => {
    const baseClass = "inline-block px-2 py-1 text-xs rounded-full";
    switch (type) {
      case '首单':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case '复购':
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  // 状态徽章样式
  const statusBadgeClass = (status) => {
    const baseClass = "inline-block px-2 py-1 text-xs rounded-full";
    // 根据不同状态返回不同的样式类
    switch(status) {
      case '进行中':
        return `${baseClass} bg-green-100 text-green-800`;
      case '已完成':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case '坏单':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  // 格式化金额显示
  const formatCurrency = (amount) => {
    return `¥${amount?.toLocaleString() || '0'}`;
  };

  // 格式化日期显示
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (contracts.length === 0) {
    return (
      <div className="overflow-x-auto">
        <div className="p-4 text-center text-slate-500">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full max-w-full">
      <table className="min-w-full w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-sm font-semibold text-slate-600">合同金额</th>
            <th className="p-4 text-sm font-semibold text-slate-600">接入日期</th>
            <th className="p-4 text-sm font-semibold text-slate-600">首付款</th>
            <th className="p-4 text-sm font-semibold text-slate-600">提点</th>
            <th className="p-4 text-sm font-semibold text-slate-600">类型</th>
            <th className="p-4 text-sm font-semibold text-slate-600">状态</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {contracts.map((contract) => {
            const commission = calculateCommission(contract);
            return (
              <tr 
                key={contract.id} 
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="p-4 text-slate-600">{formatCurrency(contract.total_amount)}</td>
                <td className="p-4 text-slate-600">{formatDate(contract.transaction_time)}</td>
                <td className="p-4 text-slate-600">{formatCurrency(contract.paid_amount)}</td>
                <td className="p-4 text-slate-600">{formatCurrency(commission)}</td>
                <td className="p-4">
                  <span className={typeBadgeClass(contract.contract_type)}>
                    {contract.contract_type}
                  </span>
                </td>
                <td className="p-4">
                  <span className={statusBadgeClass(contract.status)}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContractTable;