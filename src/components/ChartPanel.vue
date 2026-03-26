<template>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">可视化视图</h2>
        </div>
        <!-- ECharts 挂载容器 -->
        <div ref="chartRef" class="w-full h-[450px]"></div>
    </div>
</template>

<script setup>import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { store, displayData } from '../store';
import { buildChartOption } from '../core/chartStrategy';

const chartRef = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (!chartInstance) return;
  // 通过工厂获取完整的 ECharts Option
  const option = buildChartOption(store.config, displayData.value);
  if (Object.keys(option).length > 0) {
      chartInstance.setOption(option, true);
  } else {
      chartInstance.clear();
  }
};

const handleResize = () => {
    if (chartInstance) chartInstance.resize();
};

onMounted(async () => {
  // 等待 DOM 分配实际高度后初始化
  await nextTick();
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);

    // 图例点击联动表格显隐
    chartInstance.on('legendselectchanged', (params) => {
      store.config.activeYs = store.config.selectedYs.filter(y => params.selected[y] !== false);
    });

    window.addEventListener('resize', handleResize);
    renderChart();
  }
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (chartInstance) {
        chartInstance.dispose();
    }
});

// 核心：深度监听配置项和展示数据的变化，自动触发重绘
watch([() => store.config, displayData], () => {
  nextTick(renderChart);
}, { deep: true });</script> 
