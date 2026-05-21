# AI 平台演示

AI 赋能产业增效平台的前端 Demo 项目，使用 Mock 数据模拟完整业务流程，无需后端服务即可独立运行。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 8
- **样式**: Tailwind CSS 4 + CSS Modules
- **UI 组件**: Radix UI
- **路由**: React Router DOM 7
- **状态管理**: Zustand
- **图表**: ECharts
- **Mock 服务**: MSW (Mock Service Worker)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 构建单文件版本（所有资源内联到一个 HTML）
npm run build:single

# 代码检查
npm run lint
```

## 业务模块

| 模块 | 说明 |
|------|------|
| 业务提效 | 业务总览、询价转报价、商品结构化 |
| 营销提效 | 营销内容创作、卖点提取 |
| 客服工作台 | 智能客服辅助、对话意图识别 |
| 系统管理 | 模型配置、Agent 编排、成本看板、审计日志 |

## 项目结构

```
src/
├── components/    # 通用组件
├── hooks/         # 自定义 Hooks
├── layouts/       # 布局组件
├── mock/          # MSW Mock 数据与处理器
├── pages/         # 页面组件
├── router/        # 路由配置
├── services/      # 数据服务层
├── styles/        # 全局样式与 Design Tokens
└── utils/         # 工具函数
```

## License

Private
