import { reactive, computed } from 'vue';
import { computePivot, sortAndFilter } from '../core/engine';

// 基础状态字典
export const store = reactive({
    hasData: false,
    rawData: [],
    numericCols: [],
    textCols: [],

    // 用户操作配置
    config: {
        selectedX: "",
        selectedYs: [],
        activeYs: [], // 记录图表中实际激活的Y轴（图例联动）
        sortCol: null,
        sortDesc: true,
        chartType: "stackedBar",
        isSmooth: false,
        colorTheme: "morandi"
    },

    // 记录表格中每一行数据的勾选状态，格式：{ _uid: boolean }
    rowSelection: {}
});

// 计算属性：基础透视数据 (参数发生改变时自动重算)
export const pivotData = computed(() => {
    return computePivot(store.rawData, store.config, store.rowSelection);
});

// 计算属性：最终供表格和图表展示的数据 (包含排序与过滤操作)
export const displayData = computed(() => {
    return sortAndFilter(pivotData.value, store.config, store.rowSelection);
});