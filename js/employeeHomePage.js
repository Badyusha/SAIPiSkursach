$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: '/getClients', // Путь к серверному обработчику запроса
        data: { }, // Передаем имя пользователя на сервер
        success: function(response) {
            addClientsIntoDropdown(response); // Передаем массив объектов напрямую
        },
        error: function(xhr, status, error) {
            console.error('Ошибка выполнения запроса:', error);
        }
    });
});

function addClientsIntoDropdown(response) {

}