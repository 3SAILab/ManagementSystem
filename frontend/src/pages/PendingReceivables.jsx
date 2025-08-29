import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAllContracts } from '../services/contractService';
import DateUtils from '../utils/dateUtils';
import Pagination from '../components/Pagination';

const PendingReceivables = () => {
  const [contracts, setContracts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    status: ['待结算'],
    contract_type: [],
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAllContracts(filters);
        if (res.success) {
          setContracts(res.data.contracts || []);
          setTotal(res.data.total || 0);
        } else {
          setError(res.error || '加载失败');
        }
      } catch (error) {
        console.error(`${error}`);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);



  const navigate = useNavigate();

  return (
    <div className="p-4">

      <div className="bg-white rounded-xl shadow-sm border">
        
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales_data')}
              className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800">待催收尾款列表</h2>
          </div>
          <div className="relative min-w-[220px]">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.89 9.39l3.6 3.6a.75.75 0 1 0 1.06-1.06l-3.6-3.6A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="搜索客户"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value, page: 1 })}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 text-sm">
                <th className="p-3">客户</th>
                <th className="p-3">总金额</th>
                <th className="p-3">首付款</th>
                <th className="p-3">合同接入时间</th>
                <th className="p-3">销售</th>
                <th className="p-3">是否充值</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan="5">加载中...</td></tr>
              ) : error ? (
                <tr><td className="p-4 text-red-500" colSpan="6">{error}</td></tr>
              ) : contracts.length === 0 ? (
                <tr><td className="p-4 text-slate-500" colSpan="6">暂无数据</td></tr>
              ) : (
                contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" >
                    <td className="p-3">{c.client_name}</td>
                    <td className="p-3">¥{(c.total_amount || 0).toLocaleString()}</td>
                    <td className="p-3">¥{(c.paid_amount || 0).toLocaleString()}</td>
                    <td className="p-3">{DateUtils.formatDateYMD(c.transaction_time)}</td>
                    <td className="p-3">{c.sales_name || ''}</td>
                    <td className="p-3"><span className={`inline-block px-2 py-1 text-xs rounded-full ${c.is_recharged ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{c.is_recharged ? '是' : '否'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center bg-slate-50/60">
          <span>显示 {contracts.length} / 共 {total} 条数据</span>
          <div>
            <Pagination
              totalItems={total}
              itemsPerPage={filters.page_size}
              currentPage={filters.page}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingReceivables;