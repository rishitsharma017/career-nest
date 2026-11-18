
import { useEffect, useMemo, useState } from "react";

function usePagination(items, pageSize = 4, resetKey = "") {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / pageSize)
  );

  // Reset pagination when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [resetKey, pageSize]);

  // Prevent an invalid page number
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return items.slice(startIndex, startIndex + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage
  };
}

export default usePagination;
