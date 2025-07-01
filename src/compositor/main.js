(async () => {
  const app = document.getElementById('app');
  app.innerHTML = '<div id="root-compositor"></div>';

  const compositorData = {
    apiBaseUrl: 'http://localhost:3000',
    uiBaseUrl: 'http://localhost:3000',
    compositorApiUrl: '/api/v1/compositor',
    appUiUrl: '/ui',
    tiles: {
      top: {
        height: 48,
      },
      bottom: {
        height: 48,
      },
      left: {
        width: 150,
      },
      right: {
        width: 150,
      },
    },
  };

  const rootTiles = [];
  if (compositorData.tiles.top) {
    rootTiles.push(
      `<div id="top-tile" style="height: ${compositorData.tiles.top.height}px;"><iframe id="top-iframe" src="${compositorData.uiBaseUrl}${compositorData.appUiUrl}/top-panel.html"></iframe></div>`
    );
  }
  rootTiles.push('<div id="middle-tile"></div>');
  if (compositorData.tiles.bottom) {
    rootTiles.push(
      `<div id="bottom-tile" style="height: ${compositorData.tiles.bottom.height}px;"><iframe id="bottom-iframe" src="${compositorData.uiBaseUrl}${compositorData.appUiUrl}/bottom-panel.html"></iframe></div>`
    );
  }
  document.getElementById('root-compositor').innerHTML = rootTiles.join('\n');

  const middleTiles = [];
  if (compositorData.tiles.left) {
    middleTiles.push(
      `<div id="left-tile" style="width: ${compositorData.tiles.left.width}px;"><iframe id="left-iframe" src="${compositorData.uiBaseUrl}${compositorData.appUiUrl}/left-panel.html"></iframe></div>`
    );
  }
  middleTiles.push('<div id="main-tile"></div>');
  if (compositorData.tiles.right) {
    middleTiles.push(
      `<div id="right-tile" style="width: ${compositorData.tiles.right.width}px;"><iframe id="right-iframe" src="${compositorData.uiBaseUrl}${compositorData.appUiUrl}/right-panel.html"></iframe></div>`
    );
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
