const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const { connect } = require('http2');
const crypto = require('crypto');
const querystring = require('querystring');


const app = express();
const PORT = process.env.PORT || 3000;

// Используем express-session middleware
app.use(session({
    secret: 'your_secret_key', // Секретный ключ для подписи и шифрования куки
    resave: false, // Не сохранять сессию при каждом запросе
    saveUninitialized: false // Не создавать сессию для новых пользователей, пока они не авторизовались
}));

// Разрешаем Express использовать данные формы
app.use(express.urlencoded({ extended: true }));

// Указываем Express использовать папки для раздачи статических файлов
app.use(express.static(path.join(__dirname, '..', 'html')));
app.use(express.static(path.join(__dirname, '..', 'css')));
app.use(express.static(path.join(__dirname, '..', 'js')));
app.use(express.static(path.join(__dirname, '..', 'images')));


// Указываем Express правильные типы MIME для файлов CSS и JavaScript
app.use('/css', express.static(path.join(__dirname, '..', 'css'), { 'Content-Type': 'text/css' }));
app.use('/js', express.static(path.join(__dirname, '..', 'js'), { 'Content-Type': 'application/javascript' }));
app.use('/images', express.static(path.join(__dirname, '..', 'images'), { 'Content-Type': 'image/png' }));

app.set('view engine', 'ejs');

// Создаем соединение с базой данных
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'saipis'
});

// Проверка соединения
connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        reject(err);
        return;
    }
    console.log('Подключение к базе данных успешно!');
});

// Функция для регистрации пользователя в базе данных
async function registerUser(first_name, last_name, middle_name, birth_date, username, password, special_code_length) {
    return new Promise((resolve, reject) => {
        let role;

        (parseInt(special_code_length) === 0) ? role = 'client' : role = 'employee';

        let hashed_password = customHash(password);

        const new_user = {
            username: username,
            password: hashed_password,
            role: role
        };

        if (role === 'employee') {
            connection.query('INSERT INTO user SET ?', new_user, (err, result) => {
                if (err) {
                    console.error('Ошибка выполнения запроса:', err);
                    reject(err); // Если есть ошибка, отклоняем промис
                } else {
                    console.log('Добавлена новая запись в таблицу "user":', result);
                    resolve(role); // Если запрос выполнен успешно, разрешаем промис
                }
            });
        } else {
            connection.query('INSERT INTO user SET ?', new_user, (err, result) => {
                if (err) {
                    console.error('Ошибка выполнения запроса:', err);
                    reject(null); // Если есть ошибка, отклоняем промис
                } else {
                    console.log('Добавлена новая запись в таблицу "user":', result);
                    
                    const user_id = result.insertId;

                    const new_client = {
                        user_id: user_id,
                        first_name: first_name,
                        last_name: last_name,
                        middle_name: middle_name,
                        birth_date: birth_date,
                    };

                    connection.query('INSERT INTO Client SET ?', new_client, (err, result) => {
                        if (err) {
                            console.error('Ошибка выполнения запроса:', err);
                            reject(null); // Если есть ошибка, отклоняем промис
                        } else {
                            console.log('Добавлена новая запись в таблицу "Client":', result);
                            resolve(role); // Если запрос выполнен успешно, разрешаем промис
                        }
                    });
                }
            });
        }
    });
}


function loginUser(username, password) {
    console.log("Пользователь авторизовался: " + username);
    return new Promise((resolve, reject) => {
        connection.query('SELECT user.role FROM user WHERE username = ? AND password = ?', [username, password], (err, result) => {
            if (err) {
                console.error('Ошибка выполнения запроса:', err);
                reject(err);
                return;
            }
            // Если найден пользователь с такими учетными данными, возвращаем true, иначе false
            // console.log(result);
            resolve(result);
        });
    });
}

function customHash(str) {
    const hash = crypto.createHash('sha256'); // Можно выбрать другой алгоритм, например 'md5', 'sha1', 'sha256' и т.д.
    hash.update(str);
    return hash.digest('hex');
}



// Маршрут для отображения страниц
app.get('/SignIn', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'SignIn.html'));
});

app.get('/SignUp', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html', 'SignUp.html'));
});

// Обработчик GET запроса для страницы ClientHomePage
app.get('/ClientHomePage', (req, res) => {
    if(req.session.role === 'employee') {
        res.redirect('/EmployeeHomePage');
        return;
    }
    // Проверяем, авторизован ли пользователь
    if (req.session.username) {
        // Если пользователь авторизован, отправляем HTML код страницы с логином пользователя
        res.sendFile(path.join(__dirname, '..', 'html', 'ClientHomePage.html'));
    } else {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        res.redirect('/SignIn');
    }
});

// Обработчик GET запроса для новой страницы с динамическими параметрами
app.get('/TransferToBankClient', (req, res) => {
    if(req.session.role === 'employee') {
        res.redirect('/EmployeeHomePage');
        return;
    }
    // Проверяем, авторизован ли пользователь
    if (req.session.username) {
        // Если пользователь авторизован, отправляем HTML код страницы с логином пользователя
        res.sendFile(path.join(__dirname, '..', 'html', 'TransferToBankClient.html'));
    } else {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        res.redirect('/SignIn');
    }
});

