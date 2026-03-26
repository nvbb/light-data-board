// src/core/chartFactory.js
import { Store } from './store.js';

export const ChartFactory = {
    echartsInstance: null,
    
    // 配置多套配色方案（TODO计划的预埋）
    themes: {
        // 莫兰迪色系 (高级灰、低饱和度)
        morandi: ['#c1cbd7', '#b5c4b1', '#8696a7', '#9ca8b8', '#e0e5df', '#bfb5d7', '#afb0b2', '#939391'],
        // 备选方案1：商务蓝调
        business: ['#2c3e50', '#34495e', '#2980b9', '#3498db', '#7f8c8d', '#95a5a6'],
        // 备选方案2：极简单色黑白灰
        monochrome: ['#222222', '#555555', '#888888', '#aaaaaa', '#cccccc', '#eeeeee']
    },

    init(containerId, onLegendChange) {
        if(this.echartsInstance) this.echartsInstance.dispose();
        this.echartsInstance = echarts.init(document.getElementById(containerId));
        this.echartsInstance.on('legendselectchanged', (params) => {
            Store.config.activeYs = Store.config.selectedYs.filter(y => params.selected[y] !== false);
            if(onLegendChange) onLegendChange();
        });
        window.addEventListener('resize', () => this.echartsInstance.resize());
    },

    generateSeries(type, keys, dataRows) {
        return keys.map(yKey => {
            let baseObj = {
                name: yKey,
                data: dataRows.map(row => row[yKey]),
                emphasis: { focus: 'series' }
            };
            switch(type) {
                case 'stackedBar': return { ...baseObj, type: 'bar', stack: 'total' };
                case 'groupedBar': return { ...baseObj, type: 'bar' }; 
                // 修复Bug：动态读取 isSmooth 配置
                case 'line': return { ...baseObj, type: 'line', smooth: Store.config.isSmooth, symbolSize: 6, lineStyle: { width: 3 } };
                default: return { ...baseObj, type: 'bar' };
            }
        });
    },

    render(xAxisData, selectedRows) {
        const { chartType, selectedYs, colorTheme } = Store.config;
        const seriesData = this.generateSeries(chartType, selectedYs, selectedRows);
        // 读取当前主题配色
        const currentColors = this.themes[colorTheme] || this.themes.morandi;

        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: chartType === 'line' ? 'line' : 'shadow' } },
            legend: { data: selectedYs, top: '0%', type: 'scroll' },
            grid: { left: '1%', right: '3%', bottom: '3%', top: '12%', containLabel: true },
            xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 0, rotate: 15 }, boundaryGap: chartType !== 'line' },
            yAxis: { type: 'value' },
            series: seriesData,
            color: currentColors
        };

        this.echartsInstance.setOption(option, true);
    }
};