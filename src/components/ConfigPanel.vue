<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 1. 数据衍生计算区 -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <h2 class="text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wider">数据衍生 (自定义计算)</h2>
            <div class="space-y-3 flex-grow">
                <select v-model="calcState.colA" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm bg-gray-50 text-gray-700">
                    <option value="">[选择变量 A]</option>
                    <option v-for="c in store.numericCols" :key="'A-'+c" :value="c">{{c}}</option>
                </select>
                <select v-model="calcState.op" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm font-bold bg-gray-100 text-blue-600">
                    <option value="/">÷ (除以)</option>
                    <option value="*">× (乘以)</option>
                    <option value="+">+ (加上)</option>
                    <option value="-">- (减去)</option>
                </select>
                <select v-model="calcState.colB" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm bg-gray-50 text-gray-700">
                    <option value="">[选择变量 B]</option>
                    <option v-for="c in store.numericCols" :key="'B-'+c" :value="c">{{c}}</option>
                </select>
                <div class="pt-2 border-t border-gray-100 mt-2">
                    <input v-model="calcState.newName" type="text" placeholder="输入新指标名 (如: A+B)" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm bg-white text-gray-800">
                </div>
            </div>
            <button @click="executeDerivedCalculation" class="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-sm font-medium py-2 rounded transition-colors">
                + 生成新指标
            </button>
        </div>

        <!-- 2. 图表策略与映射维度区 -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">

            <!-- 策略配置 -->
            <div class="flex items-center space-x-4 mb-5 pb-4 border-b border-gray-100">
                <div class="flex items-center">
                    <span class="text-xs text-gray-500 mr-2">图表样式：</span>
                    <select v-model="store.config.chartType" class="block w-32 pl-2 pr-6 py-1 text-sm border-gray-300 rounded-md border bg-gray-50 text-blue-700 font-medium">
                        <option value="stackedBar">堆积柱状图</option>
                        <option value="groupedBar">簇状柱型图</option>
                        <option value="line">折线统计图</option>
                    </select>
                </div>
                <label v-if="store.config.chartType === 'line'" class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="store.config.isSmooth" class="form-checkbox h-4 w-4 text-blue-600 rounded">
                    <span class="ml-1.5 text-sm text-gray-600">平滑曲线</span>
                </label>
                <div class="flex items-center">
                    <span class="text-xs text-gray-500 mr-2">配色方案：</span>
                    <select v-model="store.config.colorTheme" class="block w-28 pl-2 pr-6 py-1 text-sm border-gray-300 rounded-md border bg-gray-50 text-gray-700">
                        <option value="morandi">莫兰迪</option>
                        <option value="business">商务蓝调</option>
                        <option value="monochrome">极简黑灰</option>
                    </select>
                </div>
                
            </div>

            <!-- 维度配置 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-2">分类维度 (X轴 / 单选)</label>
                    <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                        <label v-for="col in store.textCols" :key="'x-'+col" class="inline-flex items-center cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1 text-xs rounded text-gray-700 hover:bg-gray-100 transition-colors">
                            <input type="radio" v-model="store.config.selectedX" :value="col" class="form-radio h-3.5 w-3.5 text-blue-600 border-gray-300 focus:ring-blue-500">
                            <span class="ml-1.5">{{ col }}</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-600 mb-2">计算指标 (Y轴 / 多选)</label>
                    <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                        <label v-for="col in store.numericCols" :key="'y-'+col" class="inline-flex items-center cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1 text-xs rounded text-gray-700 hover:bg-gray-100 transition-colors">
                            <input type="checkbox" v-model="store.config.selectedYs" :value="col" class="form-checkbox h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <span class="ml-1.5">{{ col }}</span>
                        </label>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>

import { reactive, watch } from 'vue';
import { store } from '../store';

const calcState = reactive({
    colA: "",
    op: "/",
    colB: "",
    newName: ""
});

const executeDerivedCalculation = () => {
    const { colA, op, colB, newName } = calcState;
    const cleanName = newName.trim();

    if (!colA || !colB || !cleanName) {
        return alert("请完整填写公式配置！");
    }
    if (store.numericCols.includes(cleanName)) {
        return alert("指标名称已存在！");
    }

    // 遍历原始数据实施特征运算
    store.rawData.forEach(row => {
        let a = Number(row[colA]) || 0;
        let b = Number(row[colB]) || 0;
        let res = 0;

        if (op === '/' && b === 0) {
            res = 0;
        } else {
            switch (op) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/': res = a / b; break;
            }
        }
        row[cleanName] = Math.round(res * 100) / 100;
    });

    // 更新状态字典
    store.numericCols.push(cleanName);
    store.config.selectedYs.push(cleanName);
    store.config.activeYs.push(cleanName);

    // 重置输入框
    calcState.newName = "";

    // 【新增代码】：监听 selectedYs 的变化，同步更新 activeYs，打通表单渲染
    watch(() => store.config.selectedYs, (newVals) => {
        store.config.activeYs = [...newVals];
    }, { deep: true });
};</script> 
