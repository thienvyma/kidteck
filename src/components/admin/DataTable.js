'use client'

import { useDeferredValue, useState, useMemo, useCallback } from 'react'
import styles from '@/app/admin/admin.module.css'

export default function DataTable({
  columns = [],
  data = [],
  searchKey,
  actions,
  loading = false,
  emptyMessage = 'Chua co du lieu',
  searchPlaceholder = 'Tim kiem...',
  searchValue: controlledSearchValue,
  onSearchChange,
  sortKey: controlledSortKey,
  sortDir: controlledSortDir,
  onSortChange,
  page: controlledPage,
  onPageChange,
  totalPages: controlledTotalPages,
  totalItems,
  perPage = 10,
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(0)
  const isRemoteMode =
    typeof onSearchChange === 'function' ||
    typeof onSortChange === 'function' ||
    typeof onPageChange === 'function' ||
    typeof totalItems === 'number'
  const activeSearch = controlledSearchValue ?? search
  const activeSortKey = controlledSortKey ?? sortKey
  const activeSortDir = controlledSortDir ?? sortDir
  const activePage = controlledPage ?? page
  const deferredClientSearch = useDeferredValue(activeSearch)

  const filtered = useMemo(() => {
    if (isRemoteMode) return data
    if (!deferredClientSearch || !searchKey) return data

    const term = deferredClientSearch.toLowerCase()
    return data.filter((row) => {
      const val = row[searchKey]
      return val && String(val).toLowerCase().includes(term)
    })
  }, [data, deferredClientSearch, isRemoteMode, searchKey])

  const sorted = useMemo(() => {
    if (isRemoteMode) return filtered
    if (!activeSortKey) return filtered

    return [...filtered].sort((a, b) => {
      const aVal = a[activeSortKey] ?? ''
      const bVal = b[activeSortKey] ?? ''
      if (aVal < bVal) return activeSortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return activeSortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [activeSortDir, activeSortKey, filtered, isRemoteMode])

  const totalPages = isRemoteMode
    ? Math.max(1, controlledTotalPages || 1)
    : Math.max(1, Math.ceil(sorted.length / perPage))
  const paginated = useMemo(
    () =>
      isRemoteMode
        ? sorted
        : sorted.slice(activePage * perPage, (activePage + 1) * perPage),
    [activePage, isRemoteMode, perPage, sorted]
  )
  const totalRows = isRemoteMode ? totalItems || 0 : sorted.length
  const showFrom = totalRows === 0 ? 0 : activePage * perPage + 1
  const showTo = Math.min((activePage + 1) * perPage, totalRows)

  const handleSort = useCallback(
    (key) => {
      if (isRemoteMode) {
        const nextSortDir =
          activeSortKey === key ? (activeSortDir === 'asc' ? 'desc' : 'asc') : 'asc'
        onSortChange?.(key, nextSortDir)
        onPageChange?.(0)
        return
      }

      if (activeSortKey === key) {
        setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
      setPage(0)
    },
    [activeSortDir, activeSortKey, isRemoteMode, onPageChange, onSortChange]
  )

  const handleSearch = useCallback(
    (event) => {
      const nextValue = event.target.value

      if (isRemoteMode) {
        onSearchChange?.(nextValue)
        onPageChange?.(0)
        return
      }

      setSearch(nextValue)
      setPage(0)
    },
    [isRemoteMode, onPageChange, onSearchChange]
  )

  const goToPreviousPage = useCallback(() => {
    if (activePage <= 0) {
      return
    }

    if (isRemoteMode) {
      onPageChange?.(activePage - 1)
      return
    }

    setPage((current) => current - 1)
  }, [activePage, isRemoteMode, onPageChange])

  const goToNextPage = useCallback(() => {
    if (activePage >= totalPages - 1) {
      return
    }

    if (isRemoteMode) {
      onPageChange?.(activePage + 1)
      return
    }

    setPage((current) => current + 1)
  }, [activePage, isRemoteMode, onPageChange, totalPages])

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
      {searchKey && (
        <div className={styles.dataTableToolbar}>
          <div className={styles.searchBox}>
            <svg
              style={{ width: '18px', height: '18px', color: 'var(--color-gray-500)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={activeSearch}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

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
                  {activeSortKey === col.key && (
                    <span className={styles.sortArrow}>
                      {activeSortDir === 'asc' ? '^' : 'v'}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th>Thao tac</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.emptyState}>
                  <svg
                    style={{
                      width: '40px',
                      height: '40px',
                      color: 'var(--color-gray-500)',
                      marginBottom: '8px',
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
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

      {totalRows > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Hien thi {showFrom}-{showTo} / {totalRows}
          </span>
          <div className={styles.paginationBtns}>
            <button
              disabled={activePage === 0}
              onClick={goToPreviousPage}
              className={styles.pageBtn}
            >
              {'<- Truoc'}
            </button>
            <span className={styles.pageIndicator}>
              {activePage + 1} / {totalPages}
            </span>
            <button
              disabled={activePage >= totalPages - 1}
              onClick={goToNextPage}
              className={styles.pageBtn}
            >
              {'Sau ->'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
