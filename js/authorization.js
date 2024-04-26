$(document).ready(function() {
    $('#signin_form').submit(function(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

        // Собираем данные формы
        var formData = {
            username: $('#username').val(),
            password: $('#password').val(),
        };

        // Отправляем POST запрос на сервер
        $.ajax({
            type: 'POST',
            url: '/SignIn', // URL адрес, на который отправляется запрос
            data: formData, // Данные формы
            success: function(response) {
            console.log(response); // Выводим ответ от сервера в консоль
            }
        });
    });
});

function validateForm() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if(username == "" || password == "") {
        document.getElementById('username').style.border='1px solid red';
        return false;
    }

    let cookie = `${'username'}=${username}`;

    document.cookie = cookie;
    return true;
}