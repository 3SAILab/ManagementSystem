
const OrderCard = ({ subTaskId, ticketName, progress, warning, clientName, onClick }) => {
  return (
    <div
      key={subTaskId}
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-md border border-slate-200/80 cursor-pointer hover:border-indigo-500 transition-all duration-300"
      data-sub-task-id={subTaskId}
    >
      {/* 标题与状态 */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-slate-800 pr-2 truncate">
          {ticketName}
        </h4>
        <span
          className={`text-xs px-2 py-1 rounded-full capitalize ${
            warning === '红色预警'
              ? 'bg-red-100 text-red-700'
              : warning === '黄色预警'
              ? 'bg-yellow-100 text-yellow-700'
              : warning === '正常'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {warning}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>进度</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 底部信息：负责人 + 客户 */}
      <div className="text-sm text-slate-400 flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center -space-x-2">
            {/** */}
        </div>
        <span className="text-xs">客户: {clientName}</span>
      </div>
    </div>
  );
};

export default OrderCard;