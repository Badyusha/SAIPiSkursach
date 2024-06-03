$(document).ready(function() {
    $('#signup_form').submit(function(event) {
        var isValid = validateForm();
        // Если форма не прошла валидацию, предотвращаем стандартное поведение отправки формы
        if (!isValid) {
            event.preventDefault();
            return;
        }

        let special_code = $('#special_code').val();

        // Собираем данные формы
        var formData = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            middlename: $('#middlename').val(),
            birth_date: $('#birth_date').val(),
            username: $('#username').val(),
            password: $('#password').val(),
            special_code_length: special_code.length
        };

        // Отправляем POST запрос на сервер
        $.ajax({
            type: 'POST',
            url: '/SignUp', // URL адрес, на который отправляется запрос
            data: formData, // Данные формы
            success: function(response) {
                // Проверяем, содержит ли ответ редирект
                if (response.indexOf('/ClientHomePage') !== -1 || response.indexOf('/EmployeeHomePage') !== -1 || response.indexOf('/SignUp') !== -1 ) {
                    window.location.href = response; // Выполняем редирект
                }
                console.log(response);
            },
            error: function(response) {
                document.getElementById('username').style.border = '2px solid red';
                document.getElementById('username_error').innerHTML = 'Имя пользователя занято';
                console.log(response);
            } 
        });
    });
});

function validateForm() {
    event.preventDefault();

    document.getElementById('first_name').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });
    document.getElementById('last_name').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });
    document.getElementById('middlename').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });
    document.getElementById('special_code').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });
    document.getElementById('birth_date').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });
    document.getElementById('username').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });
    document.getElementById('password').addEventListener('click', function(){
        document.getElementById('first_name').style.border = "none";
        document.getElementById('last_name').style.border = "none";
        document.getElementById('middlename').style.border = "none";
        document.getElementById('special_code').style.border = "none";
        document.getElementById('birth_date').style.border = "none";
        document.getElementById('username').style.border = "none";
        document.getElementById('password').style.border = "none";
        document.getElementById('username_error').innerHTML = "";
    });

    var fisrt_name = document.getElementById('first_name').value;
    var last_name = document.getElementById('last_name').value;
    var middle_name = document.getElementById('middlename').value;
    var special_code = document.getElementById('special_code').value;
    var birth_date = document.getElementById('birth_date').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var repeated_password = document.getElementById('repeated_password').value;

    var first_name_error = document.getElementById('first_name_error');
    var last_name_error = document.getElementById('last_name_error');
    var middle_name_error = document.getElementById('middlename_error');
    var special_code_error = document.getElementById('special_code_error');
    var birth_date_error = document.getElementById('birth_date_error');
    var username_error = document.getElementById('username_error');
    var password_error = document.getElementById('password_error');

    first_name_error.textContent = '';
    last_name_error.textContent = '';
    middle_name.textContent = '';
    special_code.textContent = '';
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

    if (middle_name === '') {
        document.getElementById('middlename').style.border=border_style;
        isValid = false;
    } else if(!validateName(middle_name)){
        middle_name_error.textContent = invalidFormat;
        isValid = false;
    }

    if (special_code.length !== 0 && !specialCodeCorrect(special_code)) {
        document.getElementById('last_name').style.border=border_style;
        special_code_error.textContent = 'Неверный код';
        isValid = false;
    }

    if (birth_date === ''){
        document.getElementById('birth_date').style.border=border_style;
        isValid = false;
    }

    var birthDateObj = new Date(birth_date); // Преобразование строки в объект Date
    var today = new Date();
    var age = today.getFullYear() - birthDateObj.getFullYear();
    var monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }

    if (age < 18) {
        document.getElementById('birth_date_error').innerHTML = 'Вы должны быть совершеннолетним';
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

function specialCodeCorrect(special_code) {
    return special_code == 123456;
}