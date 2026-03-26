<template>
    <div class="max-w-7xl mx-auto space-y-6 relative">
        <AppHeader />

        <UploadZone />

        <div v-if="store.hasData" class="flex flex-col space-y-6 animate-fade-in">
            <ChartPanel />
            <ConfigPanel />
            <DataTable />
        </div>
    </div>
</template>

<script setup>
    import { store } from './store';
    import AppHeader from './components/AppHeader.vue';
    import UploadZone from './components/UploadZone.vue';
    import ChartPanel from './components/ChartPanel.vue';
    import ConfigPanel from './components/ConfigPanel.vue';
    import DataTable from './components/DataTable.vue';
</script>

<style scoped>
    .animate-fade-in {
        animation: fadeIn 0.4s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
