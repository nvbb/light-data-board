import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

const app = createApp(App);

// 如果需要配置全局错误处理等可以在此操作
app.config.errorHandler = (err) => {
    console.error('Vue Runtime Error:', err);
};

app.mount('#app');
