import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const FilterDropdown = ({ followUpStatusMap, filters, onFilterChange, onExport = null }) => {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState(filters.status || []);
  const [sourceFilters, setSourceFilters] = useState(filters.source || []);
  const [startTime, setStartTime] = useState(filters.startTime || ''); // ISO 格式字符串
  const [endTime, setEndTime] = useState(filters.endTime || '');

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

  // 处理时间输入
  const handleTimeChange = (type, value) => {
    if (type === 'start') setStartTime(value);
    if (type === 'end') setEndTime(value);
  };

  // 应用筛选
  const applyFilters = () => {
    onFilterChange({
      status: statusFilters,
      source: sourceFilters,
      startTime, // ISO 字符串，如 "2025-08-14T09:00"
      endTime,
    });
    setIsOpen(false);
  };

  // 重置所有筛选
  const resetFilters = () => {
    setStatusFilters([]);
    setSourceFilters([]);
    setStartTime('');
    setEndTime('');
    onFilterChange({ status: [], source: [], startTime: '', endTime: '' });
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
          className="absolute z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-4 transition-all duration-300 w-max"
          style={{
            right: 0,
            top: '100%',
            marginTop: '5px',
            minWidth: '280px',
            maxWidth: '320px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {/* 状态筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">按状态过滤</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(followUpStatusMap).map(([, { text }]) => (
                <div key={text} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
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
          <div className="mt-4 border-t border-slate-200 pt-3">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">按客户来源过滤</h4>
            <div className="grid grid-cols-2 gap-2">
              {['线上', '线下', '活动'].map((source) => (
                <div key={source} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
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

          {/* 时间区间筛选 */}
          <div className="mt-4 border-t border-slate-200 pt-3">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">按接入时间过滤</h4>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-600 mb-1">开始时间</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">结束时间</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="mt-5 flex justify-between gap-2 border-t border-slate-200 pt-3">
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-700 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Icons.RotateCcw className="w-4 h-4" />
              重置
            </button>
            {onExport && (
              <button
                onClick={() => onExport({
                  status: statusFilters,
                  source: sourceFilters,
                  startTime,
                  endTime
                })}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Icons.Download className="w-4 h-4" />
                导出
              </button>
            )}
            <button
              onClick={applyFilters}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Icons.Check className="w-4 h-4" />
              应用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;