app.get('/TransferByAccountNumber', (req, res) => {
    if(req.session.role === 'employee') {
        res.redirect('/EmployeeHomePage');
        return;
    }
    // Проверяем, авторизован ли пользователь
    if (req.session.username) {
        // Если пользователь авторизован, отправляем HTML код страницы с логином пользователя
        // res.sendFile(path.join(__dirname, '..', 'html', '.html'));
        res.sendFile(path.join(__dirname, '..', 'html', 'TransferByAccountNumber.html'));
    } else {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        res.redirect('/SignIn');
    }
});

app.get('/BankingTransfer', (req, res) => {
    if(req.session.role === 'employee') {
        res.redirect('/EmployeeHomePage');
        return;
    }
    // Проверяем, авторизован ли пользователь
    if (req.session.username) {
        // Если пользователь авторизован, отправляем HTML код страницы с логином пользователя
        res.sendFile(path.join(__dirname, '..', 'html', 'BankingTransfer.html'));
    } else {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        res.redirect('/SignIn');
    }
});

app.get('/EmployeeHomePage', (req, res) => {
    if(req.session.role === 'client') {
        res.redirect('/ClientHomePage');
        return;
    }
    // Проверяем, авторизован ли пользователь
    if (req.session.username) {
        // Если пользователь авторизован, отправляем HTML код страницы с логином пользователя
        res.sendFile(path.join(__dirname, '..', 'html', 'EmployeeHomePage.html'));
    } else {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        res.redirect('/SignIn');
    }
});




// Обработчик GET запроса для получения логина пользователя
app.get('/getUsername', (req, res) => {
    // Отправляем логин пользователя клиенту
    res.send(req.session.username);
});

app.get('/getClientAccounts', (req, res) => {
    const username = req.query.username;
    // Выполняем запрос к базе данных
    connection.query(
        `select account.number as account_number
        from account
        inner join user on
        user.id = account.user_id
        where user.username = ?`,
        [username],
        (error, results, fields) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getCommssionRule', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select commission_rule.percent, commission_rule.from_amount, commission_rule.to_amount, currency.currency
        from currency
        inner join account on
        account.currency_id = currency.id
        inner join commission_rule on
        commission_rule.currency_id = currency.id
        where account.number = ? and commission_rule.type = ?;`,
        [req.query.account_number, req.query.commission_type],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getAccountNumberWithCurrencies', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select account.number as account_number, currency.currency
        from account
        inner join currency on
        account.currency_id = currency.id
        inner join user on
        user.id = account.user_id
        where user.username = ?;`,
        [req.session.username],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/confirmChangingCurrency', (req, res) => {
    let BYNUSD_rate = 3.1;
    let currency = req.query.to_currency;
    let amount = parseFloat(req.query.amount);

    connection.query(
        `select commission_rule.percent
        from commission_rule
        inner join currency on
        currency.id = commission_rule.currency_id
        where currency.currency = ? and commission_rule.type = 'change_currency' and commission_rule.from_amount <= ? and commission_rule.to_amount >= ?;`,
        [currency, req.query.amount, amount],
        (error, result) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }

            let total_amount;
            let percent = parseFloat(result[0].percent);
            (currency === 'USD') ?
                                total_amount = ((amount / BYNUSD_rate) * (1 - (percent / 100))).toFixed(2)
                                :
                                total_amount = ((amount * BYNUSD_rate) * (1 - (percent / 100))).toFixed(2); 

            res.send([percent, BYNUSD_rate, total_amount, amount]);
        }
    );
});

app.get('/getPaymentsHistory', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select payment.commission_amount, payment.debited_amount, payment.status,
        date_format(payment.start_date, '%d-%m-%Y %H:%i') as start_date, currency.currency, payment.payment_option
        from payment
        inner join currency on
        payment.currency_id = currency.id
        inner join card on
        payment.sender_account_id = card.account_id
        where card.id = ? and payment.payment_option = 'change_currency';`,
        [req.query.cardId],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getTransfersHistory', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select payment.commission_amount, payment.debited_amount, payment.status,
        date_format(payment.start_date, '%d-%m-%Y %H:%i') as start_date, currency.currency, payment.payment_option
        from payment
        inner join currency on
        payment.currency_id = currency.id
        inner join card on
        payment.sender_account_id = card.account_id
        where card.id = ? and payment.payment_option != 'change_currency';`,
        [req.query.cardId],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

// Маршрут для страницы с информацией о карте
app.get('/CardInfo/:cardId', (req, res) => {
    const cardId = req.params.cardId;

    if(req.session.role === 'employee') {
        res.redirect('/EmployeeHomePage');
        return;
    }

    // Проверяем, авторизован ли пользователь
    const url = '/CardInfo.html?' + querystring.stringify({ cardId: cardId });
    (req.session.username) ?
                            res.redirect(url)
                            :
                            res.redirect('/SignIn');
});

app.get('/getCardData', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select date_format(card.valid_until, '%m/%y') as valid_until, card.number as card_number, account.number as account_number, account.balance, currency.currency
        from card
        inner join account
        on account.id = card.account_id
        inner join currency
        on currency.id = account.currency_id
        WHERE card.id = ?;`,
        [req.query.cardId],
        (error, result) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(result);
        }
    );
});

// Маршрут для обработки запросов на /getClientData
app.get('/getClientData', (req, res) => {
    // Получаем имя пользователя из запроса
    const username = req.query.username;

    // Выполняем запрос к базе данных
    connection.query(
        `SELECT account.number AS account_number, account.balance, currency.currency
         FROM account
         INNER JOIN currency ON account.currency_id = currency.id
         INNER JOIN user ON user.id = account.user_id
         WHERE user.username = ?`,
        [username],
        (error, results, fields) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getBankingName', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select banking_service.name
        from banking_service
        where banking_service.id = ?`,
        [req.query.banking_id],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.send('500');
                return;
            }

            if (results.length === 0) {
                console.error('Услуги с указанным кодом не найдено!');
                res.send('404');
                return;
            }

            // Отправляем результаты клиенту
            res.send(results[0].name);
            // console.log(results);
        }
    );
});

