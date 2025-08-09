import React from "react";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const generatePageNumbers = () => {
    const range = [];
    const visiblePages = 5;
    if (totalPages <= visiblePages) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
      return range;
    }

    if (currentPage <= 2) {
      for (let i = 1; i <= 3; i++) range.push(i);
      range.push("...");
      range.push(totalPages);
      return range;
    }

    if (currentPage >= totalPages - 2) {
      range.push(1);
      range.push("...");
      for (let i = totalPages - 2; i <= totalPages; i++) range.push(i);
      return range;
    }

    range.push(1);
    range.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
    range.push("...");
    range.push(totalPages);
    return range;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="p-4 border-t border-slate-200 text-sm text-slate-600 flex items-center">
      {/* 分页按钮组 */}
      <div className="ml-auto flex items-center gap-2">
        {/* 左箭头按钮 */}
        <button
          className={`w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 ${
            currentPage === 1 ? "disabled:opacity-50 disabled:cursor-not-allowed" : ""
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <LucideChevronLeft className="w-4 h-4" />
        </button>

        {/* 动态生成的页码按钮 */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <button
                key={index}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                ...
              </button>
            );
          }
          return (
            <button
              key={pageNumber}
              className={`w-8 h-8 flex items-center justify-center rounded border ${
                pageNumber === currentPage
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* 右箭头按钮 */}
        <button
          className={`w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 ${
            currentPage >= totalPages ? "disabled:opacity-50 disabled:cursor-not-allowed" : ""
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <LucideChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;