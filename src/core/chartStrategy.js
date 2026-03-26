// 全局色彩主题字典
export const THEMES = {
    morandi: ['#c1cbd7', '#b5c4b1', '#8696a7', '#9ca8b8', '#e0e5df', '#bfb5d7', '#afb0b2', '#939391'],
    business: ['#2c3e50', '#34495e', '#2980b9', '#3498db', '#7f8c8d', '#95a5a6'],
    monochrome: ['#222222', '#555555', '#888888', '#aaaaaa', '#cccccc', '#eeeeee']
};

/**
 * 策略装配器：根据用户配置与数据，组装 ECharts 所需的 Option 对象。
 * 未来扩展图表类型，仅需在此处新增分支即可。
 */
export function buildChartOption(config, displayData) {
    // 图表仅渲染被选中的数据行
    const validData = displayData.filter(r => r._selected);
    const { chartType, selectedX, selectedYs, colorTheme, isSmooth } = config;
    
    // 如果无有效数据，返回空配置
    if (validData.length === 0 || !selectedX || selectedYs.length === 0) {
        return {}; 
    }

    const colors = THEMES[colorTheme] || THEMES.morandi;
    const xAxisData = validData.map(r => r[selectedX]);

    // 装配 Series 数据
    const series = selectedYs.map(yKey => {
        let base = { 
            name: yKey, 
            data: validData.map(r => r[yKey]), 
            emphasis: { focus: 'series' } 
        };
        
        switch (chartType) {
            case 'stackedBar':
                return { ...base, type: 'bar', stack: 'total' };
            case 'groupedBar':
                return { ...base, type: 'bar' };
            case 'line':
                return { ...base, type: 'line', smooth: isSmooth, symbolSize: 6, lineStyle: { width: 3 } };
            default:
                return { ...base, type: 'bar' };
        }
    });

    // 组装最终 Option
    return {
        tooltip: { 
            trigger: 'axis', 
            axisPointer: { type: chartType === 'line' ? 'line' : 'shadow' } 
        },
        legend: { 
            data: selectedYs, 
            top: '0%', 
            type: 'scroll' 
        },
        grid: { 
            left: '1%', right: '3%', bottom: '3%', top: '12%', 
            containLabel: true 
        },
        xAxis: { 
            type: 'category', 
            data: xAxisData, 
            axisLabel: { interval: 0, rotate: 15 }, 
            boundaryGap: chartType !== 'line' 
        },
        yAxis: { 
            type: 'value' 
        },
        series: series,
        color: colors
    };
}