app.get('/getClientCardsInfo', (req, res) => {
    // Получаем имя пользователя из запроса
    const username = req.query.username;

    // Выполняем запрос к базе данных
    connection.query(
        `select card.id as card_id, card.number as card_number, account.balance, currency.currency
        from card
        inner join account on
        account.id = card.account_id
        inner join currency on
        currency.id = account.currency_id
        inner join user on user.id = account.user_id
        where user.username = ?`,
        [username],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getClients', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select
            client.user_id,
            client.last_name,
            client.first_name,
            client.middle_name
        from client;`,
        [ ],
        (error, results) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }
            
            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getAccounts', (req, res) => {
    // Выполняем запрос к базе данных
    connection.query(
        `select account.number as account_number
        from account
        where account.user_id = ?;`,
        [req.query.client_id],
        (error, results, fields) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.status(500).send('Ошибка выполнения запроса');
                return;
            }

            // Отправляем результаты клиенту
            res.send(results);
            // console.log(results);
        }
    );
});

app.get('/getPayments', async (req, res) => {
    connection.query(
        `select date_format(payment.start_date, '%y.%m.%d %H:%i:%s') as date, payment.recipient_account_id,
        payment.payment_option, payment.debited_amount, currency.currency
        from payment
        join currency on
        currency.id = payment.currency_id
        join account on
        account.id = payment.sender_account_id
        where account.user_id = ?;`,
        [req.query.user_id],
        (error, result) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.send(null);
            } else {
                res.send(result);
            }
        }
    );
});

//////////////////////////
// functions to get data from database
/////////////////////////
async function getUserAccountIdByAccountNumber(account_number) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT account.id
            FROM account
            WHERE account.number = ?`,
            [account_number],
            (error, result) => {
                if (error || result.length === 0) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(null);
                } else {
                    resolve(result[0].id);
                }
            }
        );
    });
}

function getUserAccountIdByFullNameCurrencyId(last_name, first_name, middle_name, currency_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT account.id
            FROM account
            INNER JOIN client ON client.user_id = account.user_id
            WHERE client.last_name = ? AND client.first_name = ? AND client.middle_name = ? AND account.currency_id = ?;`,
            [last_name, first_name, middle_name, currency_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result.length === 0 ? null : result[0].id);
                    // resolve(result[0].id);
                }
            }
        );
    });
}

async function getAccountBalanceByAccountId(account_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select account.balance
            from account
            where account.id = ?;`,
            [account_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(null);
                    return;
                } 
                resolve(result[0].balance);
                return;
            }
        );
    });
}

async function clientExistsByFullName(last_name, first_name, middle_name) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT 1
            FROM client
            WHERE client.last_name = ? AND client.first_name = ? AND client.middle_name = ?;`,
            [last_name, first_name, middle_name],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                    return;
                } 
                resolve(result.length === 0 ? false : true);
                return;
            }
        );
    });
}

async function createPayment(commission_amount, debited_amount, credited_amount, status, currency_id,
                             sender_account_id, recipient_account_id, sender_account_balance,
                             recipient_account_balance, payment_option)
{
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        connection.query(
            `INSERT INTO
            payment(commission_amount, debited_amount, credited_amount, status,
                    currency_id, start_date, sender_account_id, recipient_account_id,
                    sender_account_balance_before, recipient_account_balance_before, payment_option)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [commission_amount, debited_amount, credited_amount, status, currency_id,
             formattedDate, sender_account_id, recipient_account_id,
             sender_account_balance, recipient_account_balance, payment_option],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

