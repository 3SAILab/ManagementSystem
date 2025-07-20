import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContractDetail } from '../services/contractService';
import { addTicket } from '../services/ticketService';
import AddTicketModal from '../components/AddTicketModal';
import { ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const ContractDetailPage = () => {
    // 创建工单模态框是否显示
    const [createOrderModal, setCreateOrderModal] = useState(false);
    const { id } = useParams();
    // 合同详情数据
    const [contractData, setContractData] = useState({
        pendingDetails: { detailPage: 0, video: 0, image: 0, workflow: 0 },
        completedDetails: { detailPage: 0, video: 0, image: 0, workflow: 0 },
        yellowCount: 0,
        redCount: 0,
        artTasks: [],
        renderTasks: [],
    });

    // 根据合同id刷新页面
    const init = () => {
        getContractDetail(id).then(res => {
            setContractData({
                pendingDetails: res.pending_details,
                completedDetails: res.completed_details,
                yellowCount: res.yellow_count,
                redCount: res.red_count,
                artTasks: res.art_tasks,
                renderTasks: res.render_tasks,
            });
        }).catch(err => {
            toast.error("加载合同详情失败");
            console.error("Error fetching contract details:", err);
        });
    }

    useEffect(() => {
        init();
    }, [id]);

    // 计算待完成和已完成的总数
    const pendingTotal = Object.values(contractData.pendingDetails).reduce((sum, count) => sum + count, 0);
    const completedTotal = Object.values(contractData.completedDetails).reduce((sum, count) => sum + count, 0);

    // 处理工单创建
    const handleAddTicket = async (ticketData) => {
        try {
            // 确保合同ID正确设置
            const ticketWithContractId = {
                ...ticketData,
                contract_id: parseInt(id)
            };
            
            const result = await addTicket(ticketWithContractId);
            console.log('工单创建成功:', result);
            
            // 关闭模态框
            setCreateOrderModal(false);
            init();
            toast.success('创建工单成功');
        } catch (err) {
            toast.error('创建工单失败，请重试');
        } 
    };
  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="p-4 flex justify-between items-center gap-4">
        {/* 返回按钮 */}
        <Link
          to="/sales_dashboard"
          className="flex items-center text-gray-500 hover:text-gray-700 group"
        >
          {/* 使用 lucide-react 的 ChevronLeft 图标 */}
          <ChevronLeft
            className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200"
          />
          <span className="text-sm font-medium">返回销售看板</span>
        </Link>
        {/* 创建工单 */}
        {/* 添加客户按钮 */}
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors" 
        onClick={() => {
            setCreateOrderModal(true);
          }}
        >
          <Plus className="w-4 h-4" /> 创建工单
        </button>
        
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 待开始 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
            <div className="grid grid-cols-2 gap-4">
                {/* 左侧：title 和 count */}
                <div>
                <h2 className="text-lg font-bold">待完成</h2>
                <div className={`text-gray-500 text-4xl font-bold mt-2`}>{pendingTotal}</div>
                </div>
                {/* 右侧：ul 列表 */}
                <ul className="mt-4 text-sm">
                    <li>详情页：{contractData.pendingDetails.detailPage}</li>
                    <li>视频：{contractData.pendingDetails.video}</li>
                    <li>图片：{contractData.pendingDetails.image}</li>
                    <li>工作流：{contractData.pendingDetails.workflow}</li>
                </ul>
            </div>
        </div>

        {/* 已完成 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
            <div className="grid grid-cols-2 gap-4">
                {/* 左侧：title 和 count */}
                <div>
                <h2 className="text-lg font-bold">已完成</h2>
                <div className={`text-green-500 text-4xl font-bold mt-2`}>{completedTotal}</div>
                </div>

                {/* 右侧：ul 列表 */}
                <ul className="mt-4 text-sm">
                <li>详情页：{contractData.completedDetails.detailPage}</li>
                <li>视频：{contractData.completedDetails.video}</li>
                <li>图片：{contractData.completedDetails.image}</li>
                <li>工作流：{contractData.completedDetails.workflow}</li>
                </ul>
            </div>
        </div>

        {/* 黄色预警 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-bold">黄色预警</h2>
            <div className={`text-yellow-500 text-4xl font-bold mt-2`}>{contractData.yellowCount}</div>
        </div>
        {/* 红色预警 */}
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-bold">红色预警</h2>
            <div className={`text-red-500 text-4xl font-bold mt-2`}>{contractData.redCount}</div>
        </div>
      </div>
      
      {/* 任务表格区域 - 美工和渲染任务并排显示 */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* 美工任务表格 */}
        <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-visible min-h-0 w-full md:w-1/2">
          {/* 表格头部 */}
          <div className="bg-white">
            <h3 className="p-4 border-b border-slate-200 text-lg font-semibold">美工任务</h3>
            {contractData.artTasks.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                暂无数据
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-slate-600">创建时间</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">工单名称</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">组长</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">负责人</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">任务进度</th>
                    
                    <th className="p-4 text-sm font-semibold text-slate-600">预警</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contractData.artTasks.map((artTask, index) => {
                    return (
                      <tr key={index} 
                          className={`hover:bg-slate-50 cursor-pointer`}
                      >
                        <td className="p-4 font-medium text-slate-800">{artTask.created_at}</td>
                        <td className="p-4 text-slate-600">{artTask.name}</td>
                        <td className="p-4 text-slate-600">{artTask.assignee || '暂无'}</td>
                        <td className="p-4 text-slate-600">{artTask.charge || '暂无'}</td>
                        <td className="p-4 text-slate-600">{artTask.status}</td>
                        <td className="p-4 text-slate-600">{artTask.warning}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* 渲染任务表格 */}
        <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-visible min-h-0 w-full md:w-1/2">
          {/* 表格头部 */}
          <div className="bg-white">
            <h3 className="p-4 border-b border-slate-200 text-lg font-semibold">渲染任务</h3>
            {contractData.renderTasks.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                暂无数据
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-slate-600">创建时间</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">工单名称</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">组长</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">负责人</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">任务进度</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">预警</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contractData.renderTasks.map((renderTask, index) => {
                    return (
                      <tr key={index}
                          className={`hover:bg-slate-50 cursor-pointer`}
                      >
                        <td className="p-4 font-medium text-slate-800">{renderTask.created_at}</td>
                        <td className="p-4 text-slate-600">{renderTask.name}</td>
                        <td className="p-4 text-slate-600">{renderTask.assignee || '暂无'}</td>
                        <td className="p-4 text-slate-600">{renderTask.charge || '暂无'}</td>
                        <td className="p-4 text-slate-600">{renderTask.status}</td>
                        <td className="p-4 text-slate-600">{renderTask.warning}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 创建工单模态框 */}
      <AddTicketModal 
        isOpen={createOrderModal} 
        onClose={() => setCreateOrderModal(false)} 
        onAdd={handleAddTicket}
        contractId={parseInt(id)}
      />
    </div>
  );
};

export default ContractDetailPage;
