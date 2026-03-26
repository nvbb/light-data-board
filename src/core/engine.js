import { Store } from './store.js';

export const Engine = {
    analyzeStructure(data) {
        Store.numericCols = [];
        Store.textCols = [];
        const columns = Object.keys(data[0]);
        
        columns.forEach(col => {
            let isNumeric = true, hasData = false;
            for(let i = 0; i < Math.min(data.length, 10); i++) {
                const val = data[i][col];
                if (val !== undefined && val !== "") {
                    hasData = true;
                    if (isNaN(Number(val))) { isNumeric = false; break; }
                }
            }
            if (isNumeric && hasData) Store.numericCols.push(col);
            else Store.textCols.push(col);
        });
    },

    addDerivedColumn(colA, operator, colB, newName) {
        Store.rawData.forEach(row => {
            let valA = Number(row[colA]) || 0;
            let valB = Number(row[colB]) || 0;
            let result = 0;

            if (operator === '/' && valB === 0) result = 0;
            else {
                switch (operator) {
                    case '+': result = valA + valB; break;
                    case '-': result = valA - valB; break;
                    case '*': result = valA * valB; break;
                    case '/': result = valA / valB; break;
                }
            }
            row[newName] = Math.round(result * 100) / 100;
        });
        Store.numericCols.push(newName);
    },

    computePivot() {
        const { selectedX, selectedYs } = Store.config;
        const pivotMap = {};

        Store.rawData.forEach(row => {
            const xVal = row[selectedX] || '未分类';
            if (!pivotMap[xVal]) {
                pivotMap[xVal] = {};
                selectedYs.forEach(y => pivotMap[xVal][y] = 0);
            }
            selectedYs.forEach(y => {
                const val = Number(row[y]); 
                if (!isNaN(val)) pivotMap[xVal][y] += val;
            });
        });

        let uidCounter = 0;
        Store.pivotData = Object.keys(pivotMap).map(xVal => {
            const rowData = { _uid: uidCounter++, _selected: true, [selectedX]: xVal };
            selectedYs.forEach(y => {
                rowData[y] = Math.round(pivotMap[xVal][y] * 100) / 100;
            });
            return rowData;
        });
        
        Store.config.sortCol = null;
        Store.config.sortDesc = true;
        Store.config.activeYs = [...selectedYs];
    },

    sortAndFilterPivot() {
        const { sortCol, sortDesc } = Store.config;
        Store.pivotData.sort((a, b) => {
            if (a._selected && !b._selected) return -1;
            if (!a._selected && b._selected) return 1;

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
        return Store.pivotData.filter(r => r._selected);
    }
};