function getUserBalanceByAccountIdCurrencyId(account_id, currency_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT account.balance
            FROM account
            INNER JOIN currency ON currency.id = ?
            WHERE account.id = ?;`,
            [currency_id, account_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    if (result.length > 0) {
                        resolve(result[0].balance);
                    } else {
                        resolve(0); // Если счет не найден, возвращаем 0
                    }
                }
            }
        );
    });
}

function getUserBalanceByUserAccountIdCurrencyId(sender_account_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT account.balance
            FROM account
            WHERE account.id = ?;`,
            [sender_account_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    if (result.length > 0) {
                        resolve(result[0].balance);
                    } else {
                        resolve(null); // Если счет не найден, возвращаем 0
                    }
                }
            }
        );
    });
}

async function getCurrencyIdByCurrencyName(currency) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select currency.id as currency_id
            from currency
            where currency.currency = ?`,
            [currency],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                    console.log('error');
                } else {
                    // console.log(result[0]);
                    resolve(result[0] ? result[0].currency_id : null);
                }
            }
        );
    });
}

function createTransaction(payment_id, status) {
    return new Promise((resolve, reject) => {
        // Get the current date and time
        const currentDate = new Date(); 

        // Format the date to YYYY-MM-DD HH:MM:SS format
        const formatted_currenct_date = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        connection.query(
            `INSERT INTO transaction(payment_id, status, start_date)
            VALUES(?, ?, ?);`,
            [payment_id, status, formatted_currenct_date],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

async function setPaymentStatus(payment_id, status) {
    return new Promise((resolve, reject) => {
        connection.query(
            `update payment
            set payment.status = ?
            where payment.id = ?;`,
            [status, payment_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result.id); // Assuming you want to resolve with the query result
                }
            }
        );
    });
}

async function setTransactionStatus(transaction_id, status) {
    try {
        // Get the current date and time
        const currentDate = new Date(); 

        // Format the date to YYYY-MM-DD HH:MM:SS format
        const formatted_currenct_date = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        await new Promise((resolve, reject) => {
            connection.query(
                `UPDATE transaction
                SET transaction.status = ?, transaction.end_date = ?
                WHERE transaction.id = ?;`,
                [status, formatted_currenct_date, transaction_id],
                (error, result) => {
                    if (error) {
                        console.error('Ошибка выполнения запроса:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    } catch (error) {
        console.error('Ошибка при установке статуса транзакции:', error);
        throw error;
    }
}

async function transferMoney(transfer_amount, commission, recipient_account_id, sender_account_id, recipient_account_balance, sender_account_balance) {
    try {
        // Вычисляем новые значения балансов
        let updatedSenderBalance = sender_account_balance - transfer_amount - commission;
        let updatedRecipientBalance = recipient_account_balance + transfer_amount;

        // Обновляем баланс получателя
        await updateAccountBalance(updatedRecipientBalance, recipient_account_id);

        // Обновляем баланс отправителя
        await updateAccountBalance(updatedSenderBalance, sender_account_id);

        return { updatedRecipientBalance, updatedSenderBalance };
    } catch (error) {
        console.error('Ошибка при переводе средств:', error);
        return null;
    }
}

async function updateAccountBalance(newBalance, accountId) {
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE account
            SET account.balance = ?
            WHERE account.id = ?;`,
            [newBalance, accountId],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при обновлении баланса счета:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

async function getSenderAccountBalanceBeforeFailByPaymentId(payment_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select payment.sender_account_balance_before
            from payment
            where payment.id = ?;`,
            [payment_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при обновлении баланса счета:', error);
                    reject(error);
                } else {
                    if (result.length > 0 && result[0].sender_account_balance_before !== undefined) {
                        resolve(result[0].sender_account_balance_before);
                    } else {
                        resolve(null); // Handle case when result is empty or property is undefined
                    }
                }
            }
        );
    });
}


async function getRecipientAccountBalanceBeforeFailByAccountId(payment_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select payment.recipient_account_balance_before
            from payment
            where payment.id = ?;`,
            [payment_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при обновлении баланса счета:', error);
                    reject(error);
                } else {
                    resolve(result[0].recipient_account_balance_before);
                }
            }
        );
    });
}

async function setClientAccountBalanceByAccountId(account_balance, account_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE account
            SET account.balance = ?
            WHERE account.id = ?;`,
            [account_balance, account_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при обновлении баланса счета:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
}

async function clientExistsByAccountNumber(account_number) {    
    return new Promise((resolve, reject) => {
        connection.query(
            `select 1
            from account
            where account.number = ?;`,
            [account_number],
            (error, result) => {
                if (error) {
                    console.error('Нет такого клиента:', error);
                    reject(error);
                    return;
                }
                resolve (result.length === 0 ? false : true);
                return;
            }
        );
    });
}

async function getUserAccountIdByAccountNumberCurrencyId(account_number, currency_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select account.id
            from account
            inner join currency on
            currency.id = account.currency_id
            where account.number = ? and currency.id = ?`,
            [account_number, currency_id],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при обновлении баланса счета:', error);
                    reject(error);
                    return;
                }
                resolve(result[0] ? result[0].id : null); // Handle empty result
            }
        );
    });
}

