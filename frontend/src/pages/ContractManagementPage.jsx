import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import ContractCard from '../components/ContractCard';
import AddTicketModal from '../components/AddTicketModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPendingContractsForProduction } from '../services/contractService';
import { addTicket } from '../services/ticketService';
import { useNotificationStore } from '../store/notifications';

const ContractManagementPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 通知状态管理
  const { 
    contractNotifications, 
  } = useNotificationStore();
  
  // 创建工单模态框状态
  const [createTicketModal, setCreateTicketModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  // 获取待处理合同列表
  const loadPendingContracts = async () => {
    try {
      setLoading(true);
      const result = await getPendingContractsForProduction();
      if (result.success) {
        // 确保返回的是数组
        const contractsData = Array.isArray(result.data) ? result.data : [];
        setContracts(contractsData);
      } else {
        toast.error(result.error || '获取合同列表失败');
        setContracts([]); // 确保设置为空数组
      }
    } catch (error) {
      console.error('加载合同列表失败:', error);
      toast.error('加载合同列表失败');
      setContracts([]); // 确保设置为空数组
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingContracts();
  }, []);

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
      {/* 页面标题和通知 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">合同管理</h1>
          <p className="text-gray-600 mt-1">查看并管理待处理的合同</p>
        </div>
        
        {/* 通知区域 */}
        <div className="flex items-center space-x-4">
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