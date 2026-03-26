// 透视算法引擎
export function computePivot(rawData, config, rowSelection) {
    if (!rawData || !rawData.length || !config.selectedX || !config.selectedYs || config.selectedYs.length === 0) {
        return [];
    }

    const pivotMap = {};
    const { selectedX, selectedYs } = config;

    rawData.forEach(row => {
        const xVal = row[selectedX] || '未分类';
        if (!pivotMap[xVal]) {
            pivotMap[xVal] = {};
            selectedYs.forEach(y => pivotMap[xVal][y] = 0);
        }
        selectedYs.forEach(y => {
            const val = Number(row[y]);
            if (!isNaN(val)) {
                pivotMap[xVal][y] += val;
            }
        });
    });

    let uidCounter = 0;
    return Object.keys(pivotMap).map(xVal => {
        const uid = uidCounter++;
        // 确保新生成的行在 rowSelection 中有默认的选中状态
        if (rowSelection[uid] === undefined) {
            rowSelection[uid] = true;
        }

        const rowData = { _uid: uid, [selectedX]: xVal };
        selectedYs.forEach(y => {
            rowData[y] = Math.round(pivotMap[xVal][y] * 100) / 100;
        });
        return rowData;
    });
}

// 排序与过滤引擎
export function sortAndFilter(pivotData, config, rowSelection) {
    let data = pivotData.map(row => ({
        ...row,
        _selected: !!rowSelection[row._uid]
    }));

    const { sortCol, sortDesc } = config;

    data.sort((a, b) => {
        // 🛑 修复点：删除或注释掉下面这两行！不要让数据在交互时乱跑
        // if (a._selected && !b._selected) return -1;
        // if (!a._selected && b._selected) return 1;

        if (sortCol) {
            let valA = a[sortCol];
            let valB = b[sortCol];
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDesc ? valB - valA : valA - valB;
            } else {
                const strA = String(valA || '');
                const strB = String(valB || '');
                return sortDesc ? strB.localeCompare(strA) : strA.localeCompare(strB);
            }
        }
        return 0;
    });

    return data;
}
