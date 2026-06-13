const handState = document.getElementById('handState');
const objectState = document.getElementById('objectState');
const sensorState = document.getElementById('sensorState');
const connectionState = document.getElementById('connectionState');
const message = document.getElementById('message');

const openButton = document.getElementById('openButton');
const closeButton = document.getElementById('closeButton');
const statusButton = document.getElementById('statusButton');

function translateHand(value) {
    if (value === 'open') return 'разжата';
    if (value === 'closed') return 'сжата';
    return 'неизвестно';
}

function translateObject(value) {
    if (value === 'yes') return 'да';
    if (value === 'no') return 'нет';
    return 'неизвестно';
}

function translateSensor(value) {
    if (value === 'pressed') return 'нажат';
    if (value === 'released') return 'не нажат';
    return 'неизвестно';
}

function updateStatus(data) {
    handState.textContent = translateHand(data.hand);
    objectState.textContent = translateObject(data.object);
    sensorState.textContent = translateSensor(data.sensor);
    connectionState.textContent = data.connected ? `Arduino подключена (${data.port})` : 'нет подключения';
    message.textContent = data.message || 'ok';
}

async function request(url, method = 'GET') {
    message.textContent = 'Выполняется команда...';

    try {
        const response = await fetch(url, { method });
        const data = await response.json();
        updateStatus(data);
    } catch (error) {
        message.textContent = 'Ошибка соединения с Flask-сервером';
    }
}

openButton.addEventListener('click', () => request('/api/open', 'POST'));
closeButton.addEventListener('click', () => request('/api/close', 'POST'));
statusButton.addEventListener('click', () => request('/api/status'));

request('/api/last');
