$(document).ready(function() {
    $('#signup_form').submit(function(event) {
        var isValid = validateForm();
        // Если форма не прошла валидацию, предотвращаем стандартное поведение отправки формы
        if (!isValid) {
            event.preventDefault();
            return;
        }

        // Собираем данные формы
        var formData = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            birth_date: $('#birth_date').val(),
            username: $('#username').val(),
            password: $('#password').val(),
        };

        // Отправляем POST запрос на сервер
        $.ajax({
            type: 'POST',
            url: '/SignUp', // URL адрес, на который отправляется запрос
            data: formData, // Данные формы
            success: function(response) {
                window.location.href = "/ClientHomePage";
                console.log(response); // Выводим ответ от сервера в консоль
            }
        });
    });
});

function validateForm() {
    event.preventDefault();

    var fisrt_name = document.getElementById('first_name').value;
    var last_name = document.getElementById('last_name').value;
    var birth_date = document.getElementById('birth_date').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var repeated_password = document.getElementById('repeated_password').value;

    var first_name_error = document.getElementById('first_name_error');
    var last_name_error = document.getElementById('last_name_error');
    var birth_date_error = document.getElementById('birth_date_error');
    var username_error = document.getElementById('username_error');
    var password_error = document.getElementById('password_error');

    first_name_error.textContent = '';
    last_name_error.textContent = '';
    birth_date_error.textContent = '';
    username_error.textContent = '';
    password_error.textContent = '';

    var isValid = true;
    var requiredField = 'Обязательное поле';
    var invalidFormat = 'Неверный формат';
    var border_style = '1px solid red';

    if (fisrt_name === '') {
        document.getElementById('first_name').style.border=border_style;
        isValid = false;
    } else if(!validateName(fisrt_name)){
        first_name_error.textContent = invalidFormat;
        isValid = false;
    }

    if (last_name === '') {
        document.getElementById('last_name').style.border=border_style;
        isValid = false;
    } else if(!validateName(last_name)){
        last_name_error.textContent = invalidFormat;
        isValid = false;
    }

    if (birth_date === ''){
        document.getElementById('birth_date').style.border=border_style;
        isValid = false;
    }

    if(username === ''){ 
        document.getElementById('username').style.border=border_style;
        isValid = false;
    }

    if (password === '') {
        document.getElementById('password').style.border=border_style;
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('password').style.border=border_style;
        password_error.textContent = 'Пароль должен состоять не менее чем из 6 символов';
        isValid = false;
    } else if (password != repeated_password) {
        document.getElementById('password').style.border=border_style;
        document.getElementById('repeated_password').style.border=border_style;
        password_error.textContent = 'Пароли должны совпадать';
        isValid = false;
    }

    if(isValid) {
        let username = document.getElementById('username').value;
        let cookie = `${'username'}=${username}`;

        document.cookie = cookie;
    }

    return isValid;
}

function validateName(username) {
    //
    return true;
}