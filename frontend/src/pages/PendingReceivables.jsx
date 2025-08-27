import { useEffect, useState } from 'react';
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



  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">待催收尾款列表</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="搜索客户"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value, page: 1 })}
            />
          </div>
          <div className="text-sm text-slate-600">共 {total} 条</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 text-sm">
                <th className="p-3">客户</th>
                <th className="p-3">总金额</th>
                <th className="p-3">已支付金额</th>
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

        <div className="p-4 border-t border-slate-200 flex items-center justify-end text-sm text-slate-600">
          <Pagination
            totalItems={total}
            itemsPerPage={filters.page_size}
            currentPage={filters.page}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      </div>
    </div>
  );
};

export default PendingReceivables;