use saipis;


ALTER TABLE payment
ADD COLUMN currency_id int unsigned,
ADD CONSTRAINT payment_ibfk_1
    FOREIGN KEY (currency_id)
    REFERENCES currency(id);
    
select * from payment;


update payment
set payment.`status` = 'failed'
where payment.id = 1;



alter table payment
drop column currency;


select currency.id
from currency
inner join account on
account.currency_id = currency.id
where account.number = '123413241234123412341234';

select account.balance
from account
inner join user on
user.id = account.user_id
where user.id = 35 and account.currency_id = 1;


select account.id
from account
where account.number = '123413241234123412341234';


select account.id
from account
inner join client on
client.user_id = account.user_id
where client.last_name = 'Diablo' and client.first_name = 'Pablo' and client.middle_name = 'Duglaz' and account.currency_id = 1;



create table user (
	id int unsigned auto_increment primary key,
   username varchar(20) unique not null,
   password text not null,
   role enum('employee', 'client') not null
);

create table client (
	id int unsigned auto_increment primary key,
   user_id int unsigned not null,
   first_name varchar(25) not null,
   last_name varchar(25) not null,
   birth_date date not null,
   foreign key(user_id) references user(id) on update restrict on delete restrict
);

create table currency (
	id int unsigned auto_increment primary key,
	currency enum('BYN', 'USD', 'RUB')
);

create table account (
	id int unsigned auto_increment primary key,
   amount decimal(12, 2) not null,
   number varchar(24) unique not null,
   client_id int unsigned not null,
   currency_id int unsigned not null,
	foreign key(client_id) references client(id) on update restrict on delete restrict,
   foreign key(currency_id) references currency(id) on update restrict on delete restrict
);

create table card (
	id int unsigned auto_increment primary key,
   number varchar(16) unique not null,
	account_id int unsigned not null,
   valid_until date not null,
   eligible_until date not null,
	foreign key(account_id) references account(id) on update restrict on delete restrict
);

create table payment (
	id int unsigned auto_increment primary key,
	commission_amount decimal(12, 2) not null,
   debited_amount decimal(12, 2) not null,
   credited_amount decimal(12, 2) not null,
	status enum('started', 'successful', 'failed') not null,
   start_date datetime null,
   sender_account_id int unsigned not null,
   recipient_account_id int unsigned null,
   recipient_account_number varchar(24) null,
	foreign key(sender_account_id) references account(id) on update restrict on delete restrict,
	foreign key(recipient_account_id) references account(id) on update restrict on delete restrict
);

create table transaction (
	id int unsigned auto_increment primary key,
	payment_id int unsigned not null,
   status enum('started', 'successful', 'failed') not null,
	start_date datetime not null,
	end_date datetime null,
	foreign key(payment_id) references payment(id) on update restrict on delete restrict
);

create table banking_service (
	id int unsigned auto_increment primary key,
   name varchar(50) not null,
   account_number varchar(16) unique not null
);

create table commission (
	id int unsigned auto_increment primary key,
	percent decimal(4, 2) not null,
	from_amount decimal(12, 2) null,
   to_amount decimal(12, 2) null,
	type enum('internal', 'external', 'banking', 'foreign', 'change', 'card_registration', 'card_service') not null,
	unique (percent, from_amount, to_amount, type)
);

/*create table employee (
	id int unsigned auto_increment primary key,
	user_id int unsigned,
	foreign key(user_id) references user(id) on update restrict on delete restrict
);*/