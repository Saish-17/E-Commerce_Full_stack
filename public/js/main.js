// Shared Client Logic for LUXE Retail

// Centralized Config
const APP_CONFIG = {
    apiUrl: '' // relative URLs since backend and frontend are hosted together
};

// Centralized Auth Helpers
const Auth = {
    getToken() {
        return localStorage.getItem('token');
    },
    getUser() {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
    }
};

// Centralized Cart Helpers
const Cart = {
    get() {
        const cartStr = localStorage.getItem('cart');
        try {
            return cartStr ? JSON.parse(cartStr) : [];
        } catch (e) {
            return [];
        }
    },
    save(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    },
    add(product, quantity = 1) {
        const cart = this.get();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: quantity
            });
        }
        this.save(cart);
        showToast(`Added ${product.name} to cart`, 'success');
    },
    remove(productId) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== productId);
        this.save(cart);
        showToast('Item removed from cart', 'info');
    },
    updateQty(productId, qty) {
        const cart = this.get();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = qty;
            if (item.quantity <= 0) {
                this.remove(productId);
            } else {
                this.save(cart);
            }
        }
    },
    clear() {
        localStorage.removeItem('cart');
        updateCartBadge();
    }
};

// central dynamic navbar updates
function updateNavbar() {
    const navLinks = document.querySelector('nav .space-x-gutter') || document.querySelector('nav .flex.space-x-gutter');
    const profileContainer = document.querySelector('nav button[aria-label="User Profile"]') || document.querySelector('nav a[href*="login"]');
    
    if (navLinks) {
        // Clear & Rebuild Nav Links dynamically based on auth state
        let html = `<a href="/index.html" class="text-secondary hover:text-primary font-label-lg text-label-lg hover:opacity-80 transition-opacity ${window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ? 'text-primary font-bold border-b-2 border-primary pb-1' : ''}">Home</a>`;
        html += `<a href="/products.html" class="text-secondary hover:text-primary font-label-lg text-label-lg hover:opacity-80 transition-opacity ${window.location.pathname.endsWith('products.html') ? 'text-primary font-bold border-b-2 border-primary pb-1' : ''}">Products</a>`;
        
        if (Auth.isLoggedIn()) {
            html += `<a href="/orders.html" class="text-secondary hover:text-primary font-label-lg text-label-lg hover:opacity-80 transition-opacity ${window.location.pathname.endsWith('orders.html') ? 'text-primary font-bold border-b-2 border-primary pb-1' : ''}">My Orders</a>`;
            if (Auth.isAdmin()) {
                html += `<a href="/admin.html" class="text-secondary hover:text-primary font-label-lg text-label-lg hover:opacity-80 transition-opacity ${window.location.pathname.endsWith('admin.html') ? 'text-primary font-bold border-b-2 border-primary pb-1' : ''}">Admin Dashboard</a>`;
            }
        }
        navLinks.innerHTML = html;
    }

    if (profileContainer) {
        const parent = profileContainer.parentElement;
        if (Auth.isLoggedIn()) {
            // Replace Profile Icon with User Dropdown / Logout Option
            const user = Auth.getUser();
            const dropdownId = 'nav-user-dropdown-container';
            let existing = document.getElementById(dropdownId);
            if (!existing) {
                const container = document.createElement('div');
                container.id = dropdownId;
                container.className = 'relative inline-block text-left';
                container.innerHTML = `
                    <button id="user-menu-btn" class="flex items-center gap-xs p-sm text-primary hover:opacity-80 rounded-full hover:bg-surface-container-highest transition-colors font-label-lg text-label-lg">
                        <span class="material-symbols-outlined">person</span>
                        <span class="hidden sm:inline">${user.name.split(' ')[0]}</span>
                    </button>
                    <div id="user-menu-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded bg-surface-container-lowest border border-outline-variant shadow-lg z-50">
                        <div class="py-1">
                            <span class="block px-md py-sm text-label-sm text-outline border-b border-surface-variant">${user.email}</span>
                            ${user.role === 'admin' ? `<a href="/admin.html" class="block px-md py-sm text-body-md text-on-surface hover:bg-surface-container-low">Admin Dashboard</a>` : ''}
                            <a href="/orders.html" class="block px-md py-sm text-body-md text-on-surface hover:bg-surface-container-low">My Orders</a>
                            <button id="logout-btn" class="w-full text-left block px-md py-sm text-body-md text-error hover:bg-error-container/20">Sign Out</button>
                        </div>
                    </div>
                `;
                parent.replaceChild(container, profileContainer);
                
                // Toggle Dropdown
                const menuBtn = container.querySelector('#user-menu-btn');
                const dropdown = container.querySelector('#user-menu-dropdown');
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('hidden');
                });
                
                document.addEventListener('click', () => dropdown.classList.add('hidden'));
                
                container.querySelector('#logout-btn').addEventListener('click', () => {
                    Auth.logout();
                });
            }
        } else {
            // If user profile is standard button, link it to login.html
            profileContainer.outerHTML = `
                <a href="/login.html" class="p-sm text-primary hover:opacity-80 transition-opacity rounded-full hover:bg-surface-container-highest transition-colors flex items-center" aria-label="User Profile">
                    <span class="material-symbols-outlined">person</span>
                </a>
            `;
        }
    }

    // Set cart button link
    const cartBtn = document.querySelector('button[aria-label="Shopping Cart"]');
    if (cartBtn) {
        cartBtn.outerHTML = `
            <a href="/cart.html" class="relative p-sm text-primary hover:opacity-80 transition-opacity rounded-full hover:bg-surface-container-highest transition-colors flex items-center" aria-label="Shopping Cart">
                <span class="material-symbols-outlined">shopping_cart</span>
                <span id="cart-badge" class="absolute -top-xs -right-xs bg-primary text-on-primary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-surface-container-lowest hidden">0</span>
            </a>
        `;
    }

    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const cart = Cart.get();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Centralized Toast Alert System
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-md right-md z-[9999] flex flex-col gap-sm max-w-sm w-full pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-surface-container-lowest text-on-surface p-md rounded shadow-lg border border-outline-variant flex items-start gap-sm transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto relative overflow-hidden';
    
    // Left border indicator
    const borderColors = {
        success: 'bg-primary',
        warning: 'bg-tertiary-container',
        info: 'bg-secondary',
        error: 'bg-error'
    };
    const accentClass = borderColors[type] || 'bg-primary';
    
    const icons = {
        success: 'check_circle',
        warning: 'warning',
        info: 'info',
        error: 'error'
    };
    const icon = icons[type] || 'check_circle';

    toast.innerHTML = `
        <div class="absolute left-0 top-0 bottom-0 w-1.5 ${accentClass}"></div>
        <span class="material-symbols-outlined text-[20px] ${type === 'error' ? 'text-error' : type === 'warning' ? 'text-on-tertiary-container' : 'text-primary'}">${icon}</span>
        <div class="flex-grow font-body-md text-body-md pr-sm">${message}</div>
        <button class="text-outline-variant hover:text-on-surface transition-colors" onclick="this.parentElement.remove()">
            <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-y-[-10px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Run updates on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
