// Get references to the HTML elements
const ticketForm = document.getElementById('ticket-form');
const quantityInput = document.getElementById('ticket-quantity');
const fullNameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const paymentStatus = document.getElementById('payment-status');
const cancelButton = document.getElementById('cancel-button');
const ticketIdDisplay = document.getElementById('ticket-id');
const paymentLinkDisplay = document.getElementById('payment-link');
const qrCodeContainer = document.getElementById('qr-code-container');

// Event listener for ticket purchase form submission
ticketForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = fullNameInput.value;
    const email = emailInput.value;
    const ticketQuantity = parseInt(quantityInput.value, 10);

    if (fullName && email && ticketQuantity > 0) {
        // Create payment
        createPayment(fullName, email, ticketQuantity);
    } else {
        alert('Please provide all required information.');
    }
});

// Function to create payment
function createPayment(fullName, email, ticketQuantity) {
    fetch('/create-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, ticketQuantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Display payment link to user
            paymentLinkDisplay.textContent = `Go to the following link to complete your payment: ${data.paymentLink}`;
            paymentLinkDisplay.style.display = 'block';

            // Save ticket ID for later verification
            const ticketId = data.ticketId;
            ticketIdDisplay.textContent = `Ticket ID: ${ticketId}`;
            ticketIdDisplay.style.display = 'block';

            // Show QR code
            generateQRCode(ticketId);

            // Display status message
            paymentStatus.textContent = 'Please check your email for verification and complete the payment.';
            paymentStatus.style.display = 'block';

            // Enable cancel button
            cancelButton.style.display = 'block';
        } else {
            alert('Payment initialization failed.');
        }
    })
    .catch(error => {
        console.error('Error creating payment:', error);
        alert('Error creating payment.');
    });
}

// Function to generate QR code for ticket
function generateQRCode(ticketId) {
    fetch(`/generate-qr-code?ticketId=${ticketId}`)
        .then(response => response.json())
        .then(data => {
            if (data.qrCodeDataUrl) {
                const qrCodeImg = document.createElement('img');
                qrCodeImg.src = data.qrCodeDataUrl;
                qrCodeImg.alt = 'Ticket QR Code';
                qrCodeContainer.innerHTML = ''; // Clear previous QR code
                qrCodeContainer.appendChild(qrCodeImg);
                qrCodeContainer.style.display = 'block';
            } else {
                console.error('Error generating QR code');
            }
        })
        .catch(error => {
            console.error('Error fetching QR code:', error);
        });
}

// Function to cancel the ticket
cancelButton.addEventListener('click', () => {
    const ticketId = ticketIdDisplay.textContent.replace('Ticket ID: ', '');

    if (ticketId) {
        cancelTicket(ticketId);
    } else {
        alert('No ticket found to cancel.');
    }
});

// Function to cancel a ticket
function cancelTicket(ticketId) {
    fetch('/cancel-ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Update UI after cancelation
            paymentStatus.textContent = 'Your ticket has been canceled and refunded.';
            ticketIdDisplay.style.display = 'none';
            cancelButton.style.display = 'none';
        } else {
            alert('Error canceling ticket.');
        }
    })
    .catch(error => {
        console.error('Error canceling ticket:', error);
        alert('Error canceling ticket.');
    });
}

// CAPTCHA verification before submitting the form
function verifyCaptcha(captchaResponse) {
    fetch('/verify-captcha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ captchaResponse })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Captcha verified successfully');
        } else {
            console.log('Captcha verification failed');
        }
    })
    .catch(error => {
        console.error('Error verifying captcha:', error);
    });
}

// Function to handle ticket transfer
function transferTicket(ticketId, newOwnerEmail) {
    fetch('/transfer-ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketId, newOwnerEmail })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Ticket transferred successfully.');
        } else {
            alert('Error transferring ticket.');
        }
    })
    .catch(error => {
        console.error('Error transferring ticket:', error);
        alert('Error transferring ticket.');
    });
}

// Example to verify email on page load
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('ticketId');

    if (ticketId) {
        verifyEmail(ticketId);
    }
};

// Function to verify email
function verifyEmail(ticketId) {
    fetch(`/verify-email?ticketId=${ticketId}`)
    .then(response => response.text())
    .then(message => {
        alert(message);
    })
    .catch(error => {
        console.error('Error verifying email:', error);
        alert('Error verifying email.');
    });
}
