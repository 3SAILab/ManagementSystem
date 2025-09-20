const OrderCard = ({
  subTaskId,
  ticketName,
  progress,
  warning,
  clientName,
  estimatedCompletionTime,
  chargeName = null,
  performanceSalary = null,
  need_watermark,
  onClick,
}) => {
  // 根据 warning 状态设置卡片样式类
  const getCardClasses = () => {
    let baseClasses =
      "rounded-xl p-4 shadow-md border cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden";

    if (warning === '红色预警') {
      return `${baseClasses} bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-900`;
    } else if (warning === '黄色预警') {
      return `${baseClasses} bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 text-orange-900`;
    } else {
      return `${baseClasses} bg-white border-slate-200/80 text-slate-800 hover:border-indigo-500`;
    }
  };

  return (
    <div
      key={subTaskId}
      onClick={onClick}
      className={getCardClasses()}
      data-sub-task-id={subTaskId}
    >
      {/* 警示条装饰（左侧竖条）可选增强 */}
      {warning === '红色预警' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
      )}
      {warning === '黄色预警' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
      )}

      {/* 标题与状态 */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold pr-2 truncate max-w-[70%]">
          {ticketName}
        </h4>

        {performanceSalary && (
          <span className="text-xs px-2 py-1 rounded-full capitalize bg-indigo-100 text-indigo-700">
            {performanceSalary}元
          </span>
        )}

        <span
          className={`text-xs px-2 py-1 rounded-full capitalize font-medium whitespace-nowrap
            ${warning === '红色预警'
              ? 'bg-red-200 text-red-800 ring-1 ring-red-300'
              : warning === '黄色预警'
              ? 'bg-yellow-200 text-yellow-800 ring-1 ring-yellow-300'
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
            className={`h-1.5 rounded-full transition-all duration-500 ${
              warning === '红色预警'
                ? 'bg-red-500'
                : warning === '黄色预警'
                ? 'bg-yellow-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className={`text-sm flex items-center justify-between mt-4 pt-3 border-t text-slate-500
        ${warning === '红色预警' ? 'border-red-200' : 
          warning === '黄色预警' ? 'border-yellow-200' : 'border-slate-100'}
      `}>
        <div className="flex items-center -space-x-2">
          <span className="text-xs">预计所需时间: {estimatedCompletionTime}天</span>
        </div>

        {chargeName && (
          <div className="flex items-center -space-x-2">
            <span className="text-xs">负责人: {chargeName}</span>
          </div>
        )}

        <div className="flex items-center space-x-1 text-xs">
          <span>打水印：</span>
          <span className={`font-medium px-2 py-0.5 rounded-full
            ${need_watermark
              ? 'text-orange-600 bg-orange-50'
              : 'text-green-700 bg-green-50'
            }`}>
            {need_watermark ? '是' : '否'}
          </span>
        </div>

        <div className="flex items-center -space-x-2">
          <span className="text-xs">客户: {clientName}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;