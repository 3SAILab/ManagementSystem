import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Search } from 'lucide-react';
import ContractCard from './components/ContractCard';
import AddTicketModal from './components/AddTicketModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPendingContractsForProduction } from '../../../../api/workorder/contract';
import { addTicket } from '../../../../api/workorder';
import { useNotificationStore } from '../../../../store/notifications';
import Pagination from './components/Pagination';

const ContractManagementPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    const savedPage = sessionStorage.getItem('contractManagementPage');
    return {
      page: savedPage ? parseInt(savedPage, 10) : 1,
      page_size: 10,
      key_word: '',
    };
  });
  useEffect(() => {
    sessionStorage.setItem('contractManagementPage', filters.page);
  }, [filters.page]);
  const [total, setTotal] = useState(0);
  // 通知状态管理
  const { 
    contractNotifications, 
  } = useNotificationStore();
  
  // 创建工单模态框状态
  const [createTicketModal, setCreateTicketModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  // 获取待处理合同列表（支持分页与关键词）
  const loadPendingContracts = async () => {
    try {
      setLoading(true);
      const result = await getPendingContractsForProduction({
        page: filters.page,
        page_size: filters.page_size,
        key_word: filters.key_word
      });
      if (result.success) {
        // 确保返回的是数组
        const contractsData = Array.isArray(result.data) ? result.data : [];
        setContracts(contractsData);
        if (result.meta && typeof result.meta.total === 'number') {
          setTotal(result.meta.total);
        } else {
          // 兼容旧接口：无 meta 时，用当前数量作为已知数量
          setTotal(contractsData.length);
        }
      } else {
        toast.error(result.error || '获取合同列表失败');
        setContracts([]); // 确保设置为空数组
        setTotal(0);
      }
    } catch (error) {
      console.error('加载合同列表失败:', error);
      toast.error('加载合同列表失败');
      setContracts([]); // 确保设置为空数组
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingContracts();
  }, [filters.page, filters.page_size, filters.key_word]);

  const handleCreateTicket = (contractId) => {
    setSelectedContractId(contractId);
    setCreateTicketModal(true);
  };

  const handleViewDetails = (contractId) => {
    navigate(`/contract_detail/${contractId}`);
  };

  const handleTicketCreated = async (ticketData) => {
    try {
      // 确保合同ID正确设置
      const ticketWithContractId = {
        ...ticketData,
        contract_id: selectedContractId
      };

      const result = await addTicket(ticketWithContractId);
      if (result.success) {
        toast.success('工单创建成功');
        setCreateTicketModal(false);
        setSelectedContractId(null);
        // 重新加载合同列表
        loadPendingContracts();
      } else {
        toast.error(result.error || '创建工单失败');
      }
    } catch (error) {
      console.error('创建工单失败:', error);
      toast.error('创建工单失败');
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* 页面标题、搜索与通知 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">合同管理</h1>
          <p className="text-gray-600 mt-1">查看并管理待处理的合同</p>
        </div>

        {/* 右侧工具栏：搜索 + 通知 */}
        <div className="flex items-center space-x-4">
          {/* 搜索框 */}
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="搜索客户名称..." 
              className="form-input !pl-12 w-full bg-white border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              value={filters.key_word}
              onChange={(e) => setFilters({ ...filters, key_word: e.target.value, page: 1 })}
            />
          </div>

          {/* 通知区域 */}
          {/* 新合同通知 */}
          {contractNotifications.newContracts.length > 0 && (
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
              <Bell className="w-4 h-4 mr-2" />
              <span className="text-sm">{contractNotifications.newContracts.length} 个新合同</span>
            </div>
          )}
          
          {/* 附属合同通知 */}
          {contractNotifications.appendixContracts.length > 0 && (
            <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{contractNotifications.appendixContracts.length} 个合同有更新</span>
            </div>
          )}
        </div>
      </div>

      {/* 合同列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-2"></div>
          <span className="text-gray-500">加载合同列表...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">暂无待处理的合同</p>
            </div>
          ) : (
            contracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                hasNotification={
                  contractNotifications.newContracts.includes(contract.id) || 
                  contractNotifications.appendixContracts.includes(contract.id)
                }
                onCreateTicket={handleCreateTicket}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
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
      )}

      {/* 创建工单模态框 */}
      <AddTicketModal
        isOpen={createTicketModal}
        onClose={() => {
          setCreateTicketModal(false);
          setSelectedContractId(null);
        }}
        onAdd={handleTicketCreated}
        contractId={selectedContractId}
      />
    </div>
  );
};

export default ContractManagementPage;