import api from './api';

// 获取合同相关的所有文件
export const getContractFiles = async (contractId) => {
  try {
    const response = await api.get(`/contracts/${contractId}/files`);
    return { success: true, ...response.data };
  } catch (error) {
    console.error('获取合同文件失败:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || '获取失败' 
    };
  }
};

// 获取文件信息
export const getFileInfo = async (fileId) => {
  try {
    const response = await api.get(`/files/${fileId}/info`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || '获取失败' 
    };
  }
};

// 获取文件预览URL
export const getPreviewUrl = (fileId) => {
  return `/api/files/${fileId}/preview`;
};

// 获取文件下载URL
export const getDownloadUrl = (fileId) => {
  return `/api/files/${fileId}/download`;
};

// 下载文件
export const downloadFile = async (fileId, filename) => {
  try {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('下载文件失败:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || '下载失败' 
    };
  }
};

// 预览文件（用于获取blob数据）
export const previewFile = async (fileId) => {
  try {
    const response = await api.get(`/files/${fileId}/preview`, {
      responseType: 'blob'
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('预览文件失败:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || '预览失败' 
    };
  }
};

// 文件类型检查工具函数
export const isImageFile = (fileType) => {
  return fileType && fileType.startsWith('image/');
};

export const isPdfFile = (fileType) => {
  return fileType === 'application/pdf';
};

export const isSupportedPreviewType = (fileType) => {
  return isImageFile(fileType) || isPdfFile(fileType);
};

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};