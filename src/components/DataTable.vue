<template>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold mb-4 text-gray-800 flex justify-between">
            底层数据表单
            <span class="text-xs font-normal text-gray-500">共 {{ displayData.length }} 条，选中 {{ selectedCount }} 条</span>
        </h2>

        <div class="overflow-x-auto overflow-y-hidden relative" @mouseleave="stopDragging">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 w-12 text-center sticky top-0 bg-gray-50 z-20 border-b border-gray-200">
                            <input type="checkbox" :checked="isAllSelected" @change="toggleAll" class="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer">
                        </th>
                        <th v-for="(col, idx) in visibleColumns" :key="col" @click="handleSort(col)"
                            :class="[
                  'px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 sticky top-0 bg-gray-50 z-20 border-b border-gray-200 select-none',
                  idx === 0 ? 'text-left' : 'text-right'
                ]">
                            <div :class="['flex items-center', idx === 0 ? 'justify-start' : 'justify-end']">
                                {{ col }}
                                <span class="ml-1 w-4 h-4 inline-block text-center">
                                    <span v-if="store.config.sortCol === col" class="text-blue-600">{{ store.config.sortDesc ? '↓' : '↑' }}</span>
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 bg-white" @dragstart.prevent>
                    <tr v-for="row in displayData" :key="row._uid"
                        @mousedown="startDrag(row, $event)"
                        @mouseenter="onDragEnter(row)"
                        :class="[
                row._selected ? 'bg-blue-50/80 hover:bg-blue-100 text-gray-900' : 'bg-white hover:bg-gray-50 text-gray-400',
                'transition-colors select-none cursor-pointer'
              ]">

                        <td class="px-6 py-3 text-center border-b border-gray-50/50">
                            <input type="checkbox" v-model="store.rowSelection[row._uid]" class="form-checkbox h-4 w-4 text-blue-600 rounded pointer-events-none">
                        </td>

                        <td v-for="(col, idx) in visibleColumns" :key="col" :class="['px-6 py-3 whitespace-nowrap border-b border-gray-50/50', idx === 0 ? 'text-left font-medium' : 'text-right']">
                            {{ formatCellValue(row[col], idx) }}
                        </td>
                    </tr>
                </tbody>

                <tfoot class="bg-gray-50 font-semibold sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <tr>
                        <td class="px-6 py-3 text-center border-t border-gray-200 text-gray-400">-</td>
                        <td v-for="(col, idx) in visibleColumns" :key="'total-'+col"
                            :class="['px-6 py-3 whitespace-nowrap border-t border-gray-200 text-blue-800', idx === 0 ? 'text-left' : 'text-right']">
                            {{ idx === 0 ? '合计 (仅计算选中项)' : formatCellValue(columnTotals[col], idx) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, onMounted, onUnmounted } from 'vue';
    import { store, displayData } from '../store';

    const visibleColumns = computed(() => {
        if (!store.config.selectedX) return [];
        return [store.config.selectedX, ...store.config.selectedYs];
    });

    const selectedCount = computed(() => displayData.value.filter(r => r._selected).length);

    const isAllSelected = computed(() => {
        return displayData.value.length > 0 && displayData.value.every(r => r._selected);
    });

    const isDragging = ref(false);
    const dragTargetState = ref(true);

    const startDrag = (row, event) => {
        if (event.button === 0) {
            isDragging.value = true;
            dragTargetState.value = !store.rowSelection[row._uid];
            store.rowSelection[row._uid] = dragTargetState.value;
        }
    };

    const onDragEnter = (row) => {
        if (isDragging.value) {
            store.rowSelection[row._uid] = dragTargetState.value;
        }
    };

    const stopDragging = () => {
        isDragging.value = false;
    };

    onMounted(() => {
        window.addEventListener('mouseup', stopDragging);
    });

    onUnmounted(() => {
        window.removeEventListener('mouseup', stopDragging);
    });

    const toggleAll = (e) => {
        const isChecked = e.target.checked;
        displayData.value.forEach(row => {
            store.rowSelection[row._uid] = isChecked;
        });
    };

    const handleSort = (col) => {
        if (store.config.sortCol === col) {
            store.config.sortDesc = !store.config.sortDesc;
        } else {
            store.config.sortCol = col;
            store.config.sortDesc = true;
        }
    };

    const columnTotals = computed(() => {
        const totals = {};
        const activeRows = displayData.value.filter(r => r._selected);

        visibleColumns.value.forEach((col, idx) => {
            if (idx === 0) {
                totals[col] = '合计';
            } else {
                let sum = 0;
                activeRows.forEach(row => {
                    const val = Number(row[col]);
                    if (!isNaN(val)) sum += val;
                });
                totals[col] = Math.round(sum * 100) / 100;
            }
        });
        return totals;
    });

    const formatCellValue = (val, colIndex) => {
        if (val === undefined || val === "") return "-";
        if (colIndex !== 0 && !isNaN(val)) {
            return Number(val).toLocaleString();
        }
        return val;
    };
</script>
