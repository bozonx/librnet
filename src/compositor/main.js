(async () => {
  const app = document.getElementById('app');
  app.innerHTML = '<div id="root-compositor"></div>';

  const rootCompositor = document.getElementById('root-compositor');
  rootCompositor.innerHTML = 'Hello World';

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
