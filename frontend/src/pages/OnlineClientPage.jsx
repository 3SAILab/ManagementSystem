import React, { useState, useEffect } from 'react';
import ClientSidePanel from '../components/ClientSidePanel'; // 侧边栏组件
import { Search,Edit,Plus,ArrowUp,ArrowDown } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import { getOnlineClients, addOnlineClient, updateOnlineClient } from '../services/clientService';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { getOnlineClientDataStatistics } from '../services/statisticsService';
import SalesClientModal from '../components/SalesClientModal';
import { exportOnlineClients } from '../services/exportService';

const OnlineClientPage = () => {
    // 客户跟进记录ID
    const [clientLogId, setClientLogId] = useState(null);
    // 客户ID
    const [clientId, setClientId] = useState(null);
    // 客户模态框
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
        page_size: 10,
        startTime: '',
        endTime: ''
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
    // 刷新客户信息
    const [refresh, setRefresh] = useState(false);
    // 获取客户活动日志统计数据
    useEffect(() => {
        getOnlineClientDataStatistics().then(res => {
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
        getOnlineClients(filters).then(res => {
            if (res.success) {
                setClients(res.data.clients);
                setTotal(res.data.total);
            } else {
                setClients([]);
                setTotal(0);
            }
        });
    }, [filters, refresh]);
    // 新增或编辑客户
    const onSave = (ClientInfo) => {
        if (clientId) {
            updateOnlineClient(clientId, ClientInfo).then(res => {
                if (res.success) {
                    toast.success('编辑客户成功！');
                    setClients(prev => prev.map(client => client.id === clientId ? res.data : client));
                    setIsModalOpen(false);
                    setRefresh(!refresh);
                } else {
                    toast.error(res.error);
                }
            });
        } else {
            addOnlineClient(ClientInfo).then(res => {
                if (res.success) {
                    toast.success('新增客户成功！');
                    setClients(prev => [res.data, ...prev]);
                    setIsModalOpen(false);
                    setRefresh(!refresh);
                    // 重置页码
                    setFilters(prev => ({ ...prev, page: 1 }));
                } else {
                    toast.error(res.error);
                }
            });
        }
    };
    // 导出客户
    const setExportLoading = useState(false);

    const handleExport = async (exportFilters) => {
        setExportLoading(true);
        try {
            const result = await exportOnlineClients(exportFilters);
            if (result.success) {
                toast.success('导出成功');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error(error)
            toast.error('导出失败');
        } finally {
            setExportLoading(false);
        }
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
                        <div className="flex justify-between items-center">
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
                            
                            {/* 筛选器 */}
                            <div className="flex items-center gap-2">
                                <FilterDropdown followUpStatusMap={followUpStatusMap} filters={filters} onFilterChange={(newFilters) => setFilters({...filters, ...newFilters})} onExport={handleExport} />

                                {/* 添加客户按钮 */}
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors" onClick={
                                    () => {
                                        setIsModalOpen(true);
                                        setClientId(null);
                                    }}>
                                    <Plus className="w-4 h-4" /> 添加客户
                                </button>
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
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户名称</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">创建时间</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">联系人</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">联系方式</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">销售</th>
                                            <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                                        </tr>
                                    </thead>

                                    {/* 表体 */}
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {clients.map((client, index) => (
                                            <tr
                                                key={`${client.id || 'unknown'}-${index}`}
                                                onClick={() => setClientLogId(client.id)}
                                                className={`hover:bg-slate-50 cursor-pointer ${
                                                    clientLogId === client.id ? 'bg-indigo-50' : ''
                                                }`}
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
                                                <td className="p-4 text-sm text-slate-600">
                                                    <span>
                                                        {client.contact_name || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600">
                                                    <span>
                                                        {client.contact_phone || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                        followUpStatusMap[client.status]?.classes || 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {followUpStatusMap[client.status]?.text || '未知状态'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500">
                                                    {client.sales_name || '未知销售'}
                                                </td>
                                                <td className="p-4 text-slate-500">
                                                    <button className="p-1 rounded hover:bg-slate-100" title="编辑客户信息" onClick={() => {
                                                        setIsModalOpen(true);
                                                        setClientId(client.id);
                                                    }}>
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
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

                {/* 侧边栏 */}
                <ClientSidePanel refresh={refresh} clientId={clientLogId} />

                {isModalOpen && <SalesClientModal isOpen={isModalOpen} onClose={() => {
                    setIsModalOpen(false);
                    setClientId(null);
                }} onSave={onSave} id={clientId}/>}
            </div>
        </div>
    );
};

export default OnlineClientPage;