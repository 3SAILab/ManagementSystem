import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { toast } from 'react-toastify';

const FilterDropdown = ({ followUpStatusMap, filters, onFilterChange }) => {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState(filters.status || []);
  const [sourceFilters, setSourceFilters] = useState(filters.source || []);

  // 处理状态筛选
  const handleStatusChange = (event) => {
    const { value, checked } = event.target;
    const newStatusFilters = checked
      ? [...statusFilters, value]
      : statusFilters.filter((item) => item !== value);

    setStatusFilters(newStatusFilters);
  };

  // 处理来源筛选
  const handleSourceChange = (event) => {
    const { value, checked } = event.target;
    const newSourceFilters = checked
      ? [...sourceFilters, value]
      : sourceFilters.filter((item) => item !== value);

    setSourceFilters(newSourceFilters);
  };

  // 应用筛选
  const applyFilters = () => {
    onFilterChange({ status: statusFilters, source: sourceFilters });
    setIsOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#filter-btn') && !event.target.closest('#filter-dropdown')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* 筛选按钮 */}
      <button
        id="filter-btn"
        className="bg-white border border-slate-300 text-slate-700 font-medium py-2 px-3 rounded-lg flex items-center gap-2 transition-colors hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icons.Filter className="w-4 h-4" /> Filters
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          id="filter-dropdown"
          className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 transition-all duration-300 transform origin-top-right w-max"
          style={isOpen ? { opacity: 1, visibility: 'visible' } : { opacity: 0, visibility: 'hidden' }}
        >
          {/* 状态筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">按状态过滤</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(followUpStatusMap).map(([key, { text }]) => (
                <div key={text} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    data-filter-type="status"
                    value={text}
                    className="form-checkbox h-4 w-4 rounded text-indigo-600"
                    checked={statusFilters.includes(text)}
                    onChange={handleStatusChange}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 来源筛选 */}
          <div className="mt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">按客户来源过滤</h4>
            <div className="grid grid-cols-2 gap-2">
              {['线上', '线下', '活动'].map((source) => (
                <div key={source} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    data-filter-type="source"
                    value={source}
                    className="form-checkbox h-4 w-4 rounded text-indigo-600"
                    checked={sourceFilters.includes(source)}
                    onChange={handleSourceChange}
                  />
                  <span>{source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setStatusFilters([]);
                setSourceFilters([]);
                onFilterChange({ status: [], source: [] });
              }}
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              重置
            </button>
            <button
              onClick={applyFilters}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded"
            >
              应用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;