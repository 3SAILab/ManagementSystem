import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  contractNotifications: {
    newContracts: [],        // 新创建的合同ID数组
    appendixContracts: [],   // 有附属合同的主合同ID数组
    lastChecked: null        // 上次查看时间
  },
  
  // 添加新合同通知
  addNewContractNotification: (contractId) => {
    set(state => ({
      contractNotifications: {
        ...state.contractNotifications,
        newContracts: [...state.contractNotifications.newContracts, contractId]
      }
    }));
  },
  
  // 添加附属合同通知
  addAppendixContractNotification: (contractId) => {
    set(state => ({
      contractNotifications: {
        ...state.contractNotifications,
        appendixContracts: [...state.contractNotifications.appendixContracts, contractId]
      }
    }));
  },
  
  // 清除单个通知
  clearNotification: (contractId) => {
    set(state => ({
      contractNotifications: {
        ...state.contractNotifications,
        newContracts: state.contractNotifications.newContracts.filter(id => id !== contractId),
        appendixContracts: state.contractNotifications.appendixContracts.filter(id => id !== contractId)
      }
    }));
  },
  
  // 清除所有通知
  clearAllNotifications: () => {
    set(state => ({
      contractNotifications: {
        ...state.contractNotifications,
        newContracts: [],
        appendixContracts: []
      }
    }));
  },
  
  // 更新最后查看时间
  updateLastChecked: () => {
    set(state => ({
      contractNotifications: {
        ...state.contractNotifications,
        lastChecked: new Date().getTime()
      }
    }));
  },
  
  // 获取通知总数
  getTotalNotificationCount: () => {
    const { contractNotifications } = get();
    return contractNotifications.newContracts.length + contractNotifications.appendixContracts.length;
  },
  
  // 检查是否有新通知
  hasNotifications: () => {
    const { contractNotifications } = get();
    return contractNotifications.newContracts.length > 0 || contractNotifications.appendixContracts.length > 0;
  }
}));