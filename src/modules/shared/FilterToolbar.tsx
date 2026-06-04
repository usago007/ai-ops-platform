/**
 * FilterToolbar — 标准化过滤栏
 *
 * 搜索框 + 可选过滤下拉 + 活跃过滤标签 + 清除按钮。
 */
import React, { useState } from 'react'
import { Input, Select, Space, Tag, Button } from 'antd'
import { SearchOutlined, ClearOutlined } from '@/iconMap'

export interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface FilterToolbarProps {
  searchPlaceholder?: string
  onSearch: (query: string) => void
  filters?: FilterOption[]
  activeFilters?: Record<string, string | undefined>
  onFilterChange?: (key: string, value: string | undefined) => void
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchPlaceholder = '搜索...',
  onSearch,
  filters,
  activeFilters = {},
  onFilterChange,
}) => {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch(value)
  }

  const hasActiveFilters = Object.values(activeFilters).some(Boolean) || searchValue

  const clearAll = () => {
    setSearchValue('')
    onSearch('')
    if (onFilterChange && filters) {
      filters.forEach(f => onFilterChange(f.key, undefined))
    }
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%', marginBottom: 12 }}>
      <Space size={8} wrap>
        <Input
          allowClear
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={e => handleSearch(e.target.value)}
          style={{ width: 240 }}
          size="small"
        />
        {filters?.map(f => (
          <Select
            key={f.key}
            allowClear
            placeholder={f.label}
            value={activeFilters[f.key]}
            onChange={val => onFilterChange?.(f.key, val)}
            options={f.options}
            size="small"
            style={{ minWidth: 120 }}
          />
        ))}
        {hasActiveFilters && (
          <Button icon={<ClearOutlined />} size="small" onClick={clearAll}>清除筛选</Button>
        )}
      </Space>
      {hasActiveFilters && (
        <Space size={4} wrap>
          {searchValue && (
            <Tag closable onClose={() => handleSearch('')} color="blue">搜索: {searchValue}</Tag>
          )}
          {filters?.map(f => {
            const val = activeFilters[f.key]
            if (!val) return null
            const opt = f.options.find(o => o.value === val)
            return (
              <Tag key={f.key} closable onClose={() => onFilterChange?.(f.key, undefined)}>
                {f.label}: {opt?.label || val}
              </Tag>
            )
          })}
        </Space>
      )}
    </Space>
  )
}

export default FilterToolbar
