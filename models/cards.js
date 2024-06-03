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