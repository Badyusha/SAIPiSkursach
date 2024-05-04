let sender_username;


fetch('/getUsername')
.then(response => response.text())
.then(username => {
    document.getElementById('username').textContent = username;
    
    document.getElementById("operation_code").addEventListener("change", function() {
        document.getElementById("operation_code").style.border = 'none';
    });

    document.getElementById("transfer_amount").addEventListener("change", function() {
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

function addAccounts(response) {
    var selectElement = document.getElementById("select_card_number");

    response.forEach(function(option) {
        var newOption = document.createElement("option");
        newOption.value = option.account_number;
        newOption.text = option.account_number;
        selectElement.add(newOption);
    });
}

let total_transfer_amount;
let transfer_currency;
let commission;

function confirmTransfer() {
    $(document).ready(function() {

        let formData = {
            operation_code: document.getElementById('operation_code').value,
            transfer_amount: total_transfer_amount,
            currency: transfer_currency,
            commission: commission,
            sender_account_number: document.getElementById("select_card_number").value
        };
        
        // Отправляем POST запрос на сервер
        $.ajax({
            type: 'POST',
            url: '/BankingTransfer', // URL адрес, на который отправляется запрос
            data: formData, // Данные формы
            success: function(response) {
                openSuccessModal(response);
            }
        });
    });

    closeModal('confirmModal');
}

function fieldsAreEmpty() {
    let fields_are_empty = false;
    let operation_code = document.getElementById("operation_code");

    if(operation_code.value.length === 0) {
        operation_code.style.border = '2px solid red';
        fields_are_empty = true;
    }

    let trans_amount = document.getElementById("transfer_amount");
    if(trans_amount.value.length === 0) {
        trans_amount.style.border = '2px solid red';
        fields_are_empty = true;
    }

    return fields_are_empty;
}

// Функция для открытия модального окна
function openModal(modalId) {
    if(modalId === 'transferModal'){
        var modal = document.getElementById(modalId);
        modal.style.display = "block"; // Показываем модальное окно
        return;
    }

    if(modalId === 'accountModal'){
        var modal = document.getElementById(modalId);
        modal.style.display = "block"; // Показываем модальное окно
        return;
    }

    if(modalId === 'changeCurrency') {
        addChangeInfo();
        var modal = document.getElementById(modalId);
        modal.style.display = "block"; // Показываем модальное окно
        return;
    }

    if (modalId === 'confirmModal' && fieldsAreEmpty()) { return; }

    $(document).ready(function () {
        // Отправляем запрос к базе данных
        $.ajax({
            type: 'GET',
            url: '/getCommssionRule', // Путь к серверному обработчику запроса
            data: { 
                account_number: document.getElementById("select_card_number").value,
                commission_type: 'banking'
            },
            success: function (response) {
                let transfer_amount = parseFloat(document.getElementById("transfer_amount").value);

                $.ajax({
                    type: 'GET',
                    url: '/getBankingName',
                    data: { banking_id: document.getElementById('operation_code').value },
                    success: function (res) {
                        response.forEach(function (value) {
                            if (transfer_amount >= parseFloat(value.from_amount) && transfer_amount <= parseFloat(value.to_amount)) {
                                transfer_currency = value.currency;
                                commission = parseFloat((transfer_amount * (parseInt(value.percent) / 100)).toFixed(2));
                                document.getElementById("commission_message").textContent = "Комиссия: " + commission + " " + transfer_currency;

                                total_transfer_amount = (transfer_amount - commission).toFixed(2);
                                document.getElementById("total_amount").textContent = "Итого к отправке: " + total_transfer_amount + " " + transfer_currency;

                                document.getElementById('banking_name').textContent = "Оплачиваемая услуга: " + res;

                                var modal = document.getElementById(modalId);
                                modal.style.display = "block"; // Показываем модальное окно
                                return;
                            }
                        });
                    },
                    error: function (error) {
                        console.error('Ошибка выполнения запроса:', error);
                    }
                });
            },
            error: function (error) {
                console.error('Ошибка выполнения запроса:', error);
            }
        });
    });
}

function createNewAccount() {
    // Отправляем запрос к базе данных
    $.ajax({
        type: 'post',
        url: '/createNewAccount', // Путь к серверному обработчику запроса
        data: {
            currency: document.getElementById('account_dropdown').value,
            username: sender_username
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

// Функция для закрытия модального окна
function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = "none"; // Скрываем модальное окно
}


function openSuccessModal(response) {
    closeModal('confirmModal');
    closeModal('accountModal');
    closeModal('transferModal');
    
    document.getElementById('transfer_condition').textContent = response;

    var modal = document.getElementById("successModal");
    modal.style.display = "block"; // Показываем модальное окно
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

function openSuccessModal(response) {
    closeModal('confirmChangeModal');
    closeModal('accountModal');
    closeModal('changeCurrency');
    
    document.getElementById('transfer_condition').textContent = response;

    var modal = document.getElementById("successModal");
    modal.style.display = "block"; // Показываем модальное окно
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