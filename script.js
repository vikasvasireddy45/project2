document.addEventListener('DOMContentLoaded', () => {
    // --- Cart Variables & Elements ---
    const cart = []; // Array to store cart items { id, name, price, quantity }
    const cartCountSpan = document.getElementById('cart-count');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const proceedToOrderBtn = document.getElementById('proceed-to-order-btn');
    const emptyCartMessage = document.querySelector('.empty-cart-message');

    // --- Order Modal Variables & Elements ---
    const orderModalOverlay = document.getElementById('order-modal-overlay');
    const closeOrderModalBtn = document.getElementById('close-order-modal-btn');
    const orderForm = document.getElementById('order-form');
    const modalOrderSummary = document.getElementById('modal-order-summary');
    const modalCartTotal = document.getElementById('modal-cart-total');

    // --- Inquiry Modal Variables & Elements ---
    const inquiryModalOverlay = document.getElementById('inquiry-modal-overlay');
    const closeInquiryModalBtn = document.getElementById('close-inquiry-modal-btn');
    const inquiryForm = document.getElementById('inquiry-form');
    const inquiryProductNameSpan = document.getElementById('inquiry-product-name');

    // --- Toast Notification ---
    function showToast(message, duration = 3000) {
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // --- Cart Functions ---
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        emptyCartMessage.style.display = cart.length === 0 ? 'block' : 'none';
        proceedToOrderBtn.disabled = cart.length === 0; // Disable button if cart is empty
        if (cart.length === 0) {
            proceedToOrderBtn.classList.remove('btn-primary');
            proceedToOrderBtn.classList.add('btn-secondary'); // Visual hint for disabled
        } else {
            proceedToOrderBtn.classList.add('btn-primary');
            proceedToOrderBtn.classList.remove('btn-secondary');
        }
    }

    function calculateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalSpan.textContent = `₹ ${total.toFixed(2)}`;
        modalCartTotal.textContent = `₹ ${total.toFixed(2)}`;
        return total;
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = ''; // Clear previous items
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <img src="images/${item.id.includes('egg') ? 'egg_pack_12.png' : 'placeholder.png'}" alt="${item.name}"> <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹ ${item.price.toFixed(2)} x 
                            <div class="item-quantity-controls">
                                <button data-id="${item.id}" data-action="decrease">-</button>
                                <span>${item.quantity}</span>
                                <button data-id="${item.id}" data-action="increase">+</button>
                            </div>
                        </p>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
        }
        updateCartCount();
        calculateCartTotal();
    }

    function addItemToCart(productId, productName, productPrice) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
        }
        renderCartItems();
        showToast(`${productName} added to cart!`);
    }

    function updateCartItemQuantity(productId, action) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            if (action === 'increase') {
                cart[itemIndex].quantity++;
            } else if (action === 'decrease') {
                cart[itemIndex].quantity--;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
                }
            }
        }
        renderCartItems();
    }

    function removeItemFromCart(productId) {
        const initialLength = cart.length;
        cart = cart.filter(item => item.id !== productId);
        if (cart.length < initialLength) {
            showToast('Item removed from cart.');
        }
        renderCartItems();
    }

    // --- Event Listeners for Cart Actions ---
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const productName = e.target.dataset.name;
            const productPrice = parseFloat(e.target.dataset.price);
            addItemToCart(productId, productName, productPrice);
        });
    });

    // Delegated event listener for quantity controls and remove button
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-quantity-controls')) {
            // Handle clicks on the quantity control container itself, not the buttons
            return;
        }
        const productId = e.target.dataset.id;
        if (e.target.dataset.action) {
            updateCartItemQuantity(productId, e.target.dataset.action);
        } else if (e.target.classList.contains('remove-item-btn')) {
            removeItemFromCart(productId);
        }
    });

    openCartBtn.addEventListener('click', () => {
        cartOverlay.classList.add('active');
        renderCartItems(); // Re-render to ensure latest state
    });

    closeCartBtn.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
    });

    // Close cart when clicking outside the sidebar
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove('active');
        }
    });

    // --- Order Modal Functions ---
    proceedToOrderBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Your cart is empty. Please add items first.", 4000);
            return;
        }
        cartOverlay.classList.remove('active'); // Close cart sidebar
        orderModalOverlay.classList.add('active');
        renderOrderSummaryModal();
    });

    closeOrderModalBtn.addEventListener('click', () => {
        orderModalOverlay.classList.remove('active');
    });

    orderModalOverlay.addEventListener('click', (e) => {
        if (e.target === orderModalOverlay) {
            orderModalOverlay.classList.remove('active');
        }
    });

    function renderOrderSummaryModal() {
        modalOrderSummary.innerHTML = '';
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>₹ ${(item.price * item.quantity).toFixed(2)}</span>
            `;
            modalOrderSummary.appendChild(itemDiv);
        });
        calculateCartTotal(); // Ensure total is updated
    }

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerAddress = document.getElementById('customer-address').value;
        const deliveryLocation = document.getElementById('delivery-location').value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // Basic validation
        if (!customerName || !customerPhone || !customerAddress || !deliveryLocation) {
            showToast("Please fill in all required delivery details.", 4000);
            return;
        }

        // Simulate order processing
        const orderDetails = {
            customer: {
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
                location: deliveryLocation
            },
            items: cart,
            total: calculateCartTotal(),
            paymentMethod: paymentMethod,
            timestamp: new Date().toLocaleString()
        };

        console.log("Simulating Order Placement:", orderDetails); // Log to console

        // --- Simulated Backend Interaction ---
        // In a real application, you would send `orderDetails` to your server here.
        // fetch('/api/place-order', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(orderDetails)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         showToast("Order placed successfully!", 5000);
        //         // Clear cart, close modal, redirect or show confirmation
        //         cart.length = 0; // Clear cart
        //         renderCartItems();
        //         orderModalOverlay.classList.remove('active');
        //         orderForm.reset();
        //     } else {
        //         showToast(`Order failed: ${data.message}`, 5000);
        //     }
        // })
        // .catch(error => {
        //     console.error("Error placing order:", error);
        //     showToast("An error occurred while placing your order. Please try again.", 5000);
        // });

        // For this demo, just show success and reset
        showToast(`Order placed successfully! Payment via ${paymentMethod === 'online' ? 'Online Gateway (simulated)' : 'Cash on Delivery'}.`, 6000);

        // Clear cart and form after simulated order
        cart.length = 0; // Clear the cart
        renderCartItems();
        orderForm.reset(); // Clear the form fields
        orderModalOverlay.classList.remove('active'); // Close the modal
    });

    // --- Inquiry Modal Functions (for poultry "Enquire Now") ---
    document.querySelectorAll('.enquire-now-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.dataset.productName;
            inquiryProductNameSpan.textContent = productName;
            inquiryForm.reset(); // Clear form on opening
            inquiryModalOverlay.classList.add('active');
        });
    });

    closeInquiryModalBtn.addEventListener('click', () => {
        inquiryModalOverlay.classList.remove('active');
    });

    inquiryModalOverlay.addEventListener('click', (e) => {
        if (e.target === inquiryModalOverlay) {
            inquiryModalOverlay.classList.remove('active');
        }
    });

    inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        const inquiryName = document.getElementById('inquiry-name').value;
        const inquiryEmail = document.getElementById('inquiry-email').value;
        const inquiryPhone = document.getElementById('inquiry-phone').value;
        const inquiryDetails = document.getElementById('inquiry-details').value;
        const productName = inquiryProductNameSpan.textContent; // Get product name from the modal title

        // Basic validation
        if (!inquiryName || !inquiryEmail || !inquiryPhone || !inquiryDetails) {
            showToast("Please fill in all required inquiry details.", 4000);
            return;
        }

        const inquiryData = {
            product: productName,
            customer: {
                name: inquiryName,
                email: inquiryEmail,
                phone: inquiryPhone
            },
            details: inquiryDetails,
            timestamp: new Date().toLocaleString()
        };

        console.log("Simulating Inquiry Submission:", inquiryData); // Log to console

        // --- Simulated Backend Interaction ---
        // In a real application, you would send `inquiryData` to your server here.
        // fetch('/api/submit-inquiry', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(inquiryData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         showToast("Your inquiry has been sent! We'll contact you shortly.", 5000);
        //         inquiryForm.reset();
        //         inquiryModalOverlay.classList.remove('active');
        //     } else {
        //         showToast(`Inquiry failed: ${data.message}`, 5000);
        //     }
        // })
        // .catch(error => {
        //     console.error("Error submitting inquiry:", error);
        //     showToast("An error occurred while sending your inquiry. Please try again.", 5000);
        // });

        // For this demo, just show success and reset
        showToast("Your inquiry has been sent! We'll contact you shortly.", 5000);
        inquiryForm.reset(); // Clear the form fields
        inquiryModalOverlay.classList.remove('active'); // Close the modal
    });

    // --- General Contact Form (if different from inquiry) ---
    const generalContactForm = document.getElementById('contact-form'); // Assuming this is your contact form
    if (generalContactForm) {
        generalContactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const contactName = document.getElementById('contact-name').value;
            const contactEmail = document.getElementById('contact-email').value;
            const contactPhone = document.getElementById('contact-phone').value;
            const contactMessage = document.getElementById('contact-message').value;

            if (!contactName || !contactEmail || !contactMessage) {
                 showToast("Please fill in all required contact details.", 4000);
                return;
            }

            const contactData = {
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                message: contactMessage,
                timestamp: new Date().toLocaleString()
            };

            console.log("Simulating General Contact Form Submission:", contactData);
            showToast("Your message has been sent! We'll respond soon.", 5000);
            generalContactForm.reset();
        });
    }

    // --- Initial Load ---
    updateCartCount(); // Initialize cart count on page load
    renderCartItems(); // Render any initial items (if using local storage, not implemented here)
});