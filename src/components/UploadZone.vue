<template>
  <div v-if="!store.hasData"
    @click="triggerUpload" 
    @dragover.prevent="isDragging = true" 
    @dragleave.prevent="isDragging = false" 
    @drop.prevent="handleDrop"
    :class="[
      'border-2 border-dashed rounded-lg p-16 text-center transition-colors cursor-pointer mt-12 shadow-sm', 
      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
    ]"
  >
    <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    <p class="mt-4 text-base text-gray-600 font-medium">点击或将 Excel 文件拖拽至此处</p>
    <p class="mt-2 text-sm text-gray-400">本地计算引擎处理，数据绝对安全</p>
  </div>

  <button v-else 
    @click="triggerUpload" 
    class="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 z-50"
    title="重新上传数据"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
    </svg>
  </button>

  <input type="file" ref="fileInput" @change="handleUpload" accept=".xlsx, .xls, .csv" class="hidden">
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { store } from '../store';

const fileInput = ref(null);
const isDragging = ref(false);

const processFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
    
    if (!jsonData || jsonData.length === 0) {
        alert("文件解析为空。");
        return;
    }

    // 清洗表头并载入源数据
    store.rawData = jsonData.map(row => {
      let newRow = {};
      for (let key in row) {
          newRow[key.replace(/[\r\n]+/g, '')] = row[key];
      }
      return newRow;
    });

    // 区分数值列与文本列
    store.numericCols = [];
    store.textCols = [];
    const columns = Object.keys(store.rawData[0] || {});
    
    columns.forEach(col => {
      let isNumeric = true, hasVal = false;
      for(let i = 0; i < Math.min(store.rawData.length, 10); i++) {
        const val = store.rawData[i][col];
        if (val !== undefined && val !== "") {
          hasVal = true;
          if (isNaN(Number(val))) { 
              isNumeric = false; 
              break; 
          }
        }
      }
      if (isNumeric && hasVal) store.numericCols.push(col);
      else store.textCols.push(col);
    });

    // 智能预选机制
    store.config.selectedX = store.textCols.find(c => c.match(/(编号|名称|地块|企业|房企)/)) || store.textCols[0] || columns[0];
    store.config.selectedYs = store.numericCols.filter(c => c.match(/(产值|结算|金额|价|面积)/));
    if (store.config.selectedYs.length === 0 && store.numericCols.length > 0) {
        store.config.selectedYs = [store.numericCols[0]];
    }
    store.config.activeYs = [...store.config.selectedYs];
    
    // 触发全局渲染
    store.hasData = true;
  };
  reader.readAsArrayBuffer(file);
};

const handleDrop = (e) => { 
    isDragging.value = false; 
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); 
};
const triggerUpload = () => fileInput.value.click();
const handleUpload = (e) => { 
    if (e.target.files[0]) processFile(e.target.files[0]); 
};
</script> 
