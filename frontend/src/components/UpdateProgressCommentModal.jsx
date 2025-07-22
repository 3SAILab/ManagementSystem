import { useEffect, useRef, useState } from 'react';

const UpdateProgressCommentModal = ({
  orderId,
  oldProgress,
  newProgress,
  onCancel,
  onSubmit,
  onClose,
}) => {
  const [comment, setComment] = useState('');
  const formRef = useRef(null);

  // 自动聚焦到 textarea
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // 回传数据给父组件
    onSubmit?.(orderId, newProgress, comment);
    onClose(); // 关闭模态
  };

  const handleCancel = () => {
    // 通知父组件取消，并还原 UI（如滑块）
    onCancel?.(orderId, oldProgress);
    onClose();
  };

  // 点击遮罩关闭（可选）
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">更新进度说明</h3>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-sm text-slate-700">
            您正在将进度从{' '}
            <strong>{oldProgress}%</strong> 更新至{' '}
            <strong>{newProgress}%</strong>。
          </p>

          <div>
            <label htmlFor="progress-comment" className="block text-sm font-medium text-slate-700 mb-1">
              请填写更新说明（例如：完成了什么工作）
            </label>
            <textarea
              id="progress-comment"
              ref={textareaRef}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="例如：完成了线框图初稿..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white py-2 px-4 rounded-lg text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              确认更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgressCommentModal;