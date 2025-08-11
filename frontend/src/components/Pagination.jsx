import React from "react";
import { Pagination as AntPagination } from "antd";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  return (
    <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex items-center">
      <div className="ml-auto">
        <AntPagination
          total={totalItems}
          pageSize={itemsPerPage}
          current={currentPage}
          onChange={(page) => onPageChange(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default Pagination;