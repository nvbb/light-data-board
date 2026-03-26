import { Store } from './store.js';

export const ChartFactory = {
    echartsInstance: null,
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'],

    // 接收一个回调函数，当图例发生改变时通知外层更新表格
    init(containerId, onLegendChange) {
        if(this.echartsInstance) this.echartsInstance.dispose();
        
        // 这里的 echarts 是通过 HTML CDN 引入的全局变量
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
                case 'line': return { ...baseObj, type: 'line', smooth: true, symbolSize: 6, lineStyle: { width: 3 } };
                default: return { ...baseObj, type: 'bar' };
            }
        });
    },

    render(xAxisData, selectedRows) {
        const { chartType, selectedYs } = Store.config;
        const seriesData = this.generateSeries(chartType, selectedYs, selectedRows);

        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: chartType === 'line' ? 'line' : 'shadow' } },
            legend: { data: selectedYs, top: '0%', type: 'scroll' },
            grid: { left: '1%', right: '3%', bottom: '3%', top: '12%', containLabel: true },
            xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 0, rotate: 15 }, boundaryGap: chartType !== 'line' },
            yAxis: { type: 'value' },
            series: seriesData,
            color: this.colors
        };

        this.echartsInstance.setOption(option, true);
    }
};