let sender_username;


fetch('/getUsername')
.then(response => response.text())
.then(username => {
    document.getElementById('username').textContent = username;
    
    document.getElementById("account_number").addEventListener("change", function() {
        document.getElementById("account_number").style.border = 'none';
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
            reciever_account_number: document.getElementById('account_number').value,
            transfer_amount: total_transfer_amount,
            currency: transfer_currency,
            commission: commission,
            sender_account_number: document.getElementById("select_card_number").value
        };
        
        // Отправляем POST запрос на сервер
        $.ajax({
            type: 'POST',
            url: '/TransferByAccountNumber', // URL адрес, на который отправляется запрос
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
    let account_number = document.getElementById("account_number");

    if(account_number.value.length === 0) {
        account_number.style.border = '2px solid red';
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

    if(modalId === 'confirmModal' && fieldsAreEmpty()){ return; }

    $(document).ready(function() {
        // Отправляем запрос к базе данных
        $.ajax({
            type: 'GET',
            url: '/getCommssionRule', // Путь к серверному обработчику запроса
            data: { 
                account_number: document.getElementById("select_card_number").value,
                commission_type: 'account_number_transfer'
            },
            success: function(response) {
                let transfer_amount = parseFloat(document.getElementById("transfer_amount").value);

                response.forEach(function(value) {
                    if(transfer_amount >= parseFloat(value.from_amount) && transfer_amount <= parseFloat(value.to_amount)) {

                        transfer_currency = value.currency;
                        commission = parseFloat((transfer_amount * (parseInt(value.percent) / 100)).toFixed(2));
                        document.getElementById("commission_message").textContent = "Комиссия: " + commission + " " + transfer_currency;

                        total_transfer_amount = transfer_amount.toFixed(2) - commission.toFixed(2);

                        document.getElementById("total_amount").textContent = "Итого к отправке: " + (total_transfer_amount).toString() + " " + transfer_currency;

                        var modal = document.getElementById(modalId);
                        modal.style.display = "block"; // Показываем модальное окно
                        return;
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error('Ошибка выполнения запроса:', error);
            }
        });
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
            window.location.href = "/Banking";
            break;
        }
    }
}