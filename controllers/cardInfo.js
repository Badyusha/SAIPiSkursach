let user_name;
let cardId;

// Посылаем GET запрос на сервер для получения логина пользователя
$(document).ready(function() {
    // Посылаем GET запрос на сервер для получения логина пользователя
    fetch('/getUsername')
        .then(response => response.text())
        .then(username => {
            // Вставляем логин пользователя в div с id "username"
            document.getElementById('username').textContent = username;

            // Получаем имя пользователя из элемента с id "username"
            user_name = $('#username').text().trim();
        });

    const urlParams = new URLSearchParams(window.location.search);
    cardId = urlParams.get('cardId');

    // Отправляем запрос на сервер
    $.ajax({
        type: 'GET',
        url: '/getCardData', // Путь к серверному обработчику запроса
        data: { cardId: cardId }, // Передаем имя пользователя на сервер
        success: function(response) {
            // console.log("Response: " + JSON.stringify(response)); // Выводим ответ от сервера в консоль
            addCardData(response); // Передаем массив объектов напрямую
        },
        error: function(xhr, status, error) {
            console.error('Ошибка выполнения запроса:', error);
        }
    });

    // Обработчик изменения выбранного значения в списке
    document.getElementById("dropdown").addEventListener("change", function() {
        var selectedOption = this.value; // Получаем выбранную опцию
        console.log("Выбранная опция: " + selectedOption);
        // Здесь можно добавить код для обработки выбранной опции
    });
});

function addCardData(response) {
    document.getElementById('valid_date').innerHTML = response[0].valid_until;

    document.getElementById('balance').innerHTML = response[0].balance + " " + response[0].currency;

    document.getElementById('card_number').innerHTML = response[0].card_number.substring(0, 4) + " **** **** " + 
                                                        response[0].card_number.substring(response[0].card_number.length - 4);

    document.getElementById('account_number').innerHTML = "Счет: " + response[0].account_number.substring(0, 4) +
                                                            " **** **** **** **** " +
                                                            response[0].account_number.substring(response[0].account_number.length - 4);
}



let account_number_currency;

function addChangeInfo() {
    $.ajax({
        type: "GET",
        url: "/getAccountNumberWithCurrencies",
        data: { },
        success: function(response) {
            // Обработка полученных номеров счетов
            account_number_currency = response;
            updateAccountDropdowns(account_number_currency);
        },
        error: function(xhr, status, error) {
            // Обработка ошибки
            console.error(xhr.responseText);
        }
    });
}

function appendTransferedCurrencyRow(number, transferedCurrencySelect) {    
    var currency_option = document.createElement("option");
    
    currency_option.value = number.currency;
    currency_option.text = number.currency;

    // Переменная для хранения флага, указывающего на наличие элемента
    var isElementPresent = false;

    // Проходимся по каждому элементу списка
    for (var i = 0; i < transferedCurrencySelect.options.length; i++) {
        // Сравниваем значение текущего элемента с искомым значением
        if (transferedCurrencySelect.options[i].value === currency_option.value) {
            // Если значения совпадают, устанавливаем флаг и выходим из цикла
            isElementPresent = true;
            break;
        }
    }

    // Проверяем значение флага и делаем соответствующие действия
    if (!isElementPresent) {
        transferedCurrencySelect.appendChild(currency_option);
    }    
}

function updateTransferedAccountNumbers() {
    var transferedDropdown = document.getElementById("transfered_account_number_dropdown");
    transferedDropdown.innerHTML = "";
    
    account_number_currency.forEach(function(number) {
        if(number.currency === transfered_currency_dropdown.value) {
            var option = document.createElement("option");
            option.value = number.account_number;
            option.text = number.account_number;
            transferedDropdown.appendChild(option);
        }
    });
}

function fillTransferCurrency() {
    let transferCurrencySelect = document.getElementById('currency_for_transfer_dropdown');
    
    account_number_currency.forEach(function(number) {
        let elementPresents = false;
        for (var i = 0; i < transferCurrencySelect.options.length; i++) {
            if (transferCurrencySelect.options[i].value === number.currency) {
                elementPresents = true;
                break;
            }
        }
        if(!elementPresents) {
            var currency_option = document.createElement("option");
    
            currency_option.value = number.currency;
            currency_option.text = number.currency;

            transferCurrencySelect.appendChild(currency_option);
        }
    }); 
}

function updateAccountDropdowns() {
    var accountDropdown = document.getElementById("account_number_for_transfer_dropdown");
    var transferedCurrencySelect = document.getElementById('transfered_currency_dropdown');    
    
    accountDropdown.innerHTML = ""; // Очищаем текущие значения
    transferedCurrencySelect.innerHTML = "";

    fillTransferCurrency();

    let selected_currency = document.getElementById('currency_for_transfer_dropdown').value;

    // Добавляем полученные номера счетов в выпадающий список
    account_number_currency.forEach(function(number) {
        var option = document.createElement("option");
        option.value = number.account_number;
        option.text = number.account_number;

        
        (number.currency !== selected_currency) ?
                                                appendTransferedCurrencyRow(number, transferedCurrencySelect)
                                                :
                                                accountDropdown.appendChild(option);
    });

    updateTransferedAccountNumbers();
}

