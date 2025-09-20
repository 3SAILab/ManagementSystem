import React, { useState } from 'react';
import { ChevronDown, ChevronRight, DollarSign, Calendar, FileText, Info } from 'lucide-react';

const AggregatedContractCard = ({ contract, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div 
      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* 主合同信息头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {contract.client_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{contract.client_name || '未知客户'}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(contract.transaction_time)}</span>
              </div>
              {contract.appendix_count > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  含 {contract.appendix_count} 个附属合同
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* 展开/收起按钮 */}
        {contract.appendix_count > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* 聚合统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">合同总额</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(contract.total_amount)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">已付金额</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(contract.paid_amount)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600">尾款</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(contract.remaining_amount)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">总提点</span>
          </div>
          <div className="text-lg font-semibold text-purple-600">
            {formatCurrency(contract.total_commission)}
          </div>
        </div>
      </div>

      {/* 需求统计 */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-sm text-gray-600">详情页</div>
          <div className="font-medium">{contract.total_detail_pages || 0} 套</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-sm text-gray-600">视频</div>
          <div className="font-medium">{contract.total_video_count || 0} 套</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-sm text-gray-600">图片</div>
          <div className="font-medium">{contract.total_image_count || 0} 张</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-sm text-gray-600">工作流</div>
          <div className="font-medium">{contract.total_workflow_count || 0} 个</div>
        </div>
      </div>

      {/* 状态和备注 */}
      <div className="flex items-center justify-between">
        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getStatusStyle(contract.status)}`}>
          {contract.status}
        </span>
        {contract.notes && (
          <div className="flex items-center text-gray-500 text-sm">
            <Info className="w-4 h-4 mr-1" />
            <span className="truncate max-w-48" title={contract.notes}>
              {contract.notes}
            </span>
          </div>
        )}
      </div>

      {/* 附属合同详情（展开时显示） */}
      {isExpanded && contract.appendix_contracts && contract.appendix_contracts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">附属合同详情</span>
          </div>
          
          <div className="space-y-3">
            {/* 主合同明细 */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">主合同</span>
                <span className="text-sm text-blue-600">#{contract.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-blue-600">金额: </span>
                  <span className="font-medium">{formatCurrency(contract.main_contract.total_amount)}</span>
                </div>
                <div>
                  <span className="text-blue-600">已付: </span>
                  <span className="font-medium">{formatCurrency(contract.main_contract.paid_amount)}</span>
                </div>
                <div>
                  <span className="text-blue-600">详情页: </span>
                  <span className="font-medium">{contract.main_contract.detail_pages || 0} 套</span>
                </div>
              </div>
            </div>

            {/* 附属合同明细 */}
            {contract.appendix_contracts.map((appendix, index) => (
              <div key={appendix.id} className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-800">
                    附属合同 {index + 1}
                  </span>
                  <span className="text-sm text-orange-600">#{appendix.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-orange-600">金额: </span>
                    <span className="font-medium">{formatCurrency(appendix.total_amount)}</span>
                  </div>
                  <div>
                    <span className="text-orange-600">已付: </span>
                    <span className="font-medium">{formatCurrency(appendix.paid_amount)}</span>
                  </div>
                  <div>
                    <span className="text-orange-600">详情页: </span>
                    <span className="font-medium">{appendix.detail_pages || 0} 套</span>
                  </div>
                </div>
                {appendix.notes && (
                  <div className="text-xs text-orange-700 bg-orange-100 rounded p-2">
                    <span className="font-medium">备注: </span>
                    {appendix.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AggregatedContractCard;