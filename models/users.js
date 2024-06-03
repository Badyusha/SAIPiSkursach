fetch('/getUsername')
.then(response => response.text())
.then(username => {
    document.getElementById('username').textContent = username;
    
    document.getElementById("account_number").addEventListener("click", function() {
        document.getElementById("account_number").style.border = 'none';
    });

    document.getElementById("transfer_amount").addEventListener("click", function() {
        document.getElementById("transfer_amount").style.border = 'none';
    });

    sender_username = username;

    $(document).ready(function() {
        // Отправляем запрос к базе данных
        $.ajax({
            type: 'GET',
            url: '/getClientAccounts', // Путь к серверному обработчику запроса
            data: { username: username }, // Передаем имя пользователя на сервер
            success: function(response) {
                // console.log("Accounts: " + JSON.stringify(response)); // Выводим ответ от сервера в консоль
                addAccounts(response); // Передаем массив объектов напрямую
            },
            error: function(xhr, status, error) {
                console.error('Ошибка выполнения запроса:', error);
            }
        });
    });
});
