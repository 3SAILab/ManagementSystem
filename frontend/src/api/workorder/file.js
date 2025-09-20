import api from '../index';

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
    return { success: true, ...response.data };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || '获取失败' 
    };
  }
};

// 下载文件
export const downloadFile = async (fileId, fileName) => {
  try {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
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

// 预览文件
export const previewFile = async (fileId) => {
  try {
    const response = await api.get(`/files/${fileId}/preview`, {
      responseType: 'blob'
    });
    return { success: true, blob: response.data };
  } catch (error) {
    console.error('预览文件失败:', error);
    return { 
      success: false, 
      error: error.response?.data?.detail || error.message || '预览失败' 
    };
  }
};

// 工具函数：判断是否为图片文件
export const isImageFile = (fileName) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
};

// 工具函数：判断是否为PDF文件
export const isPdfFile = (fileName) => {
  return fileName.toLowerCase().endsWith('.pdf');
};

// 工具函数：判断是否支持预览
export const isSupportedPreviewType = (fileName) => {
  return isImageFile(fileName) || isPdfFile(fileName);
};

// 工具函数：格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
