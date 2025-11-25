import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import 'flag-icons/css/flag-icons.min.css'

const app = createApp(App)

app.use(router)

app.mount('#app')

window.onerror = function (message, source, lineno, colno, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.padding = '20px';
    errorDiv.innerText = 'Global Error: ' + message + ' at ' + source + ':' + lineno;
    document.body.appendChild(errorDiv);
};
