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

    // Обработчики событий для кнопок
    $('#create_account').click(function() {
        showCurrencyDropdown('Открыть счет');
    });

    $('#create_card').click(function() {
        showAccountDropdownForCard('Оформить карту');
    });

    $('#top_up_account').click(function() {
        showAccountDropdown('Пополнить счет');
    });

    $('#payments_history').click(function() {
        showPaymentHistory('История платежей');
    });

    $('#clients_dropdown').change(function() {
        document.getElementById("clients_dropdown").style.border = "";
        closeEmployeeOptions();
    });

    // Обработчик для кнопки отмены
    $(document).on('click', '#cancel_action', function() {
        $('#employee_options').empty(); // Очищаем содержимое формы
    });

    // Обработчик для кнопки продолжить
    $(document).on('click', '#continue_action', function() {
        // Здесь можно добавить логику для продолжения действия
    });
});

// Функция для отображения выпадающего списка валюты
function showCurrencyDropdown(text) {
    if(clientsDropdownEmpty()) {
        document.getElementById("clients_dropdown").style.border = "2px solid red";
        return;
    }

    $('#employee_options').html('<div id="employee_options_div">' +
                                    '<label id="choosed_option" style="font-size: 26px;">' + text + '</label><br><br><br><br>' +
                                    '<label id="choose_client_label" style="margin-right: 50px;">Выберите валюту:</label>' +
                                    '<select id="transfer_dropdown" style="width: 70px;">' +
                                        '<option value="BYN">BYN</option>' +
                                        '<option value="USD">USD</option>' +
                                    '</select><br><br><br><br>' +
                                    '<input type="button" id="cancel_action" value="Отмена" onclick="closeEmployeeOptions()">' +
                                    '<input type="button" id="continue_action" value="Оформить" onclick="createAccount()">' +
                                '</div>');
}

async function showAccountDropdownForCard(text) {
    if(clientsDropdownEmpty()) {
        document.getElementById("clients_dropdown").style.border = "2px solid red";
        return;
    }

    // Предположим, что список счетов получается с сервера
    var accounts = await getAccounts();

    var accountOptions ='<label id="choosed_option" style="font-size: 26px;">' + text + '</label><br>';

    if(accounts === null) {
        accountOptions += '<label id="choosed_option" style="font-size: 22px;">У пользователя нет счета!</label>'
        $('#employee_options').html(accountOptions);
        return;
    }

    accountOptions +='<table style="border-spacing: 20px;">' +
                        '<tr>' +
                            '<td>' +
                                '<label id="choose_client_label">Выберите счет:</label>' +
                            '</td>' +
                            '<td>' +
                                '<select id="account_number_for_transfer_dropdown" style="width: 220px;">';
    Array.from(accounts).forEach(function(account) {
        accountOptions += '<option value="' + account.account_number + '">' + account.account_number + '</option>';
    });
    accountOptions +=       '</select>' +
                            '</td></tr><table><br>' +
                        '<div style="display: flex; justify-content: space-between;">' +
                            '<input type="button" id="cancel_action" value="Отмена" onclick="closeEmployeeOptions()">' +
                            '<input type="button" id="continue_action" value="Продолжить" onclick="createCard()">'
                        '</div>';

    $('#employee_options').html(accountOptions);
}

// Функция для отображения выпадающего списка счетов
async function showAccountDropdown(text) {
    if(clientsDropdownEmpty()) {
        document.getElementById("clients_dropdown").style.border = "2px solid red";
        return;
    }

    // Предположим, что список счетов получается с сервера
    var accounts = await getAccounts(); // Замени на данные с сервера

    var accountOptions ='<label id="choosed_option" style="font-size: 26px;">' + text + '</label><br>';

    if(accounts === null) {
        accountOptions += '<label id="choosed_option" style="font-size: 22px;">У пользователя нет счета!</label>'
        $('#employee_options').html(accountOptions);
        return;
    }

    accountOptions +='<table style="border-spacing: 20px;">' +
                        '<table style="border-spacing: 20px;">' +
                        '<tr>' +
                            '<td>' +
                                '<label id="choose_client_label">Выберите счет:</label>' +
                            '</td>' +
                            '<td>' +
                                '<select id="account_number_for_transfer_dropdown" style="width: 220px;">';
    Array.from(accounts).forEach(function(account) {
        accountOptions += '<option value="' + account.account_number + '">' + account.account_number + '</option>';
    });
    accountOptions +=           '</select>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>' +
                                '<label id="choose_client_label">Введите сумму:</label>' +
                            '</td>' +

                            '<td>' +
                                '<input type="number" id="amount_input">' +
                            '</td>' +
                        '</tr>' +
                        '</table>' +
                        '<div style="display: flex; justify-content: space-between;">' +
                            '<input type="button" id="cancel_action" value="Отмена" onclick="closeEmployeeOptions()">' +
                            '<input type="button" id="continue_action" value="Продолжить" onclick="topUpAccount()">'
                        '</div>';

    $('#employee_options').html(accountOptions);
}

// Функция для отображения таблицы истории платежей
async function showPaymentHistory(text) {
    if(clientsDropdownEmpty()) {
        document.getElementById("clients_dropdown").style.border = "2px solid red";
        return;
    }

    // Предположим, что данные о платежах получаются с сервера 
    var paymentHistory = await getPayments();

    if(paymentHistory.length === 0) {
        $('#employee_options').html('<h2 style="color: white;">У пользователя нет ни одного платежа</h2>');
        return;
    }

    var table = '<label id="choosed_option" style="font-size: 26px; margin-top: -300px;">' + text + '</label><br>' +
                '<table id="payment_table" style="width: 600px">' +
                '<tr class="odd-row"><th>Дата</th><th>Кому(id)</th><th>Операция</th><th>Сумма</th><th>Валюта</th></tr>';
    paymentHistory.forEach(function(payment, index) {
        let rowClass;
        (index % 2 === 0)
                    ?
                    rowClass = "even-row" // Добавляем класс для четных строк
                    :
                    rowClass = "odd-row"; // Добавляем класс для нечетных строк
        table += '<tr class="' + rowClass + '"><td>' + payment.date + '</td>' +
                 '<td>' + payment.recipient_account_id + '</td>' +
                 '<td>' + payment.payment_option + '</td>' +
                 '<td>' + payment.debited_amount + '</td>' +
                 '<td>' + payment.currency + '</td></tr>';
    });
    table += '</table>';

    $('#employee_options').html(table);
}

function getPayments() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "get",
            url: "/getPayments",
            data: {
                user_id: document.getElementById('clients_dropdown').value
            },
            success: function(response) {
                resolve(response);
            },
            error: function(xhr) {
                // Обработка ошибки
                console.error(xhr.responseText);
                reject(xhr.responseText);
            }
        });
    });
}

function getAccounts() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "get",
            url: "/getAccounts",
            data: {
                client_id: document.getElementById('clients_dropdown').value
            },
            success: function(response) {
                resolve(response);
            },
            error: function(xhr) {
                // Обработка ошибки
                console.error(xhr.responseText);
                reject(xhr.responseText);
            }
        });
    });
}

function closeEmployeeOptions() {
    $('#employee_options').html('');
}

function clientsDropdownEmpty() {
    return document.getElementById("clients_dropdown").value === "";
}

function addClientsIntoDropdown(response) {
    var clientsDropdown = document.getElementById("clients_dropdown");
    
    clientsDropdown.innerHTML = ""; // Очищаем текущие значения

    // Добавляем полученные номера счетов в выпадающий список
    response.forEach(function(client) {
        var option = document.createElement("option");
        let text = client.user_id + '. ' + client.last_name + ' ' + client.first_name + ' ' + client.middle_name;
        option.value = client.user_id;
        option.text = text;

        clientsDropdown.appendChild(option);
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

function openSuccessModal(response) {    
    document.getElementById('transfer_condition').textContent = response;

    var modal = document.getElementById("successModal");
    modal.style.display = "block"; // Показываем модальное окно
}

function amountEmpty() {
    let amount = document.getElementById('amount_input');
    return amount.value === "" || parseFloat(document.value) < 1; 
}

function topUpAccount() {
    if(amountEmpty()) {
        document.getElementById('amount_input').style.border = "2px solid red";
        document.getElementById('amount_input').addEventListener('click', function() {
            document.getElementById("amount_input").style.border = "";
        });
        return;
    }

    $.ajax({
        type: "post",
        url: "/topUpAccount",
        data: {
            account_number: document.getElementById('account_number_for_transfer_dropdown').value,
            amount: document.getElementById('amount_input').value
        },
        success: function(response) {
            openSuccessModal(response);
        },
        error: function(xhr) {
            // Обработка ошибки
            openSuccessModal("Что-то пошло не так(");
            console.error(xhr.responseText);
        }
    });
}

function createCard() {
    $.ajax({
        type: "post",
        url: "/createCard",
        data: {
            account_number: document.getElementById('account_number_for_transfer_dropdown').value
        },
        success: function(response) {
            openSuccessModal(response);
        },
        error: function(xhr) {
            // Обработка ошибки
            openSuccessModal("Что-то пошло не так(");
            console.error(xhr.responseText);
        }
    });
}

function createAccount() {
    $.ajax({
        type: "post",
        url: "/createAccount",
        data: {
            currency: document.getElementById('transfer_dropdown').value,
            client_id: document.getElementById('clients_dropdown').value
        },
        success: function(response) {
            openSuccessModal(response);
        },
        error: function(xhr) {
            // Обработка ошибки
            openSuccessModal("Что-то пошло не так(");
            console.error(xhr.responseText);
        }
    });
}