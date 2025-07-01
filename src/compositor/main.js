(async () => {
  const app = document.getElementById('app');
  app.innerHTML = '<div id="root-compositor"></div>';

  const tiles = {
    top: {},
    bottom: {},
    left: {},
    right: {},
  };

  const rootTiles = [];
  if (tiles.top) {
    rootTiles.push('<div id="top-tile"></div>');
  }
  rootTiles.push('<div id="middle-tile"></div>');
  if (tiles.bottom) {
    rootTiles.push('<div id="bottom-tile"></div>');
  }
  document.getElementById('root-compositor').innerHTML = rootTiles.join('\n');

  const middleTiles = [];
  if (tiles.left) {
    middleTiles.push('<div id="left-tile"></div>');
  }
  middleTiles.push('<div id="main-tile"></div>');
  if (tiles.right) {
    middleTiles.push('<div id="right-tile"></div>');
  }
  document.getElementById('middle-tile').innerHTML = middleTiles.join('\n');

  const mainTile = document.getElementById('main-tile');
  mainTile.innerHTML = 'Hello World';

  ///////////////////////

  // Создаем новое WebSocket-соединение
  const socket = new WebSocket('ws://example.com/socket');

  // Событие при успешном подключении
  socket.onopen = () => {
    console.log('WebSocket соединение установлено');
    // Отправка сообщения серверу
    socket.send('Привет, сервер!');
  };

  // Событие при получении сообщения от сервера
  socket.onmessage = (event) => {
    console.log('Получено сообщение:', event.data);
  };

  // Событие при ошибке
  socket.onerror = (error) => {
    console.error('Ошибка WebSocket:', error);
  };

  // Событие при закрытии соединения
  socket.onclose = () => {
    console.log('WebSocket соединение закрыто');
  };
})();
