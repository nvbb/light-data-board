// src/core/store.js
export const Store = {
    rawData: [],
    numericCols: [],
    textCols: [],
    pivotData: [], 
    
    config: {
        selectedX: "",
        selectedYs: [],
        activeYs: [], 
        sortCol: null,
        sortDesc: true,
        chartType: "stackedBar",
        isSmooth: false,        // 新增：折线图默认不平滑
        colorTheme: "morandi"   // 新增：TODO计划的基础，默认莫兰迪
    }
};