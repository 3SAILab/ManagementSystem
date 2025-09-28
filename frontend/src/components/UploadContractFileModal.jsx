import React, { useState, useRef, useEffect } from "react";
import ModalCloseButton from "./ModalCloseButton";

const UploadContractFileModal = ({ isOpen, onClose, onAdd }) => {
  const [attachment, setAttachment] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "application/zip",
    "application/x-zip-compressed"
  ];

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleFileSelect = (fileList) => {
    setUploadError("");
    const file = Array.from(fileList)[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("单文件大小不能超过 100MB");
      return;
    }

    const isTypeAccepted =
      ACCEPTED_TYPES.includes(file.type) ||
      file.name.toLowerCase().endsWith('.zip');

    if (!isTypeAccepted) {
      setUploadError("不支持的文件类型");
      return;
    }

    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment({ file, name: file.name, size: file.size, type: file.type, preview });
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
    setUploadError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!attachment) {
      setUploadError("请先上传合同附件");
      return;
    }
    onAdd(attachment); // 只传 attachment
    onClose();
  };

  const handleClose = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
    };
  }, [attachment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">上传合同附件</h2>
            <ModalCloseButton onClose={handleClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 上传区域 */}
          {!attachment ? (
            <div
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragging(true); }}
              onDragEnter={(e) => { e.preventDefault(); dragCounter.current += 1; setIsDragging(true); }}
              onDragLeave={(e) => {
                e.preventDefault();
                dragCounter.current -= 1;
                if (dragCounter.current <= 0) {
                  setIsDragging(false);
                  dragCounter.current = 0;
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                dragCounter.current = 0;
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
              }`}
              onClick={() => document.getElementById("file-upload-input").click()}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                className="sr-only"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <svg
                className={`w-12 h-12 mx-auto ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2 text-sm text-slate-600">
                {isDragging ? (
                  <span className="font-medium text-indigo-600">松开鼠标即可上传</span>
                ) : (
                  <>
                    <span className="font-medium text-indigo-600">点击上传</span> 或拖拽文件到这里
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                支持 PDF、Word、图片、ZIP，单文件不超过 100MB
              </p>
              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">已选择文件</h4>
              <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                <div className="flex items-center space-x-3 flex-1">
                  {attachment.type?.startsWith("image/") && attachment.preview ? (
                    <img
                      src={attachment.preview}
                      className="w-10 h-10 object-cover rounded"
                      alt="preview"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <span className="text-xs text-slate-500">
                        {attachment.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="text-slate-400 hover:text-red-500 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              onClick={handleClose}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              确认上传
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadContractFileModal;