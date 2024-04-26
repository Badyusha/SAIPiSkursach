// Посылаем GET запрос на сервер для получения логина пользователя
$(document).ready(function() {
    // Посылаем GET запрос на сервер для получения логина пользователя
    fetch('/getUsername')
        .then(response => response.text())
        .then(username => {
            // Вставляем логин пользователя в div с id "username"
            document.getElementById('username').textContent = username;

            // Получаем имя пользователя из элемента с id "username"
            var username = $('#username').text().trim();

            // Отправляем запрос к базе данных
            $.ajax({
                type: 'GET',
                url: '/getClientData', // Путь к серверному обработчику запроса
                data: { username: username }, // Передаем имя пользователя на сервер
                success: function(response) {
                    // console.log("Response: " + JSON.stringify(response)); // Выводим ответ от сервера в консоль
                    addAccountBalanceData(response); // Передаем массив объектов напрямую
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка выполнения запроса:', error);
                }
            });

            // Отправляем запрос к базе данных
            $.ajax({
                type: 'GET',
                url: '/getClientCardsInfo', // Путь к серверному обработчику запроса
                data: { username: username }, // Передаем имя пользователя на сервер
                success: function(response) {
                    // console.log("Response: " + JSON.stringify(response)); // Выводим ответ от сервера в консоль
                    addCards(response); // Передаем массив объектов напрямую
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка выполнения запроса:', error);
                }
            });
        });

    // Обработчик изменения выбранного значения в списке
    document.getElementById("dropdown").addEventListener("change", function() {
        var selectedOption = this.value; // Получаем выбранную опцию
        console.log("Выбранная опция: " + selectedOption);
        // Здесь можно добавить код для обработки выбранной опции
    });
});

function addAccountBalanceData(results) {
    console.log("in addAccountBalanceData");
    // Получаем ссылку на таблицу
    var table = document.getElementById("account_balance_table");

    if(results.length === 0) {
        while (table.rows.length > 0) {
            table.deleteRow(0);
        }
        var row = table.insertRow();
        
        // Добавляем ячейки с данными в эту строку
        var cell1 = row.insertCell(0);
        cell1.innerHTML = "U have no accounts";
    }

    // Проходим по результатам запроса и добавляем их в таблицу
    results.forEach(function(rowData) {
        // Создаем новую строку в таблице
        var row = table.insertRow();
        
        // Добавляем ячейки с данными в эту строку
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        
        // Заполняем ячейки данными из результатов запроса
        var account_number = rowData.account_number;

        cell1.innerHTML = account_number.substring(0, 4) + " **** **** **** **** " + account_number.substring(account_number.length - 4);
        cell2.innerHTML = rowData.balance + " " + rowData.currency;
    });

}

// Функция для открытия модального окна
function openModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "block"; // Показываем модальное окно
}

// Функция для закрытия модального окна
function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none"; // Скрываем модальное окно
}

function addCards(results) {
    
    // Получаем ссылку на таблицу
    var table = document.getElementById("cards_table");
    
    if(results.length === 0){
        var row = table.insertRow();
        
        // Добавляем ячейки с данными в эту строку
        var cell1 = row.insertCell(0);
        cell1.innerHTML = "U have no cards";
    }

    // Инициализируем переменные для отслеживания текущей строки и столбца
    var currentRow = 0;
    var currentColumn = 0;

    // Используем цикл для прохода по результатам и добавления кнопок в таблицу
    results.forEach(function(result, index) {
        // Если текущая строка не существует, создаем ее
        if (!table.rows[currentRow]) {
            table.insertRow(currentRow);
        }

        // Создаем ячейку в текущей строке для текущего столбца
        var cell = table.rows[currentRow].insertCell(currentColumn);

        // Создаем кнопку с данными из текущего элемента массива results
        var button = document.createElement("button");

        button.setAttribute("type", "submit");

        // Создаем элементы для отображения баланса, валюты и номера карты внутри кнопки
        var balanceDiv = document.createElement("div");
        balanceDiv.innerHTML = result.balance + " " + result.currency;
        balanceDiv.style.marginBottom = "60px";
        balanceDiv.style.marginRight = "10px";
        balanceDiv.style.marginTop = "10px";
        
        var cardNumberDiv = document.createElement("div");
        var cardNumber = result.card_number;
        var maskedCardNumber = cardNumber.substring(0, 4) + " **** **** " + cardNumber.substring(cardNumber.length - 4);
        cardNumberDiv.innerHTML = maskedCardNumber;
        cardNumberDiv.style.marginBottom = "5px";
        cardNumberDiv.style.marginRight = "10px";

        // Добавляем элементы в кнопку в нужном порядке
        button.appendChild(balanceDiv);
        button.appendChild(cardNumberDiv);

        // // Устанавливаем атрибут id для кнопки
        // button.setAttribute("id", result.card_id);

        // Добавляем обработчик события click для кнопки
        button.addEventListener("click", function() {
            // Выполнить переход на новую страницу, например:
            window.location.href = "/CardInfo/" + result.card_id;
        });

        // Добавляем кнопку в текущую ячейку
        cell.appendChild(button);

        // Увеличиваем индекс столбца
        currentColumn++;

        // Если достигнут лимит кнопок в строке, переходим на следующую строку
        if (currentColumn >= 2) {
            currentRow++;
            currentColumn = 0;
        }
    });
}

// Функция для открытия новой страницы с данными из выбранного выпадающего списка
function openNewPage() {
    var transferDropdown = document.getElementById("transfer_dropdown");
    var selectedOption = transferDropdown.value; // Получаем выбранную опцию из списка

    // Формируем URL с выбранными данными в качестве параметров
    switch(selectedOption) {
        case 'transferToBankClient' : {
            window.location.href = "/TransferToBankClient";
            break;
        }
        case 'transferByAccountNumber' : {
            window.location.href = "/TransferByAccountNumber";
            break;
        }
        case 'banking' : {
            window.location.href = "/BankingTransfer";
            break;
        }
    }
}