// Функция для открытия модального окна
function openModal(modalId) {
    if(modalId === 'changeCurrency') {
        addChangeInfo();
    }

    var modal = document.getElementById(modalId);
    modal.style.display = "block"; // Показываем модальное окно
}

// Функция для закрытия модального окна
function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none"; // Скрываем модальное окно
}

function createNewAccount() {
    // Отправляем запрос к базе данных
    $.ajax({
        type: 'post',
        url: '/createNewAccount', // Путь к серверному обработчику запроса
        data: {
            currency: document.getElementById('account_dropdown').value,
            username: user_name
        },
        success: function(response) {
            // console.log("Response: " + JSON.stringify(response)); // Выводим ответ от сервера в консоль
            openSuccessModal(response); // Передаем массив объектов напрямую
        },
        error: function(xhr, status, error) {
            console.error('Ошибка выполнения запроса:', error);
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

function isAmountCorrect(amount) {
    let error_style = '2px solid red';

    let change_amount_input = document.getElementById('change_amount');
    change_amount_input.addEventListener('click', function(){
        change_amount_input.style.border = "none";
        document.getElementById('error_message').textContent = "";
    });

    if(amount.length === 0) {
        change_amount_input.style.border = error_style;
        return;
    }

    let parsedAmount = parseFloat(amount);

    switch(document.getElementById('currency_for_transfer_dropdown').value) {
        case 'USD' : {
            if(parsedAmount < 5) {
                change_amount_input.style.border = error_style;
                document.getElementById('error_message').textContent = "Сумма должна быть не менее 5 USD";
                return false;
            }
            return true;
        }
        case 'BYN' : {
            if(parsedAmount < 10) {
                change_amount_input.style.border = error_style;
                document.getElementById('error_message').textContent = "Сумма должна быть не менее 10 BYN";
                return false;
            }
            return true;
        }
    }
    document.getElementById('error_message').textContent = "Неверное значение";
    return false;

}

let amount_before_converting;

function changeConfirmation() {
    amount_before_converting = document.getElementById('change_amount').value;
    if(!isAmountCorrect(amount_before_converting)) { return; };

    let to_currency = document.getElementById('transfered_currency_dropdown').value;

    $.ajax({
        type: "GET",
        url: "/confirmChangingCurrency",
        data: {
            to_currency: to_currency,
            amount: amount_before_converting
        },
        success: function(response) {
            // Обработка полученных номеров счетов
            let commission = response[0];
            document.getElementById('commission').textContent = "Комиссия: " + commission + ' ' + to_currency;
            document.getElementById('commission').value = commission;
            
            let recieve_amount = response[2];
            document.getElementById('amount_to_recieve').textContent = "Сумма к получению: " + recieve_amount + " " + to_currency;
            document.getElementById('amount_to_recieve').value = recieve_amount;

            let debited_amount = response[3];
            document.getElementById('debited_amount').textContent = "Списываемая сумма: " + debited_amount;
            document.getElementById('debited_amount').value = debited_amount;

            let from_account_msg = "Со счета: " + document.getElementById('account_number_for_transfer_dropdown').value;
            document.getElementById('from_account').textContent = from_account_msg;
            document.getElementById('from_account').value = document.getElementById('account_number_for_transfer_dropdown').value;

            let to_account_msg = "На счет: " + document.getElementById('transfered_account_number_dropdown').value;
            document.getElementById('to_account').textContent = to_account_msg;
            document.getElementById('to_account').value = document.getElementById('transfered_account_number_dropdown').value;
            
            document.getElementById('exchange_rate').textContent = "Курс обмена: 1 USD = " + response[1] + " BYN";
        },
        error: function(xhr, status, error) {
            // Обработка ошибки
            console.error(xhr.responseText);
        }
    });

    closeModal('changeCurrency');
    openModal('confirmChangeModal');
}

function confirmChange() {
    // let from_account_number = document.getElementById('account_number_for_transfer_dropdown').value;
    // let to_account_number = document.getElementById('transfered_account_number_dropdown').value;
    // let from_currency = document.getElementById('currency_for_transfer_dropdown').value;

    let total_amount = parseFloat(document.getElementById('amount_to_recieve').value);

    $.ajax({
        type: "post",
        url: "/changeCurrency",
        data: {
            sender_amount: amount_before_converting,
            commission: parseFloat(document.getElementById('commission').value),
            recieve_amount: total_amount,
            send_amount: parseFloat(document.getElementById('debited_amount').value),
            from_account: document.getElementById('from_account').value,
            to_account: document.getElementById('to_account').value
        },
        success: function(response) {
            openSuccessModal(response);
        },
        error: function(xhr, status, error) {
            // Обработка ошибки
            console.error(xhr.responseText);
        }
    });

    closeModal('confirmChangeModal');
}


function signOut() {
    $.ajax({
        type: "post",
        url: "/SignOut",
        data: { },
        success: function(response) {
            if(response === '200') {
                window.location.href = "/SignIn";
            }
        },
        error: function(xhr, status, error) {
            // Обработка ошибки
            console.error(xhr.responseText);
        }
    });
}

function openSuccessModal(response) {    
    document.getElementById('transfer_condition').textContent = response;

    var modal = document.getElementById("successModal");
    modal.style.display = "block"; // Показываем модальное окно
}

function clearTable() {
    const tbody = document.querySelector('#payment_table tbody');
    tbody.innerHTML = ''; // Очищаем содержимое tbody
}

function addPaymentsHistoryList(response) {
    // Получаем ссылку на tbody
    const tbody = document.querySelector('#payment_table tbody');

    console.log(response);

    // Проходим по каждому элементу в массиве и добавляем его в таблицу
    response.forEach((payment, index) => {
        // Создаем новую строку в таблице
        const row = document.createElement('tr');

        // Добавляем ячейки в эту строку
        const dateCell = document.createElement('td');
        dateCell.textContent = payment.start_date;
        row.appendChild(dateCell);

        const paymentOptionCell = document.createElement('td');
        paymentOptionCell.textContent = 'Обмен валют';
        row.appendChild(paymentOptionCell);

        const debitedAmountCell = document.createElement('td');
        debitedAmountCell.textContent = payment.debited_amount;
        row.appendChild(debitedAmountCell);

        const commissionAmountCell = document.createElement('td');
        commissionAmountCell.textContent = payment.commission_amount;
        row.appendChild(commissionAmountCell);

        const currencyCell = document.createElement('td');
        currencyCell.textContent = payment.currency;
        row.appendChild(currencyCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = payment.status;

        (payment.status === 'successful')
                                        ?
                                        statusCell.style.color = 'green'
                                        :
                                        statusCell.style.color = 'red';

        row.appendChild(statusCell);

        (index % 2 === 0)
                        ?
                        row.classList.add('even-row') // Добавляем класс для четных строк
                        :
                        row.classList.add('odd-row'); // Добавляем класс для нечетных строк

        // Добавляем созданную строку в tbody
        tbody.appendChild(row);
    });
}

function paymentsHistory() {
    $.ajax({
        type: "get",
        url: "/getPaymentsHistory",
        data: {
            cardId: cardId
        },
        success: function(response) {
            clearTable();
            addPaymentsHistoryList(response);
        },
        error: function(xhr, status, error) {
            // Обработка ошибки
            console.error(xhr.responseText);
        }
    });
    
    openModal('paymentsHistory');
}

function addTransfersHistoryList(response) {
    // Получаем ссылку на tbody
    const tbody = document.querySelector('#payment_table tbody');

    console.log(response);

    // Проходим по каждому элементу в массиве и добавляем его в таблицу
    response.forEach((payment, index) => {
        // Создаем новую строку в таблице
        const row = document.createElement('tr');

        // Добавляем ячейки в эту строку
        const dateCell = document.createElement('td');
        dateCell.textContent = payment.start_date;
        row.appendChild(dateCell);

        const paymentOptionCell = document.createElement('td');

        switch(payment.payment_option) {
            case 'account_number' : {
                paymentOptionCell.textContent = 'По номеру карты';
                break;
            }
            case 'bank_client' : {
                paymentOptionCell.textContent = 'По ФИО клиента';
                break;
            }
            case 'banking' : {
                paymentOptionCell.textContent = 'Банкинг';
                break;
            }
            default : {
                paymentOptionCell.textContent = 'Отсутствует';
                break;
            }
        }

        row.appendChild(paymentOptionCell);

        const debitedAmountCell = document.createElement('td');
        debitedAmountCell.textContent = payment.debited_amount;
        row.appendChild(debitedAmountCell);

        const commissionAmountCell = document.createElement('td');
        commissionAmountCell.textContent = payment.commission_amount;
        row.appendChild(commissionAmountCell);

        const currencyCell = document.createElement('td');
        currencyCell.textContent = payment.currency;
        row.appendChild(currencyCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = payment.status;

        (payment.status === 'successful')
                                        ?
                                        statusCell.style.color = 'green'
                                        :
                                        statusCell.style.color = 'red';

        row.appendChild(statusCell);

        (index % 2 === 0)
                        ?
                        row.classList.add('even-row') // Добавляем класс для четных строк
                        :
                        row.classList.add('odd-row'); // Добавляем класс для нечетных строк

        console.log(row);

        // Добавляем созданную строку в tbody
        tbody.appendChild(row);
    });
}

function transfersHistory() {
    $.ajax({
        type: "get",
        url: "/getTransfersHistory",
        data: {
            cardId: cardId
        },
        success: function(response) {
            clearTable();
            addTransfersHistoryList(response);
        },
        error: function(xhr, status, error) {
            // Обработка ошибки
            console.error(xhr.responseText);
        }
    });
    
    openModal('paymentsHistory');
}