import { useEffect, useState } from 'react';
import { marked } from 'marked';
import ModalCloseButton from './ModalCloseButton';
import DateUtils from '../utils/dateUtils';

export function UpdateModal({ isOpen, onClose }) {
  const [content, setContent] = useState('');
  const [lastModified, setLastModified] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/updates/update.md?t=' + Date.now())
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');

          // 尝试从响应头获取最后修改时间
          const lastMod = res.headers.get('Last-Modified');
          if (lastMod) {
            setLastModified(DateUtils.formatDateTime(new Date(lastMod)));
          } else {
            setLastModified(null); // 或者设为 new Date() 作为 fallback
          }

          return res.text();
        })
        .then((text) => {
          setContent(marked.parse(text));
        })
        .catch(() => {
          setContent('<p class="text-gray-500">加载更新内容失败。</p>');
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 bg-gradient-to-r bg-indigo-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">更新日志</h2>
          <div className="flex items-center gap-4">
            {/* 时间标签 */}
            <span className="text-xs sm:text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
              {lastModified}
            </span>
            <ModalCloseButton onClose={onClose} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 p-6 overflow-y-auto prose prose-sm max-w-none bg-indigo-50"
          style={{
            fontSize: '0.975rem',
            lineHeight: '1.75',
            color: '#1f2937',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}