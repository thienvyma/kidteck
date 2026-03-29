'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from '@/app/admin/admin.module.css'

export default function DataTable({
  columns = [],
  data = [],
  searchKey,
  actions,
  loading = false,
  emptyMessage = 'Chưa có dữ liệu',
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(0)
  const perPage = 10

  // Debounced search via useMemo on filtered data
  const filtered = useMemo(() => {
    if (!search || !searchKey) return data
    const term = search.toLowerCase()
    return data.filter((row) => {
      const val = row[searchKey]
      return val && String(val).toLowerCase().includes(term)
    })
  }, [data, search, searchKey])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const paginated = sorted.slice(page * perPage, (page + 1) * perPage)
  const showFrom = sorted.length === 0 ? 0 : page * perPage + 1
  const showTo = Math.min((page + 1) * perPage, sorted.length)

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }, [sortKey])

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value)
    setPage(0)
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className={styles.dataTableWrap}>
        <div className={styles.dataTableToolbar}>
          <div className={styles.skeletonSearch} />
        </div>
        <div className={styles.dataTableScroll}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className={styles.skeletonCell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dataTableWrap}>
      {/* Toolbar */}
      {searchKey && (
        <div className={styles.dataTableToolbar}>
          <div className={styles.searchBox}>
            <svg style={{width:'18px',height:'18px',color:'var(--color-gray-500)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.dataTableScroll}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={styles.sortableHeader}
                >
                  <span>{col.label}</span>
                  {sortKey === col.key && (
                    <span className={styles.sortArrow}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.emptyState}>
                  <svg style={{width:'40px',height:'40px',color:'var(--color-gray-500)',marginBottom:'8px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className={styles.actionBtns}>
                        {actions.map((action, ai) => {
                          const hidden =
                            typeof action.hidden === 'function'
                              ? action.hidden(row)
                              : action.hidden
                          const disabled =
                            typeof action.disabled === 'function'
                              ? action.disabled(row)
                              : action.disabled
                          const label =
                            typeof action.label === 'function'
                              ? action.label(row)
                              : action.label

                          if (hidden) {
                            return null
                          }

                          return (
                            <button
                              key={ai}
                              onClick={() => action.onClick(row)}
                              className={styles.actionBtn}
                              disabled={disabled}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Hiển thị {showFrom}–{showTo} / {sorted.length}
          </span>
          <div className={styles.paginationBtns}>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className={styles.pageBtn}
            >
              ← Trước
            </button>
            <span className={styles.pageIndicator}>
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={styles.pageBtn}
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
