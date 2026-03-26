import { Store } from '../core/store.js';
import { Engine } from '../core/engine.js';
import { ChartFactory } from '../core/chartFactory.js';

export const UIManager = {
    bindEvents() {
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('hero-upload-zone').addEventListener('click', () => document.getElementById('file-input').click());
        document.getElementById('floating-upload-btn').addEventListener('click', () => document.getElementById('file-input').click());
        
        const zone = document.getElementById('hero-upload-zone');
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault(); zone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) this.processFile(e.dataTransfer.files[0]);
        });

        document.getElementById('add-derived-btn').addEventListener('click', () => this.handleAddDerived());
        document.getElementById('generate-btn').addEventListener('click', () => this.handlePivotUpdate());
        
        document.getElementById('chart-type-select').addEventListener('change', (e) => {
            Store.config.chartType = e.target.value;
            this.refreshView();
        });

        document.getElementById('table-body').addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                const uid = parseInt(e.target.getAttribute('data-uid'), 10);
                const row = Store.pivotData.find(r => r._uid === uid);
                if (row) { row._selected = e.target.checked; this.refreshView(); }
            }
        });
        document.getElementById('table-head').addEventListener('change', (e) => {
            if (e.target.id === 'select-all-checkbox') {
                Store.pivotData.forEach(r => r._selected = e.target.checked);
                this.refreshView();
            }
        });
    },

    handleFileUpload(e) {
        if (e.target.files.length > 0) {
            this.processFile(e.target.files[0]);
            e.target.value = ''; 
        }
    },

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            // XLSX 也是通过 CDN 全局引入的
            const workbook = XLSX.read(data, {type: 'array'});
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
            if (jsonData.length === 0) return alert("表格为空！");

            Store.rawData = jsonData.map(row => {
                let newRow = {};
                for (let key in row) newRow[key.replace(/[\r\n]+/g, '')] = row[key];
                return newRow;
            });

            document.getElementById('hero-upload-zone').classList.add('hidden');
            document.getElementById('floating-upload-btn').classList.remove('hidden');
            document.getElementById('results-area').classList.remove('hidden');
            document.getElementById('results-area').classList.add('flex');

            Engine.analyzeStructure(Store.rawData);
            this.renderConfigPanels();
        };
        reader.readAsArrayBuffer(file);
    },

    renderConfigPanels() {
        const calcHtml = `<option value="">[选择数值变量]</option>` + 
            Store.numericCols.map(col => `<option value="${col.replace(/"/g, '&quot;')}">${col}</option>`).join('');
        document.getElementById('calc-col-a').innerHTML = calcHtml;
        document.getElementById('calc-col-b').innerHTML = calcHtml;

        const xSelect = document.getElementById('x-axis-select');
        xSelect.innerHTML = '';
        (Store.textCols.length ? Store.textCols : Object.keys(Store.rawData[0])).forEach(col => {
            const option = document.createElement('option');
            option.value = col; option.textContent = col;
            if (col.match(/(编号|名称|地块)/)) option.selected = true;
            xSelect.appendChild(option);
        });

        this.renderYAxisCheckboxes();
        this.handlePivotUpdate(); 
    },

    renderYAxisCheckboxes() {
        const container = document.getElementById('y-axis-checkboxes');
        container.innerHTML = '';
        Store.numericCols.forEach(col => {
            const label = document.createElement('label');
            label.className = 'inline-flex items-center cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1 text-xs rounded text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap';
            const isChecked = col.match(/(产值|结算|金额|价|面积)/) ? 'checked' : '';
            label.innerHTML = `<input type="checkbox" value="${col.replace(/"/g, '&quot;')}" class="form-checkbox h-3.5 w-3.5 text-blue-600 border-gray-300 rounded" ${isChecked}><span class="ml-1.5">${col}</span>`;
            container.appendChild(label);
        });
        if(!container.querySelector('input:checked') && Store.numericCols.length > 0) {
            container.querySelector('input').checked = true;
        }
    },

    handleAddDerived() {
        const colA = document.getElementById('calc-col-a').value;
        const op = document.getElementById('calc-operator').value;
        const colB = document.getElementById('calc-col-b').value;
        const newName = document.getElementById('calc-new-name').value.trim();

        if (!colA || !colB || !newName) return alert("请完整填写公式配置！");
        if (Store.numericCols.includes(newName)) return alert("指标名称已存在！");

        Engine.addDerivedColumn(colA, op, colB, newName);
        this.renderConfigPanels();
        
        const newCb = document.getElementById('y-axis-checkboxes').querySelector(`input[value="${newName.replace(/"/g, '&quot;')}"]`);
        if(newCb) newCb.checked = true;
        
        document.getElementById('calc-new-name').value = '';
        this.handlePivotUpdate();
    },

    handlePivotUpdate() {
        Store.config.selectedX = document.getElementById('x-axis-select').value;
        Store.config.selectedYs = Array.from(document.getElementById('y-axis-checkboxes').querySelectorAll('input:checked')).map(cb => cb.value);
        
        if (!Store.config.selectedX || Store.config.selectedYs.length === 0) return alert("至少选择一个维度和一个指标。");

        Engine.computePivot();
        // 初始化图表并注入回调函数
        ChartFactory.init('chart-container', () => this.renderTable());
        this.refreshView();
    },

    refreshView() {
        const selectedRows = Engine.sortAndFilterPivot();
        const xAxisData = selectedRows.map(r => r[Store.config.selectedX]);
        
        ChartFactory.render(xAxisData, selectedRows);
        this.renderTable();
    },

    handleSort(colName) {
        if (Store.config.sortCol === colName) Store.config.sortDesc = !Store.config.sortDesc;
        else { Store.config.sortCol = colName; Store.config.sortDesc = true; }
        this.refreshView();
    },

    renderTable() {
        const { selectedX, activeYs, sortCol, sortDesc } = Store.config;
        const visibleCols = [selectedX, ...activeYs];
        const isAllSelected = Store.pivotData.length > 0 && Store.pivotData.every(r => r._selected);

        let headHtml = `<tr><th class="px-6 py-3 w-12 text-center bg-gray-50 sticky top-0 z-10"><input type="checkbox" id="select-all-checkbox" class="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer" ${isAllSelected ? 'checked' : ''}></th>`;
        
        visibleCols.forEach((col, idx) => {
            const alignClass = idx === 0 ? 'text-left' : 'text-right';
            const justifyClass = idx === 0 ? 'justify-start' : 'justify-end';
            let icon = `<svg class="w-4 h-4 ml-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>`;
            if (sortCol === col) {
                icon = sortDesc ? `<svg class="w-4 h-4 ml-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>` 
                                : `<svg class="w-4 h-4 ml-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>`;
            }
            headHtml += `<th data-sort-col="${col.replace(/"/g, '&quot;')}" class="sortable-th px-6 py-3 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 hover:bg-gray-200 cursor-pointer select-none sticky top-0 z-10"><div class="flex items-center ${justifyClass} pointer-events-none">${col} ${icon}</div></th>`;
        });
        document.getElementById('table-head').innerHTML = headHtml + '</tr>';

        document.querySelectorAll('.sortable-th').forEach(th => {
            th.addEventListener('click', (e) => this.handleSort(e.currentTarget.getAttribute('data-sort-col')));
        });

        let bodyHtml = '', selectedCount = 0;
        Store.pivotData.forEach(row => {
            if(row._selected) selectedCount++;
            const trClass = row._selected ? 'hover:bg-blue-50' : 'row-unselected';
            bodyHtml += `<tr class="${trClass} transition-colors border-b border-gray-100 last:border-0"><td class="px-6 py-3 text-center"><input type="checkbox" data-uid="${row._uid}" class="row-checkbox form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer" ${row._selected ? 'checked' : ''}></td>`;
            
            visibleCols.forEach((col, idx) => {
                const alignClass = idx === 0 ? 'text-left font-medium' : 'text-right';
                const val = (row[col] !== undefined && row[col] !== "") ? row[col] : '-';
                const displayVal = (idx !== 0 && !isNaN(val)) ? Number(val).toLocaleString() : val;
                bodyHtml += `<td class="px-6 py-3 whitespace-nowrap ${alignClass} text-gray-700">${displayVal}</td>`;
            });
            bodyHtml += '</tr>';
        });
        
        document.getElementById('table-body').innerHTML = bodyHtml;
        document.getElementById('table-record-count').textContent = `共 ${Store.pivotData.length} 条项目，图表显示其中 ${selectedCount} 条`;
    }
};