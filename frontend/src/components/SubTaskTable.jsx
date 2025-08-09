import React, { useState } from 'react';
import ReadOnlyOrderDetailsPanel from './ReadOnlyOrderDetailsPanel';

const SubTaskTable = ({subTasks = []}) => {
  // 选中的任务id
  const [taskId, setTaskId] = useState(null);

  if (subTasks.length === 0) {
    return (
      <div className="overflow-x-auto">
        <div className="p-4 text-center text-slate-500">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full max-w-full">
      <table className="min-w-full w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-sm font-semibold text-slate-600">类型</th>
            <th className="p-4 text-sm font-semibold text-slate-600">组长</th>
            <th className="p-4 text-sm font-semibold text-slate-600">负责人</th>
            <th className="p-4 text-sm font-semibold text-slate-600">状态</th>
            <th className="p-4 text-sm font-semibold text-slate-600">任务进度</th>
            <th className="p-4 text-sm font-semibold text-slate-600">预警</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {subTasks.map((subTask) => {
            return (
              <tr 
                key={subTask.id} 
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  setTaskId(subTask.id);
                }}
              >
                <td className="p-4 text-slate-600">{subTask.type || '-'}</td>
                <td className="p-4 text-slate-600">{subTask.leader || '-'}</td>
                <td className="p-4 text-slate-600">{subTask.charge || '-'}</td>
                <td className="p-4 text-slate-600">{subTask.status || '-'}</td>
                <td className="p-4 text-slate-600">{subTask.progress || 0}</td>
                <td className="p-4">
                    <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        subTask.warning === '红色预警'
                            ? 'bg-red-100 text-red-700'
                            : subTask.warning === '黄色预警'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {subTask.warning || '-'}
                    </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 任务详情 */}
      {taskId !== null && (
        <ReadOnlyOrderDetailsPanel
          onClose={() => setTaskId(null)}
          orderId={taskId}
        />
      )}
    </div>
  );
};

export default SubTaskTable;