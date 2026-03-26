# 协同数据看板 (Light Data Board)

> More collaboration, better focus.

一款纯前端、极简的数据透视与可视化看板工具。专为需要快速进行数据洞察的专业人士（如建筑师、工程师、项目管理者）设计。

旨在用轻量化的信息化技术替代繁琐的 Excel 操作，让团队成员脱离软件操作的泥沼，将精力重新聚焦在业务与设计本身。

## ✨ 核心特性

- **🔒 数据绝对安全**：所有数据解析、透视和图表渲染均在本地浏览器内存中完成，数据绝不上传云端。

- **📊 自动化透视与多图表**：自动识别表头完成 Group By 与 Sum 操作。支持堆积柱状图、簇状柱型图与折线图的无缝切换。

- **⚡️ 衍生指标计算**：内置特征计算引擎，支持对基础数据进行四则运算（如：成交价 ÷ 建筑面积 = 楼面价），即时生成新指标。

- **🔗 视图双向联动**：图表图例（Legend）与底层数据表单深度联动，支持表头点击排序，数据行状态完全同步。

- **🧩 模块化架构**：基于 Vite 构建，核心逻辑与视图层严格解耦，易于二次开发与垂直行业定制。

## 🛠 使用方法

### 👨‍💼 面向普通用户 (开箱即用)

1. 在右侧 **Releases** 页面下载最新版本的 `.zip` 压缩包。

2. 解压后，双击打开 `index.html` 即可在浏览器中使用。

3. 拖入 `.xlsx`, `.xls` 或 `.csv` 文件开始分析。

### 👨‍💻 面向开发者 (二次开发)

本项目基于 Vite 构建，采用原生 JS 模块化架构搭建底层逻辑。

```
# 1. 克隆项目
git clone [https://github.com/nvbb/light-data-board.git](https://github.com/您的用户名/light-data-board.git)

# 2. 进入目录并安装依赖
cd light-data-board
npm install

# 3. 启动本地热更新开发服务
npm run dev

# 4. 构建生产环境离线单文件 (输出至 dist 目录)
npm run build
```

## 📦 技术栈

- 构建工具：**Vite** (配合 vite-plugin-singlefile 实现单文件离线打包)

- 数据渲染：**Apache ECharts**

- 表格解析：**SheetJS (js-xlsx)**

- 样式排版：**Tailwind CSS**

## 📄 开源协议

本项目采用 [MIT License](https://www.google.com/search?q=LICENSE "null") 开源协议。