async function operationExistsByOperationCode(operation_code) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select 1
            from banking_service
            where banking_service.id = ?`,
            [operation_code],
            (error, result) => {
                if (error) {
                    console.error('Ошибка при обновлении баланса счета:', error);
                    reject(error);
                    return false;
                }
                resolve(result.length !== 0 ? true : false); // Handle empty result
            }
        );
    });
}

async function createPaymentForBankingService(commission, transfer_amount, credited_amount,
                                            status, currency_id, sender_account_id, recipient_account_id,
                                            sender_account_balance, payment_option)
{
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        connection.query(
            `INSERT INTO
            payment(commission_amount, debited_amount, credited_amount, status,
                    currency_id, start_date, sender_account_id, recipient_account_id,
                    sender_account_balance_before, payment_option)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [commission, transfer_amount, credited_amount, status, currency_id,
             formattedDate, sender_account_id, recipient_account_id,
             sender_account_balance, payment_option],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

async function getCurrencyIdByAccountNumber(account) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        connection.query(
            `select currency.id
            from currency
            inner join account on
            account.currency_id = currency.id
            where account.number = ?;`,
            [account],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result[0].id);
                }
            }
        );
    });
}

async function getUserIdByUsername(username) {
    return new Promise((resolve, reject) => {
        connection.query(
            `select user.id as user_id
            from user
            where user.username = ?;`,
            [username],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                    return;
                }
                (result.length === 0 || !result) ? resolve(null)
                                    : resolve(result[0].user_id);
            }
        );
    });
}

