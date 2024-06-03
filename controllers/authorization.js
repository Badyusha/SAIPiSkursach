document.getElementById('authorize_button').addEventListener('click', function() {
    if(!validateForm()) { return; }

    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

    // Собираем данные формы
    var formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    // Отправляем POST запрос на сервер
    $.ajax({
        type: 'POST',
        url: '/SignIn', // URL адрес, на который отправляется запрос
        data: formData, // Данные формы
        success: function(response) {
            switch(response) {
                case '400' : {
                    document.getElementById('error').innerHTML = "Неверный логин или пароль";
                    break;
                }
                case '500' : {
                    document.getElementById('error').innerHTML = "Ошибка на сервере";
                    break;
                }
            }
            // Проверяем, содержит ли ответ редирект
            if (response.indexOf('/ClientHomePage') !== -1 || response.indexOf('/EmployeeHomePage') !== -1 || response.indexOf('/SignUp') !== -1 ) {
                window.location.href = response; // Выполняем редирект
            }
            console.log(response); // Выводим ответ от сервера в консоль
        },
        error: function(response) {
            console.log(response); // Выводим ответ от сервера в консоль
        }
    });
});

function validateForm() {
    document.getElementById('username').addEventListener('click', function() {
        document.getElementById('username').style.border = "";
        document.getElementById('password').style.border = "";
    });

    document.getElementById('password').addEventListener('click', function() {
        document.getElementById('username').style.border = "";
        document.getElementById('password').style.border = "";
    });

    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    let validated = true;

    console.log(username, password);

    if(username == "") {
        document.getElementById('username').style.border='2px solid red';
        validated = false;
    }

    if(password == "") {
        document.getElementById('password').style.border='2px solid red';
        validated = false;
    }

    if(!validated) { return validated; }

    let cookie = `${'username'}=${username}`;

    document.cookie = cookie;
    return true;
}