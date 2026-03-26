import { UIManager } from './components/uiManager.js';

// 更稳妥的执行方式，防止因为 Vite 的模块加载机制导致 DOM 未就绪
const initApp = () => {
    try {
        UIManager.bindEvents();
        console.log("Light Data Board 核心模块已挂载启动");
    } catch (error) {
        console.error("挂载失败，请检查 index.html 中是否缺少相关 DOM 节点：", error);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // 如果由于 HMR (热更新) 导致模块重新加载，直接执行
    initApp();
}