// // Функция для создания нового аккаунта
async function createNewAccountByUserIdCurrencyId(user_id, currency_id) {
    let accountNumber = generateRandomAccountNumber();
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO account(number, user_id, currency_id, balance) VALUES (?, ?, ?, ?);`,
            [accountNumber, user_id, currency_id, 0],
            (error, result) => {
                if (error) {
                    console.error('Ошибка выполнения запроса:', error);
                    reject(error);
                } else {
                    resolve(result.insertId);
                }
            }
        );
    });
}

function generateRandomAccountNumber() {
    let randomNumber = '';
    for (let i = 0; i < 24; i++) {
        randomNumber += Math.floor(Math.random() * 10);
    }
    return randomNumber.toString();
}

function getRandomCardNumber() {
    let randomNumber = '';
    for (let i = 0; i < 16; i++) {
        randomNumber += Math.floor(Math.random() * 10);
    }
    return randomNumber.toString();
}

/////////////////////////


app.post('/TransferToBankClient', async (req, res) => {
    try {
        let commission = parseFloat(req.body.commission);
        let transfer_amount = parseFloat(req.body.transfer_amount);
        let sender_account_number = req.body.sender_account_number;
        let currency_id = await getCurrencyIdByCurrencyName(req.body.currency);

        if (currency_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        
        let sender_account_id = await getUserAccountIdByAccountNumber(sender_account_number);

        if (sender_account_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        let fullname = req.body.reciever_name.split(' ');

        let last_name = fullname[0];
        let first_name = fullname[1];
        let middle_name = fullname[2];

        if(await clientExistsByFullName(last_name, first_name, middle_name) === false) {
            res.send("Пользователь с таким именем не найден!");
            return;
        };
        
        let recipient_account_id = await getUserAccountIdByFullNameCurrencyId(last_name, first_name, middle_name, currency_id);
        
        // check if recipient has an account with sender's currency
        if (recipient_account_id === null) {
            res.send("У получателя нет счета для отправляемой валюты!");
            return;
        }


        let sender_account_balance = parseFloat(await getUserBalanceByUserAccountIdCurrencyId(sender_account_id));

        if (sender_account_balance === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        // check if there are insufficient funds in the sender's account
        if (sender_account_balance < (transfer_amount + commission)) {
            res.send('На вашем балансе недостаточно средств');
            return;
        }


        let recipient_account_balance = parseFloat(await getUserBalanceByAccountIdCurrencyId(recipient_account_id, currency_id));

        if (recipient_account_balance === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }


        let payment_id = await createPayment(commission, transfer_amount + commission, transfer_amount,
                                            'started', currency_id, sender_account_id, recipient_account_id,
                                            sender_account_balance, recipient_account_balance, 'bank_client');

        if (payment_id === null) {
            res.send("Ошибка при обращении к базе данных!");

            await setPaymentStatus(payment_id, 'failed');
            return;
        }


        let transaction_id = await createTransaction(payment_id, 'started');

        if (transaction_id === null) {
            res.send("Ошибка при обращении к базе данных!");

            await setPaymentStatus(payment_id, 'failed');
            await setTransactionStatus(transaction_id, 'failed');
            return;
        }


        if(await transferMoney(transfer_amount, commission, recipient_account_id, sender_account_id, recipient_account_balance, sender_account_balance) !== null) {
            await setPaymentStatus(payment_id, 'successful');
            await setTransactionStatus(transaction_id, 'successful');

            res.send("Средства успешно отправлены!");    
            return;
        }

        let sender_account_balance_before = parseFloat(await getSenderAccountBalanceBeforeFailByPaymentId(payment_id));
        let recipient_account_balance_before = parseFloat(await getRecipientAccountBalanceBeforeFailByAccountId(payment_id));

        await setClientAccountBalanceByAccountId(sender_account_balance_before, sender_account_id);
        await setClientAccountBalanceByAccountId(recipient_account_balance_before, recipient_account_id);

        await setPaymentStatus(payment_id, 'failed');
        await setTransactionStatus(transaction_id, 'failed');

        res.send("Не получилось перевести средства");
    } catch (error) {
        let sender_account_balance_before = parseFloat(await getSenderAccountBalanceBeforeFailByPaymentId(payment_id));
        let recipient_account_balance_before = parseFloat(await getRecipientAccountBalanceBeforeFailByAccountId(payment_id));

        await setClientAccountBalanceByAccountId(sender_account_balance_before, sender_account_id);
        await setClientAccountBalanceByAccountId(recipient_account_balance_before, recipient_account_id);

        await setPaymentStatus(payment_id, 'failed');
        await setTransactionStatus(transaction_id, 'failed');

        console.error('Ошибка:', error);
        res.send("Произошла ошибка при выполнении операции!");
    }
});

app.post('/TransferByAccountNumber', async (req, res) => {
    try {
        let reciever_account_number = req.body.reciever_account_number;
        let sender_account_number = req.body.sender_account_number;
        let commission = parseFloat(req.body.commission);
        let transfer_amount = parseFloat(req.body.transfer_amount);
        let currency_id = await getCurrencyIdByCurrencyName(req.body.currency);

        if (currency_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        
        let sender_account_id = await getUserAccountIdByAccountNumber(sender_account_number);

        if (sender_account_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        if ((await clientExistsByAccountNumber(reciever_account_number)) === false) {
            res.send("Пользователь с таким счетом не найден!");
            return;
        }
        
        let recipient_account_id = await getUserAccountIdByAccountNumberCurrencyId(reciever_account_number, currency_id);

        // check if recipient has an account with sender's currency
        if (recipient_account_id === null) {
            res.send("У получателя нет счета для отправляемой валюты!");
            return;
        }


        let sender_account_balance = parseFloat(await getUserBalanceByUserAccountIdCurrencyId(sender_account_id));

        if (sender_account_balance === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        // check if there are insufficient funds in the sender's account
        if (sender_account_balance < (transfer_amount + commission)) {
            res.send('На вашем балансе недостаточно средств');
            return;
        }


        let recipient_account_balance = parseFloat(await getUserBalanceByAccountIdCurrencyId(recipient_account_id, currency_id));

        if (recipient_account_balance === 0) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }


        let payment_id = await createPayment(commission, transfer_amount + commission, transfer_amount,
                                            'started', currency_id, sender_account_id, recipient_account_id,
                                            sender_account_balance, recipient_account_balance, 'account_number');

        if (payment_id === null) {
            res.send("Ошибка при обращении к базе данных!");

            await setPaymentStatus(payment_id, 'failed');
            return;
        }


        let transaction_id = await createTransaction(payment_id, 'started');

        if (transaction_id === null) {
            res.send("Ошибка при обращении к базе данных!");

            await setPaymentStatus(payment_id, 'failed');
            await setTransactionStatus(transaction_id, 'failed');
            return;
        }


        if(await transferMoney(transfer_amount, commission, recipient_account_id, sender_account_id, recipient_account_balance, sender_account_balance) !== null) {
            await setPaymentStatus(payment_id, 'successful');
            await setTransactionStatus(transaction_id, 'successful');

            res.send("Средства успешно отправлены!");    
            return;
        }

        let sender_account_balance_before = parseFloat(await getSenderAccountBalanceBeforeFailByPaymentId(payment_id));
        let recipient_account_balance_before = parseFloat(await getRecipientAccountBalanceBeforeFailByAccountId(payment_id));

        await setClientAccountBalanceByAccountId(sender_account_balance_before, sender_account_id);
        await setClientAccountBalanceByAccountId(recipient_account_balance_before, recipient_account_id);

        await setPaymentStatus(payment_id, 'failed');
        await setTransactionStatus(transaction_id, 'failed');

        res.send("Не получилось перевести средства");
    } catch (error) {
        let sender_account_balance_before = parseFloat(await getSenderAccountBalanceBeforeFailByPaymentId(payment_id));
        let recipient_account_balance_before = parseFloat(await getRecipientAccountBalanceBeforeFailByAccountId(payment_id));

        await setClientAccountBalanceByAccountId(sender_account_balance_before, sender_account_id);
        await setClientAccountBalanceByAccountId(recipient_account_balance_before, recipient_account_id);

        await setPaymentStatus(payment_id, 'failed');
        await setTransactionStatus(transaction_id, 'failed');

        console.error('Ошибка:', error);
        res.send("Произошла ошибка при выполнении операции!");
    }
});

app.post('/BankingTransfer', async (req, res) => {
    try {
        let operation_code = parseFloat(req.body.operation_code);
        let sender_account_number = req.body.sender_account_number;
        let commission = parseFloat(req.body.commission);
        let transfer_amount = parseFloat(req.body.transfer_amount);
        let currency_id = await getCurrencyIdByCurrencyName(req.body.currency);

        
        if (currency_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }
        
        let sender_account_id = await getUserAccountIdByAccountNumber(sender_account_number);

        if (sender_account_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        if (!(await operationExistsByOperationCode(operation_code))) {
            res.send("Такой операции не существует!");
            return;
        }

        let sender_account_balance = parseFloat(await getUserBalanceByUserAccountIdCurrencyId(sender_account_id));

        if (sender_account_balance === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        // check if there are insufficient funds in the sender's account
        if (sender_account_balance < (transfer_amount + commission)) {
            res.send('На вашем балансе недостаточно средств');
            return;
        }

        // Define variables for payment_id and transaction_id
        let payment_id, transaction_id;

        // Create payment
        try {
            payment_id = await createPaymentForBankingService(commission, transfer_amount + commission, transfer_amount,
                                            'started', currency_id, sender_account_id, operation_code,
                                            sender_account_balance, 'banking');
        } catch (paymentError) {
            console.error('Ошибка создания платежа:', paymentError);
            res.send("Ошибка при обращении к базе данных!");

            // Handle payment failure
            await setPaymentStatus(payment_id, 'failed');
            return;
        }

        // Create transaction
        try {
            transaction_id = await createTransaction(payment_id, 'started');
        } catch (transactionError) {
            console.error('Ошибка создания транзакции:', transactionError);
            res.send("Ошибка при обращении к базе данных!");

            // Handle transaction failure
            await setPaymentStatus(payment_id, 'failed');
            await setTransactionStatus(transaction_id, 'failed');
            return;
        }

        let updatedSenderBalance = sender_account_balance - transfer_amount - commission;

        // Обновляем баланс отправителя
        await updateAccountBalance(updatedSenderBalance, sender_account_id);
        
        // Set payment and transaction statuses to 'successful'
        await setPaymentStatus(payment_id, 'successful');
        await setTransactionStatus(transaction_id, 'successful');
        
        res.send("Средства успешно отправлены!");    
    } catch (error) {
        // Handle errors
        let sender_account_balance_before = parseFloat(await getSenderAccountBalanceBeforeFailByPaymentId(payment_id));
        await setClientAccountBalanceByAccountId(sender_account_balance_before, sender_account_id);
        
        await setPaymentStatus(payment_id, 'failed');
        await setTransactionStatus(transaction_id, 'failed');

        console.error('Ошибка:', error);
        res.send("Произошла ошибка при выполнении операции!");
    }
});

app.post('/changeCurrency', async (req, res) => {
    
    let payment_id, transaction_id;
    let sender_account_id, recipient_account_id;
    
    try {
        let commission = parseFloat(req.body.commission);
        let recieve_amount = parseFloat(req.body.recieve_amount);
        let send_amount = parseFloat(req.body.send_amount);
        let from_account = req.body.from_account;
        let to_account = req.body.to_account;
        let sender_amount = parseFloat(req.body.sender_amount);
        
        sender_account_id = await getUserAccountIdByAccountNumber(from_account);

        if (sender_account_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        let sender_account_balance = parseFloat(await getUserBalanceByUserAccountIdCurrencyId(sender_account_id));

        if (sender_account_balance === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        // check if there are insufficient funds in the sender's account
        if (sender_account_balance < sender_amount) {
            res.send('На вашем балансе недостаточно средств');
            return;
        }

        recipient_account_id = await getUserAccountIdByAccountNumber(to_account);

        if (recipient_account_id === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        let recipient_account_balance = parseFloat(await getUserBalanceByUserAccountIdCurrencyId(recipient_account_id));

        if (recipient_account_balance === null) {
            res.send("Ошибка при обращении к базе данных!");
            return;
        }

        // Define variables for payment_id and transaction_id
        let currency_id = await getCurrencyIdByAccountNumber(from_account);

        // Create payment
        try {
            payment_id = await createPayment(commission, send_amount, recieve_amount,
                                            'started', currency_id, sender_account_id, recipient_account_id,
                                            sender_account_balance, recipient_account_balance, 'change_currency');
        } catch (paymentError) {
            console.error('Ошибка создания платежа:', paymentError);
            res.send("Ошибка при обращении к базе данных!");

            // Handle payment failure
            await setPaymentStatus(payment_id, 'failed');
            return;
        }

        // Create transaction
        try {
            transaction_id = await createTransaction(payment_id, 'started');
        } catch (transactionError) {
            console.error('Ошибка создания транзакции:', transactionError);
            res.send("Ошибка при обращении к базе данных!");

            // Handle transaction failure
            await setPaymentStatus(payment_id, 'failed');
            await setTransactionStatus(transaction_id, 'failed');
            return;
        }

        let updatedSenderBalance = sender_account_balance - sender_amount;
        let updatedRecipientBalance = recipient_account_balance + recieve_amount;

        // Обновляем баланс отправителя
        await updateAccountBalance(updatedSenderBalance, sender_account_id);
        await updateAccountBalance(updatedRecipientBalance, recipient_account_id);

        // Set payment and transaction statuses to 'successful'
        await setPaymentStatus(payment_id, 'successful');
        await setTransactionStatus(transaction_id, 'successful');

        res.send("Средства успешно конвертированы!");    
    } catch (error) {
        // Handle errors
        let sender_account_balance_before = parseFloat(await getSenderAccountBalanceBeforeFailByPaymentId(payment_id));
        await setClientAccountBalanceByAccountId(sender_account_balance_before, sender_account_id);

        let recipient_account_balance_before = parseFloat(await getRecipientAccountBalanceBeforeFailByAccountId(payment_id));
        await setClientAccountBalanceByAccountId(recipient_account_balance_before, recipient_account_id);
        
        await setPaymentStatus(payment_id, 'failed');
        await setTransactionStatus(transaction_id, 'failed');

        console.error('Ошибка:', error);
        res.send("Произошла ошибка при выполнении операции!");
    }
});




// Маршрут для обработки POST-запроса на создание нового аккаунта
app.post('/createNewAccount', async (req, res) => {
    let currency_id = await getCurrencyIdByCurrencyName(req.body.currency);
    let user_id = await getUserIdByUsername(req.body.username);

    try {
        let accountId = await createNewAccountByUserIdCurrencyId(user_id, currency_id);
        
        (accountId !== null) ?
                            res.send("Счет успешно создан!")
                            :
                            res.send("Не удалось создать счет!");
    } catch (error) {
        console.error("Не удалось создать счет:", error);
        res.status(500).send("Не удалось создать счет!");
    }
});

app.post('/topUpAccount', async (req, res) => {
    let account_id = await getUserAccountIdByAccountNumber(req.body.account_number);
    let accountBalance = await getAccountBalanceByAccountId(account_id);
    let totalBalance = parseFloat(accountBalance) + parseFloat(req.body.amount);

    connection.query(
        `update account
        set account.balance = ?
        where account.id = ?;`,
        [totalBalance, account_id],
        (error, result) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.send('Не удалось пополнить баланс!');
            } else {
                res.send('Баланс успешно пополнен!');
            }
        }
    );
});

app.post('/createAccount', async (req, res) => {
    let currency_id = await getCurrencyIdByCurrencyName(req.body.currency);
    
    try {
        let accountId = await createNewAccountByUserIdCurrencyId(req.body.client_id, currency_id);
        
        (accountId !== null) ?
                            res.send("Счет успешно создан!")
                            :
                            res.send("Не удалось создать счет!");
    } catch (error) {
        console.error("Не удалось создать счет:", error);
        res.status(500).send("Не удалось создать счет!");
    }
});

app.post('/createCard', async (req, res) => {
    var currentDate = new Date(); // Получаем текущую дату
    var valid_until = new Date(currentDate.getFullYear() + 4, currentDate.getMonth(), currentDate.getDate()); // Добавляем 4 года

    var account_id = await getUserAccountIdByAccountNumber(req.body.account_number);

    connection.query(
        `INSERT INTO card(number, account_id, valid_until) VALUES (?, ?, ?);`,
        [getRandomCardNumber(), account_id, valid_until],
        (error, result) => {
            if (error) {
                console.error('Ошибка выполнения запроса:', error);
                res.send('Не удалось создать карту!');
            } else {
                res.send('Карта успешно создана!');
            }
        }
    );
});

app.post('/SignOut', (req, res) => {
    req.session.destroy();
    res.send('200');
});

// Обработчик POST запроса для входа пользователя
app.post('/SignIn', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await loginUser(username, customHash(password));

        if (user.length === 0 || !user) {
            console.log('Неверное имя пользователя или пароль.');
            res.send('400');
            return;
        }
        console.log('Успешный вход. Перенаправление...');
        
        // Сохраняем логин пользователя в сессии
        req.session.username = username;
        
        // redirecting...
        switch(user[0].role) {
            case "client" : {
                req.session.role = 'client';
                res.send('/ClientHomePage');
                break;
            }
            case 'employee' : {
                req.session.role = 'employee';
                res.send('/EmployeeHomePage');
                break;
            }
            default : {
                res.send('/SignUp');
                break;
            }
        }
    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        res.send('500');
    }
});

app.post('/SignUp', async (req, res) => {
    const {
        first_name,
        last_name,
        middlename,
        birth_date,
        username,
        password,
        special_code_length
    } = req.body;

    try{
        const role = await registerUser(first_name, last_name, middlename, birth_date, username, password, special_code_length);

        if (!role) {
            console.log('Неверное имя пользователя или пароль.');
            res.status(400).send('Неверное имя пользователя или пароль');
            return;
        }
        console.log('Успешная регистрация. Перенаправление...');
        
        // Сохраняем логин пользователя в сессии
        req.session.username = username;

        // redirecting...
        switch(role) {
            case "client" : {
                req.session.role = 'client'
                res.send('/ClientHomePage');
                break;
            }
            case 'employee' : {
                req.session.role = 'employee'
                res.send('/EmployeeHomePage');
                break;
            }
            default : {
                res.send('/SignUp');
                break;
            }
        }
    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        res.status(500).send(error);
    }

});



// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});