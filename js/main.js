// Modern E-commerce JavaScript
class ECommerceApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.user = null;
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
        this.loadUser();
        this.initializeComponents();
    }

    // Event Bindings
    bindEvents() {
        // Cart events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart')) {
                e.preventDefault();
                this.addToCart(e.target);
            }
            
            if (e.target.matches('.remove-from-cart')) {
                e.preventDefault();
                this.removeFromCart(e.target);
            }
            
            if (e.target.matches('.update-quantity')) {
                this.updateQuantity(e.target);
            }
            
            if (e.target.matches('.wishlist-btn')) {
                e.preventDefault();
                this.toggleWishlist(e.target);
            }
            
            if (e.target.matches('.quick-view')) {
                e.preventDefault();
                this.showQuickView(e.target);
            }
            
            if (e.target.matches('.modal-close, .modal-backdrop')) {
                this.closeModal();
            }
        });

        // Form events
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.ajax-form')) {
                e.preventDefault();
                this.submitForm(e.target);
            }
        });

        // Search functionality
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', this.toggleMobileMenu);
        }
    }

    // Cart Management
    addToCart(button) {
        const productId = button.dataset.productId;
        const productName = button.dataset.productName;
        const productPrice = parseFloat(button.dataset.productPrice);
        const productImage = button.dataset.productImage;
        const quantity = parseInt(button.dataset.quantity || 1);

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product added to cart!', 'success');
        this.animateCartIcon();

        // Send to server if user is logged in
        if (this.user) {
            this.syncCartToServer();
        }
    }

    removeFromCart(button) {
        const productId = button.dataset.productId;
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        this.showNotification('Product removed from cart', 'info');

        if (this.user) {
            this.syncCartToServer();
        }
    }

    updateQuantity(input) {
        const productId = input.dataset.productId;
        const newQuantity = parseInt(input.value);
        
        if (newQuantity <= 0) {
            this.removeFromCart({dataset: {productId}});
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'flex' : 'none';
        });
    }

    updateCartDisplay() {
        const cartContainer = document.querySelector('#cart-items');
        const cartTotal = document.querySelector('#cart-total');
        
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<p class="text-center">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '$0.00';
            return;
        }

        const cartHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="uploads/${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="app.changeQuantity('${item.id}', -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" 
                               class="quantity-input update-quantity" data-product-id="${item.id}">
                        <button class="quantity-btn" onclick="app.changeQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm remove-from-cart" data-product-id="${item.id}">
                    Remove
                </button>
            </div>
        `).join('');

        cartContainer.innerHTML = cartHTML;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    changeQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart({dataset: {productId}});
            } else {
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartCount();
            }
        }
    }

    // Wishlist Management
    toggleWishlist(button) {
        const productId = button.dataset.productId;
        const productName = button.dataset.productName;
        const productPrice = parseFloat(button.dataset.productPrice);
        const productImage = button.dataset.productImage;

        const existingIndex = this.wishlist.findIndex(item => item.id === productId);
        
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            button.classList.remove('active');
            this.showNotification('Removed from wishlist', 'info');
        } else {
            this.wishlist.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });
            button.classList.add('active');
            this.showNotification('Added to wishlist!', 'success');
        }

        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }

    // Search Functionality
    handleSearch(e) {
        const query = e.target.value.trim();
        if (query.length < 2) return;

        this.performSearch(query);
    }

    async performSearch(query) {
        try {
            const response = await fetch(`php/search.php?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results) {
        const searchResults = document.querySelector('#search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<p>No products found</p>';
            return;
        }

        const resultsHTML = results.map(product => `
            <div class="search-result-item">
                <img src="uploads/${product.image}" alt="${product.name}">
                <div>
                    <h5>${product.name}</h5>
                    <p class="price">$${product.price}</p>
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;
    }

    // Modal System
    showQuickView(button) {
        const productId = button.dataset.productId;
        this.loadProductDetails(productId);
    }

    async loadProductDetails(productId) {
        try {
            const response = await fetch(`php/get-product.php?id=${productId}`);
            const product = await response.json();
            
            if (product.error) {
                this.showNotification(product.error, 'error');
                return;
            }

            this.displayProductModal(product);
        } catch (error) {
            console.error('Error loading product:', error);
            this.showNotification('Error loading product details', 'error');
        }
    }

    displayProductModal(product) {
        const features = JSON.parse(product.features || '[]');
        const modalHTML = `
            <div class="modal active" id="product-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${product.name}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="grid grid-2">
                            <div>
                                <img src="uploads/${product.image}" alt="${product.name}" class="w-full">
                            </div>
                            <div>
                                <p class="mb-3">${product.description}</p>
                                <div class="price mb-3">
                                    ${product.sale_price ? 
                                        `<span class="price-old">$${product.price}</span>$${product.sale_price}` : 
                                        `$${product.price}`
                                    }
                                </div>
                                ${features.length > 0 ? `
                                    <ul class="mb-3">
                                        ${features.map(feature => `<li>${feature}</li>`).join('')}
                                    </ul>
                                ` : ''}
                                <div class="d-flex gap-2">
                                    <button class="btn btn-primary add-to-cart" 
                                            data-product-id="${product.id}"
                                            data-product-name="${product.name}"
                                            data-product-price="${product.sale_price || product.price}"
                                            data-product-image="${product.image}">
                                        Add to Cart
                                    </button>
                                    <button class="btn btn-outline wishlist-btn"
                                            data-product-id="${product.id}"
                                            data-product-name="${product.name}"
                                            data-product-price="${product.sale_price || product.price}"
                                            data-product-image="${product.image}">
                                        ♡ Wishlist
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeModal() {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
        }
    }

    // Form Submission
    async submitForm(form) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading"></span> Processing...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                if (result.redirect) {
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1000);
                }
                if (result.reload) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                this.showNotification(result.message, 'error');
                this.displayFormErrors(form, result.errors || {});
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('An error occurred. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    displayFormErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.form-error').forEach(error => error.remove());
        form.querySelectorAll('.form-control.error').forEach(input => {
            input.classList.remove('error');
        });

        // Display new errors
        Object.keys(errors).forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'form-error';
                errorDiv.textContent = errors[field];
                input.parentNode.appendChild(errorDiv);
            }
        });
    }

    // User Management
    async loadUser() {
        try {
            const response = await fetch('php/get-user.php');
            const result = await response.json();
            
            if (result.success) {
                this.user = result.user;
                this.syncCartFromServer();
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    async syncCartToServer() {
        if (!this.user) return;

        try {
            await fetch('php/sync-cart.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart: this.cart })
            });
        } catch (error) {
            console.error('Error syncing cart:', error);
        }
    }

    async syncCartFromServer() {
        if (!this.user) return;

        try {
            const response = await fetch('php/get-cart.php');
            const result = await response.json();
            
            if (result.success) {
                this.cart = result.cart;
                this.saveCart();
                this.updateCartCount();
                this.updateCartDisplay();
            }
        } catch (error) {
            console.error('Error syncing cart from server:', error);
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);

        // Close on click
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Animations
    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('animate-pulse');
            setTimeout(() => {
                cartIcon.classList.remove('animate-pulse');
            }, 1000);
        }
    }

    // Utilities
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('mobile-active');
        }
    }

    // Component Initialization
    initializeComponents() {
        this.initImageGallery();
        this.initPriceRangeSlider();
        this.initProductFilters();
        this.initLazyLoading();
    }

    initImageGallery() {
        const galleries = document.querySelectorAll('.image-gallery');
        galleries.forEach(gallery => {
            const thumbnails = gallery.querySelectorAll('.thumbnail');
            const mainImage = gallery.querySelector('.main-image');
            
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const newSrc = thumb.dataset.image;
                    if (mainImage && newSrc) {
                        mainImage.src = newSrc;
                        thumbnails.forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    }
                });
            });
        });
    }

    initPriceRangeSlider() {
        const priceSlider = document.querySelector('#price-range');
        if (priceSlider) {
            priceSlider.addEventListener('input', this.debounce(() => {
                this.filterProductsByPrice();
            }, 300));
        }
    }

    initProductFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                this.filterProductsByCategory(category);
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    filterProductsByCategory(category) {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const productCategory = product.dataset.category;
            if (category === 'all' || productCategory === category) {
                product.style.display = 'block';
                product.classList.add('fade-in');
            } else {
                product.style.display = 'none';
            }
        });
    }

    filterProductsByPrice() {
        const priceRange = document.querySelector('#price-range');
        const maxPrice = parseFloat(priceRange.value);
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const price = parseFloat(product.dataset.price);
            if (price <= maxPrice) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ECommerceApp();
});

// Additional CSS for notifications
const notificationCSS = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-info { background: #3b82f6; }
    .notification-success { background: #10b981; }
    .notification-error { background: #ef4444; }
    .notification-warning { background: #f59e0b; }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.8;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    @media (max-width: 480px) {
        .notification {
            right: 10px;
            left: 10px;
            transform: translateY(-100%);
        }
        
        .notification.show {
            transform: translateY(0);
        }
    }
`;

// Inject notification CSS
const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);