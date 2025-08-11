// TeamRecordPage.jsx

import React, { useState, useEffect } from 'react';
import { Search, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import Pagination from '../components/Pagination';
import { getClientActivityLogStatistics } from '../services/statisticsService';
import { getClientsWithSalesName, updateClientSales } from '../services/clientService';
// 👇 引入获取客户合同的服务
import { getContractsByClientId } from '../services/contractService'; 
import ClientSidePanel from '../components/ClientSidePanel';
import CustomerSalesModal from '../components/CustomerSalesModal';
import { toast } from 'react-toastify';
import ContractTable from '../components/ContractTable';

const TeamRecordPage = () => {
    // 客户跟进记录ID (用于侧边栏)
    const [clientLogId, setClientLogId] = useState(null);  
    // 客户ID (用于编辑销售负责人)
    const [clientId, setClientId] = useState(null);
    // 是否打开模态框
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 跟进状态映射
    const followUpStatusMap = {
        '刚开始跟进': { text: '刚开始跟进', classes: 'bg-slate-100 text-slate-700' },
        '跟进中': { text: '跟进中', classes: 'bg-blue-100 text-blue-800' },
        '已成交': { text: '已成交', classes: 'bg-green-100 text-green-800' },
        '客户流失': { text: '客户流失', classes: 'bg-red-100 text-red-800' },
        '试单中': { text: '试单中', classes: 'bg-orange-100 text-orange-800' },
        '复购': { text: '复购', classes: 'bg-purple-100 text-purple-800' }
    };
    // 客户列表
    const [clients, setClients] = useState([]);
    // 总条数
    const [total, setTotal] = useState(0);
    // 过滤条件
    const [filters, setFilters] = useState({
        name: '',
        status: [],
        source: [],
        sales_name: '',
        page: 1,
        page_size: 10
    });
    // 统计数据
    const [statistics, setStatistics] = useState({
        monthlyClientCount: 0,
        monthlyClientCountChange: 0,
        monthlyTransactionVolume: 0,
        monthlyTransactionVolumeChange: 0,
        monthlyTransactionConversionRate: 0,
        monthlyTransactionConversionRateChange: 0,
        averageTransactionCycle: 0,
        averageTransactionCycleChange: 0,
    });

    // 👇 新增：用于可展开行的状态
    const [expandedClientId, setExpandedClientId] = useState(null); // 记录当前展开的客户ID
    const [clientContracts, setClientContracts] = useState({}); // 缓存所有客户的合同数据

    // 刷新客户信息
    const [refresh, setRefresh] = useState(false);

    // 获取客户活动日志统计数据
    useEffect(() => {
        getClientActivityLogStatistics().then(res => {
            if (res.success) {
                setStatistics(res.data);
            } else {
                setStatistics({
                    monthlyClientCount: 0,
                    monthlyClientCountChange: 0,
                    monthlyTransactionVolume: 0,
                    monthlyTransactionVolumeChange: 0,
                    monthlyTransactionConversionRate: 0,
                    monthlyTransactionConversionRateChange: 0,
                    averageTransactionCycle: 0,
                    averageTransactionCycleChange: 0,
                });
            }
        });
    }, [refresh]);

    // 获取客户列表
    useEffect(() => {
        getClientsWithSalesName(filters).then(res => {
            if (res.success) {
                setClients(res.data.clients);
                setTotal(res.data.total);
            } else {
                setClients([]);
                setTotal(0);
            }
        });
    }, [filters, refresh]);

    // 👇 新增：切换展开状态并获取合同数据的函数
    const toggleExpand = async (clientId) => {
        // 如果点击的是同一个客户，则收起
        if (expandedClientId === clientId) {
            setExpandedClientId(null);
            return;
        }

        // 设置为展开状态
        setExpandedClientId(clientId);

        // 如果这个客户的合同数据还没有加载过，则去获取
        if (!clientContracts[clientId]) {
            const res = await getContractsByClientId(clientId);
            if (res.success) {
                // 将获取到的合同数据存入 state
                setClientContracts(prev => ({
                    ...prev,
                    [clientId]: res.data
                }));
            } else {
                // 获取失败，也存入一个空数组，避免重复请求
                setClientContracts(prev => ({
                    ...prev,
                    [clientId]: []
                }));
                toast.error(res.message || '获取合同列表失败');
            }
        }
    };

    // 处理保存
    const handleSave = (client) => {
        // 更新客户负责人
        updateClientSales(clientId, client.sales_id, client.notes).then(res => {
            if (res.success) {
                toast.success('客户负责人更新成功');
                setRefresh(!refresh);
                setIsModalOpen(false);
                setClientId(null);
            } else {
                toast.error("更新失败");
            }
        });
    };

    return (
        <div className="flex flex-col h-full min-h-0 bg-slate-50 p-0">
            {/* 统计面板 */}
            <div className="flex-shrink-0 bg-slate-50 pt-1 px-0">
                {/* 统计面板代码... */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-4">
                    {/* 客户数量 */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border">
                        <p className="text-sm text-slate-500 mb-1">客户数量（每月）</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-800">{statistics.monthlyClientCount}</p>
                            <p className={`text-sm font-semibold flex items-center ${
                                statistics.monthlyClientCountChange >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                                {statistics.monthlyClientCountChange >= 0 ? (
                                    <ArrowUp className="w-4 h-4" />
                                ) : (
                                    <ArrowDown className="w-4 h-4" />
                                )}
                                {Math.abs(statistics.monthlyClientCountChange).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    {/* 成交量 */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border">
                        <p className="text-sm text-slate-500 mb-1">成交量（每月）</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-800">{statistics.monthlyTransactionVolume}</p>
                            <p className={`text-sm font-semibold flex items-center ${
                                statistics.monthlyTransactionVolumeChange >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                                {statistics.monthlyTransactionVolumeChange >= 0 ? (
                                    <ArrowUp className="w-4 h-4" />
                                ) : (
                                    <ArrowDown className="w-4 h-4" />
                                )}
                                {Math.abs(statistics.monthlyTransactionVolumeChange).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    {/* 转化率 */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border">
                        <p className="text-sm text-slate-500 mb-1">转化率（每月）</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-800">
                                {(statistics.monthlyTransactionConversionRate * 100).toFixed(1)}%
                            </p>
                            <p className={`text-sm font-semibold flex items-center ${
                                statistics.monthlyTransactionConversionRateChange >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}
                            >
                                {statistics.monthlyTransactionConversionRateChange >= 0 ? (
                                    <ArrowUp className="w-4 h-4" />
                                ) : (
                                    <ArrowDown className="w-4 h-4" />
                                )}
                                {Math.abs(statistics.monthlyTransactionConversionRateChange).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    {/* 平均成交周期 */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border">
                        <p className="text-sm text-slate-500 mb-1">平均成交周期（每月）</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-800">{statistics.averageTransactionCycle}</p>
                            <p className={`text-sm font-semibold flex items-center ${
                                statistics.averageTransactionCycleChange >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                                {statistics.averageTransactionCycleChange >= 0 ? (
                                    <ArrowUp className="w-4 h-4" />
                                ) : (
                                    <ArrowDown className="w-4 h-4" />
                                )}
                                {Math.abs(statistics.averageTransactionCycleChange).toFixed(1)}天
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* 主内容区域 */}
            <div className="flex-grow flex gap-6 p-0 min-h-0">
                {/* 工单列表 */}
                <div className="flex-grow flex flex-col bg-white rounded-xl shadow-sm border overflow-visible min-h-0">
                    {/* 表格头部 */}
                    <div className="p-4 border-b border-slate-200">
                        {/* 搜索框、筛选器等 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                                {/* 搜索区域 */}
                                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                    {/* 客户名称搜索框 */}
                                    <div className="relative flex-1 min-w-0">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="搜索客户名称..." 
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder:text-slate-400 text-sm"
                                            value={filters.name}
                                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                        />
                                    </div>
                                    {/* 销售名称搜索框 */}
                                    <div className="relative flex-1 min-w-0">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="搜索销售名称..." 
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder:text-slate-400 text-sm"
                                            value={filters.sales_name}
                                            onChange={(e) => setFilters({ ...filters, sales_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                {/* 筛选器区域 */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                                    <FilterDropdown 
                                        followUpStatusMap={followUpStatusMap} 
                                        filters={filters} 
                                        onFilterChange={(newFilters) => setFilters({...filters, ...newFilters})} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 表格主体 */}
                    <div className="flex-grow overflow-y-auto px-4">
                        {clients.length <= 0 ? (
                            <div className="flex-grow flex items-center justify-center p-6">
                                <p className="text-center text-slate-500">暂无数据</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-full overflow-x-auto"> {/* 添加滚动条支持 */}
                                <table className="min-w-full w-full">
                                    {/* 表头 */}
                                    <thead>
                                        <tr>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">客户名称</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">创建时间</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户来源</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">产品类型</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">客户规模</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">销售</th>
                                        </tr>
                                    </thead>
                                    {/* 表体 */}
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {clients.map((client) => (
                                            <React.Fragment key={client.id}>
                                                {/* 👇 客户信息行 */}
                                                <tr
                                                    onClick={() => {
                                                        toggleExpand(client.id);
                                                        setClientLogId(client.id);
                                                    }}
                                                    className={`hover:bg-slate-50 cursor-pointer ${expandedClientId === client.id ? 'bg-slate-100' : ''}`}
                                                >
                                                    <td className="p-4 text-sm font-semibold text-slate-700">{client.name}</td>
                                                    <td className="p-4 text-sm text-slate-500">
                                                        {new Date(client.created_at).toLocaleDateString('zh-CN', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                                client.source === '线上'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : client.source === '线下'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {client.source || '未知'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                                            {client.product_type || '未分类'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                                client.scale === '大'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : client.scale === '中'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : client.scale === '小'
                                                                    ? 'bg-slate-100 text-slate-700'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {client.scale || '未知'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                            followUpStatusMap[client.status]?.classes || 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {followUpStatusMap[client.status]?.text || '未知状态'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-500">
                                                        {client.sales_name || '未知销售'}
                                                    </td>
                                                    <td className="p-4">
                                                        <button 
                                                            className="text-slate-500 hover:text-slate-700" 
                                                            onClick={(e) => {
                                                                // ❗️阻止事件冒泡到 tr 的 onClick
                                                                e.stopPropagation(); 
                                                                setIsModalOpen(true);
                                                                setClientId(client.id);
                                                            }}
                                                            title="修改客户负责人"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* 👇 合同列表行 (仅在展开时显示) */}
                                                {expandedClientId === client.id && (
                                                    <tr className="w-full">
                                                        <td colSpan="7" className="p-0"> 
                                                            <div className="w-full bg-slate-50 border-t border-slate-200 my-1 rounded-lg overflow-hidden">
                                                                <div className="p-3 border-b border-slate-200 bg-slate-100">
                                                                    <h4 className="text-sm font-semibold text-slate-700">合同列表</h4>
                                                                </div>
                                                                <ContractTable contracts={clientContracts[client.id]} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {/* 分页 */}
                    <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center">
                        <span>显示 {clients.length} / 共 {total} 条数据</span>
                        <div className="flex items-center gap-2">
                            {/* 分页按钮 */}
                            <Pagination
                                totalItems={total}
                                itemsPerPage={filters.page_size}
                                currentPage={filters.page}
                                onPageChange={(page) => setFilters({...filters, page: page})}
                            />
                        </div>
                    </div>
                </div>
                {/* 客户销售模态框 */}
                {isModalOpen && (
                    <CustomerSalesModal 
                        id={clientId} 
                        onClose={() => {setIsModalOpen(false); setClientId(null);}} 
                        onSave={handleSave} 
                        refresh={refresh}
                    />
                )}
                {/* 侧边栏 */}
                <ClientSidePanel refresh={refresh} clientId={clientLogId} />
            </div>
        </div>
    );
};

export default TeamRecordPage;