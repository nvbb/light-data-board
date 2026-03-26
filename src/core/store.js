export const Store = {
    rawData: [],
    numericCols: [],
    textCols: [],
    pivotData: [], // 透视后的数组
    
    // 当前用户配置
    config: {
        selectedX: "",
        selectedYs: [],
        activeYs: [], // 图表中实际显示的Y轴(联动用)
        sortCol: null,
        sortDesc: true,
        chartType: "stackedBar" // stackedBar | groupedBar | line
    }
};