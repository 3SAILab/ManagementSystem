import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, AlertCircle } from 'lucide-react';
import { 
  getContractFiles, 
  getPreviewUrl, 
  getDownloadUrl, 
  downloadFile, 
  isImageFile, 
  isPdfFile, 
  isSupportedPreviewType,
  formatFileSize 
} from '../services/fileService';
import { toast } from 'react-toastify';

const FilePreviewModal = ({ isOpen, onClose, contractId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && contractId) {
      loadContractFiles();
    }
  }, [isOpen, contractId]);

  const loadContractFiles = async () => {
    setLoading(true);
    try {
      const result = await getContractFiles(contractId);
      if (result.success) {
        setFiles(result.files || []);
        if (result.files && result.files.length > 0) {
          setSelectedFile(result.files[0]);
        }
      } else {
        toast.error(result.error || '获取文件列表失败');
      }
    } catch (error) {
      console.error('加载文件失败:', error);
      toast.error('加载文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    setDownloading(true);
    try {
      const result = await downloadFile(file.id, file.original_filename);
      if (result.success) {
        toast.success('文件下载成功');
      } else {
        toast.error(result.error || '下载失败');
      }
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (isImageFile(fileType)) {
      return (
        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
          <Image className="w-4 h-4 text-green-600" />
        </div>
      );
    } else if (isPdfFile(fileType)) {
      return (
        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
          <FileText className="w-4 h-4 text-red-600" />
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-600" />
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 flex">
        {/* 文件列表侧边栏 */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-slate-800">合同文件</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="关闭"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>暂无文件</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">{file.contract_type}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.file_size)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 文件预览区域 */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 truncate" title={selectedFile.original_filename}>
                    {selectedFile.original_filename}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">{selectedFile.contract_type}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.file_size)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    disabled={downloading}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloading ? '下载中...' : '下载'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 bg-gray-50">
                {isSupportedPreviewType(selectedFile.file_type) ? (
                  <>
                    {isImageFile(selectedFile.file_type) ? (
                      <div className="h-full flex items-center justify-center">
                        <img
                          src={getPreviewUrl(selectedFile.id)}
                          alt={selectedFile.original_filename}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="text-center hidden">
                          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">图片加载失败</p>
                          <button
                            onClick={() => handleDownload(selectedFile)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            下载查看
                          </button>
                        </div>
                      </div>
                    ) : isPdfFile(selectedFile.file_type) ? (
                      <div className="h-full">
                        <iframe
                          src={getPreviewUrl(selectedFile.id)}
                          className="w-full h-full border-0 rounded-lg"
                          title={selectedFile.original_filename}
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-600 mb-4">不支持预览此文件类型</p>
                      <p className="text-sm text-gray-500 mb-4">支持的预览类型：PDF、图片（JPG、PNG、GIF、WebP）</p>
                      <button
                        onClick={() => handleDownload(selectedFile)}
                        disabled={downloading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                      >
                        <Download className="w-4 h-4" />
                        <span>{downloading ? '下载中...' : '下载查看'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>请选择要预览的文件</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;