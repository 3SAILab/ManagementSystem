import React from 'react';
import { Calendar, DollarSign, FileText } from 'lucide-react';

const ContractCard = ({ contract, hasNotification, onCreateTicket, onViewDetails }) => {
  const formatCurrency = (amount) => {
    return amount ? `¥${amount.toLocaleString()}` : '¥0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case '已结算':
        return 'bg-green-100 text-green-800';
      case '待结算':
        return 'bg-yellow-100 text-yellow-800';
      case '坏单':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 检查是否有附属合同
  const hasAppendixContracts = contract.appendix_contracts && contract.appendix_contracts.length > 0;
  
  // 确定卡片样式
  const getCardStyle = () => {
    if (hasNotification && hasAppendixContracts) {
      return 'border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg';
    } else if (hasNotification) {
      return 'border-blue-500 bg-blue-50';
    } else if (hasAppendixContracts) {
      return 'border-orange-300 bg-orange-25';
    } else {
      return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getCardStyle()}`}>
      {/* 通知标识 */}
      {(hasNotification || hasAppendixContracts) && (
        <div className="flex items-center space-x-2 mb-3">
          {hasNotification && (
            <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></span>
              有更新
            </div>
          )}
          {hasAppendixContracts && (
            <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
              有附属合同 ({contract.appendix_contracts.length})
            </div>
          )}
        </div>
      )}
      
      {/* 主要信息区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 客户和金额信息 */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {contract.client.name?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{contract.client.name || '未知客户'}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(contract.transaction_time)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">合同总额:</span>
              <span className="font-medium text-gray-800">{formatCurrency(contract.total_amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">首付款:</span>
              <span className="font-medium text-gray-800">{formatCurrency(contract.paid_amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">状态:</span>
              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusStyle(contract.status)}`}>
                {contract.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* 备注信息 */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">备注信息</span>
          </div>
          <div className="bg-gray-50 rounded-md p-3 min-h-[100px]">
            <p className="text-sm text-gray-600 max-h-20 overflow-y-auto">
              {contract.notes || '无备注'}
            </p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => onCreateTicket(contract.id)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>创建工单</span>
          </button>
          
          <button
            onClick={() => onViewDetails(contract.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>查看详情</span>
          </button>
        </div>
      </div>
      
      {/* 附属合同显示 */}
      {contract.appendix_contracts && contract.appendix_contracts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">
              附属合同 ({contract.appendix_contracts.length})
            </span>
          </div>
          <div className="space-y-2">
            {contract.appendix_contracts.map(appendix => (
              <div key={appendix.id} className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-800">{formatCurrency(appendix.total_amount)}</span>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    附属合同
                  </span>
                </div>
                {appendix.notes && (
                  <p className="text-sm text-orange-700 mt-2">{appendix.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractCard;