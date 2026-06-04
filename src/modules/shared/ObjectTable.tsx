/**
 * ObjectTable — 标准化对象表格
 *
 * 封装 Ant Design Table，统一列表页的 loading / empty / row-click 模式。
 */
import React from 'react'
import { Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { EmptyState } from './SharedUI'
import loaderStyles from './PageLoader.module.css'

interface ObjectTableProps<T extends { id: string }> {
  columns: ColumnsType<T>
  dataSource: T[]
  loading?: boolean
  emptyText?: string
  onRowClick?: (record: T) => void
  pagination?: TablePaginationConfig | false
  size?: 'small' | 'middle' | 'large'
}

export function ObjectTable<T extends { id: string }>({
  columns,
  dataSource,
  loading = false,
  emptyText = '暂无数据',
  onRowClick,
  pagination = false,
  size = 'small',
}: ObjectTableProps<T>) {
  return (
    <Table<T>
      size={size}
      loading={loading ? {
        indicator: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className={loaderStyles.pulse}>
              <div className={loaderStyles.pulseBar} />
              <div className={loaderStyles.pulseBar} />
              <div className={loaderStyles.pulseBar} />
            </div>
            <span className={loaderStyles.text}>读取数据中...</span>
          </div>
        ),
        spinning: true,
      } : false}
      dataSource={dataSource.map(item => ({ ...item, key: item.id }))}
      columns={columns}
      pagination={pagination}
      locale={{ emptyText: <EmptyState description={emptyText} /> }}
      onRow={onRowClick ? (record) => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' },
      }) : undefined}
    />
  )
}

export default ObjectTable
