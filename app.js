const handState = document.getElementById('handState');
const objectState = document.getElementById('objectState');
const sensorState = document.getElementById('sensorState');
const connectionState = document.getElementById('connectionState');
const message = document.getElementById('message');

const openButton = document.getElementById('openButton');
const closeButton = document.getElementById('closeButton');
const statusButton = document.getElementById('statusButton');

const labels = {
  hand: {
    open: 'РАЗЖАТО',
    closed: 'СЖАТО',
    unknown: 'НЕТ ДАННЫХ'
  },
  object: {
    yes: 'ДА',
    no: 'НЕТ',
    unknown: 'НЕТ ДАННЫХ'
  },
  sensor: {
    pressed: 'НАЖАТ',
    released: 'НЕ НАЖАТ',
    unknown: 'НЕТ ДАННЫХ'
  }
};

function setButtons(disabled) {
  openButton.disabled = disabled;
  closeButton.disabled = disabled;
  statusButton.disabled = disabled;
}

function render(data) {
  handState.textContent = labels.hand[data.hand] || data.hand || 'НЕТ ДАННЫХ';
  objectState.textContent = labels.object[data.object] || data.object || 'НЕТ ДАННЫХ';
  sensorState.textContent = labels.sensor[data.sensor] || data.sensor || 'НЕТ ДАННЫХ';
  connectionState.textContent = data.connected ? `ARDUINO (${data.port || 'порт найден'})` : 'НЕ ПОДКЛЮЧЕНО';
  message.textContent = data.message || '';
}

async function request(url, method = 'GET') {
  setButtons(true);
  message.textContent = 'Выполняется команда...';

  try {
    const response = await fetch(url, { method });
    const data = await response.json();
    render(data);
  } catch (error) {
    render({
      connected: false,
      hand: 'unknown',
      object: 'unknown',
      sensor: 'unknown',
      message: 'Нет связи с сервером'
    });
  } finally {
    setButtons(false);
  }
}

openButton.addEventListener('click', () => request('/api/open', 'POST'));
closeButton.addEventListener('click', () => request('/api/close', 'POST'));
statusButton.addEventListener('click', () => request('/api/status'));

request('/api/status');
