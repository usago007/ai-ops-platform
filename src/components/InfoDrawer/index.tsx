import React from 'react'
import { Drawer } from 'antd'

interface InfoDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number | string
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 600,
}) => {
  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={width}
      destroyOnClose
    >
      {children}
    </Drawer>
  )
}
