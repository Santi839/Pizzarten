/**
 * APP.JS - Lógica Principal de Pizzarten
 * Integración con SweetAlert2 (Dark Mode)
 */

// --- 1. CONFIGURACIÓN Y ESTADO ---
let appData = {};
let cart = [];
let currentUserRole = 'visitor';

const DB_KEY = 'pizzarten_db_v2';
const CART_KEY = 'pizzarten_cart_v1';
const ROLE_KEY = 'pizzarten_role_v1';

// --- CONFIGURACIÓN SWEETALERT DARK ---
const swalColors = {
    bg: '#1a1a1a',
    text: '#f4f4f9',
    primary: '#ff5e00',
    cancel: '#333'
};

// Mixin para alertas normales
const SwalDark = Swal.mixin({
    background: swalColors.bg,
    color: swalColors.text,
    confirmButtonColor: swalColors.primary,
    cancelButtonColor: swalColors.cancel,
    iconColor: swalColors.primary
});

// Mixin para notificaciones tipo "Toast" (esquina superior)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: swalColors.bg,
    color: swalColors.text,
    iconColor: swalColors.primary,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// --- 2. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    injectGlobalComponents();
    loadData();
    loadCart();
    checkSession();

    const path = window.location.pathname;
    
    if (path.includes('details.html')) {
        renderDetailsPage();
    } else if (path.includes('cart.html')) {
        renderCartPage();
    } else if (path.includes('about.html')) {
        highlightActiveLink();
    } else {
        renderHome();
    }

    updateCartCount();
    updateUserInterface();
});

// --- 3. COMPONENTES GLOBALES ---
function injectGlobalComponents() {
    // NAVBAR (Con botón hamburguesa agregado)
    const navbarHTML = `
        <nav class="navbar">
            <div class="nav-header">
                <div class="logo" onclick="location.href='index.html'" style="cursor:pointer;">
                    PIZZ<span class="highlight">ARTEN</span>
                </div>
                <div class="menu-toggle" onclick="toggleMenu()">
                    <i class="fas fa-bars"></i>
                </div>
            </div>

            <ul class="nav-links" id="nav-links">
                <li><a href="index.html" onclick="toggleMenu()">Inicio</a></li>
                <li><a href="index.html#menu" onclick="toggleMenu()">Menú</a></li>
                <li><a href="about.html" onclick="toggleMenu()">Nosotros</a></li>
                <li>
                    <a href="cart.html" class="cart-link" onclick="toggleMenu()">
                        <i class="fas fa-shopping-cart"></i> 
                        <span id="cart-count" class="badge-count">0</span>
                    </a>
                </li>
                
                <li id="auth-btn" onclick="openModal(); toggleMenu()">Acceder</li>
                
                <li id="user-display" class="hidden">
                    <span id="username-span">USER</span> 
                    <i class="fas fa-sign-out-alt" onclick="logout(); toggleMenu()" title="Salir" style="cursor:pointer; margin-left:10px; color:var(--primary);"></i>
                </li>
            </ul>
        </nav>
    `;

    // FOOTER (Sin cambios)
    const footerHTML = `
        <footer>
            <p>© 2025 Pizzarten. Donde la cocina se encuentra con el diseño.</p>
            <div style="margin-top:10px; font-size: 1.5rem;">
                <i class="fab fa-instagram" style="margin:0 10px; cursor:pointer;"></i>
                <i class="fab fa-facebook" style="margin:0 10px; cursor:pointer;"></i>
                <i class="fab fa-whatsapp" style="margin:0 10px; cursor:pointer;"></i>
            </div>
        </footer>
    `;

    // MODAL (Sin cambios)
    const modalHTML = `
        <div id="login-modal" class="modal hidden">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <h2>Bienvenido a Pizzarten</h2>
                <p style="margin-bottom:20px; color:#aaa;">Selecciona un perfil:</p>
                <div class="role-buttons">
                    <button class="btn-secondary" onclick="login('visitor')">Visitante</button>
                    <button class="btn-secondary" onclick="login('user')">Cliente Registrado</button>
                    <button class="btn-primary" onclick="login('admin')">Administrador</button>
                </div>
            </div>
        </div>
    `;

    const navContainer = document.getElementById('global-navbar');
    if(navContainer) navContainer.innerHTML = navbarHTML;
    const footerContainer = document.getElementById('global-footer');
    if(footerContainer) footerContainer.innerHTML = footerHTML;
    const modalContainer = document.getElementById('global-modal');
    if(modalContainer) modalContainer.innerHTML = modalHTML;

    highlightActiveLink();
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.split('#')[0])) {
            link.classList.add('active');
        }
    });
}

// --- 4. GESTIÓN DE SESIÓN ---
function openModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function login(role) {
    currentUserRole = role;
    sessionStorage.setItem(ROLE_KEY, role);
    updateUserInterface();
    closeModal();
    
    // Refrescar vistas
    if (document.getElementById('menu-container')) {
        renderMenu();
        renderCombos();
    }
    if (document.getElementById('detail-add-btn')) renderDetailsPage();

    // Feedback visual (Toast)
    Toast.fire({
        icon: 'success',
        title: `Hola, ${role.toUpperCase()}`
    });
}

function logout() {
    SwalDark.fire({
        title: '¿Cerrar sesión?',
        text: "Volverás al modo visitante",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            currentUserRole = 'visitor';
            sessionStorage.removeItem(ROLE_KEY);
            updateUserInterface();
            
            if (document.getElementById('menu-container')) {
                renderMenu();
                renderCombos();
            }
            if (window.location.pathname.includes('cart.html')) window.location.reload();
            
            Toast.fire({ icon: 'info', title: 'Sesión cerrada' });
        }
    });
}

function checkSession() {
    const savedRole = sessionStorage.getItem(ROLE_KEY);
    if(savedRole) currentUserRole = savedRole;
}

function updateUserInterface() {
    const authBtn = document.getElementById('auth-btn');
    const userDisplay = document.getElementById('user-display');
    const usernameSpan = document.getElementById('username-span');
    const adminPanel = document.getElementById('admin-panel');

    if (currentUserRole !== 'visitor') {
        if(authBtn) authBtn.classList.add('hidden');
        if(userDisplay) userDisplay.classList.remove('hidden');
        if(usernameSpan) usernameSpan.innerText = currentUserRole.toUpperCase();
    } else {
        if(authBtn) authBtn.classList.remove('hidden');
        if(userDisplay) userDisplay.classList.add('hidden');
    }

    if (adminPanel) {
        if (currentUserRole === 'admin') adminPanel.classList.remove('hidden');
        else adminPanel.classList.add('hidden');
    }
}

// --- 5. GESTIÓN DE DATOS ---
function loadData() {
    const localData = localStorage.getItem(DB_KEY);
    if (localData) {
        appData = JSON.parse(localData);
    } else if (typeof defaultData !== 'undefined') {
        appData = JSON.parse(JSON.stringify(defaultData));
    } else {
        appData = { menu: [], combos: [], hero: {}, company: {} };
    }
}

function saveData() {
    localStorage.setItem(DB_KEY, JSON.stringify(appData));
}

// --- 6. GESTIÓN DEL CARRITO ---
function loadCart() {
    const savedCart = localStorage.getItem(CART_KEY);
    cart = savedCart ? JSON.parse(savedCart) : [];
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        countSpan.innerText = totalQty;
        countSpan.style.display = totalQty > 0 ? 'inline-block' : 'none';
    }
}

function addToCart(id, type) {
    let product;
    if (type === 'menu') product = appData.menu.find(p => p.id == id);
    else if (type === 'combo') product = appData.combos.find(c => c.id == id);

    if (!product) return;

    const existingItem = cart.find(item => item.id == id);
    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({
            id: product.id,
            name: product.name || product.title,
            price: product.price,
            img: product.img || '',
            qty: 1
        });
    }
    saveCart();
    
    // Feedback con Toast
    Toast.fire({
        icon: 'success',
        title: 'Agregado al carrito'
    });
}

function updateQty(id, change) {
    const item = cart.find(i => i.id == id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCartPage();
        }
    }
}

function removeFromCart(id) {
    SwalDark.fire({
        title: '¿Eliminar del carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            cart = cart.filter(i => i.id != id);
            saveCart();
            renderCartPage();
            Toast.fire({ icon: 'info', title: 'Producto eliminado' });
        }
    });
}

function checkout() {
    if(cart.length === 0) return SwalDark.fire('Carrito vacío', 'Agrega algo delicioso primero', 'info');
    
    if(currentUserRole === 'visitor') {
        openModal();
        Toast.fire({ icon: 'warning', title: 'Debes iniciar sesión' });
        return;
    }

    SwalDark.fire({
        title: '¡Pedido Enviado!',
        text: 'Tu orden está volando hacia la cocina.',
        icon: 'success',
        confirmButtonText: '¡Genial!'
    }).then(() => {
        cart = [];
        saveCart();
        renderCartPage();
    });
}

// --- 7. RENDERIZADORES ---
function renderHome() {
    const heroContent = document.getElementById('hero-content');
    if(heroContent && appData.hero) {
        heroContent.innerHTML = `
            <h1>${appData.hero.title}</h1>
            <p>${appData.hero.subtitle}</p>
            <button class="btn-primary" onclick="location.href='#menu'">${appData.hero.ctaButton}</button>
        `;
    }
    renderMenu();
    renderCombos();
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    if(!container || !appData.menu) return;
    container.innerHTML = '';
    
    appData.menu.forEach(item => {
        let actionBtn = '';
        if(currentUserRole === 'admin') {
            actionBtn = `<button class="btn-delete" onclick="event.stopPropagation(); deleteProduct(${item.id})">Eliminar</button>`;
        }
        
        let buyBtn = (currentUserRole === 'visitor') 
            ? `<button class="btn-secondary full-width" onclick="event.stopPropagation(); openModal()">Pedir</button>`
            : `<button class="btn-primary full-width" onclick="event.stopPropagation(); addToCart(${item.id}, 'menu')">Agregar</button>`;

        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
                location.href = `details.html?type=menu&id=${item.id}`;
            }
        };
        
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="card-body">
                <h3>${item.name}</h3>
                <p class="desc">${item.desc ? item.desc.substring(0, 50) : ''}...</p>
                <div class="price">$${item.price}</div>
                ${buyBtn}
                ${actionBtn}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCombos() {
    const container = document.getElementById('combos-container');
    if(!container || !appData.combos) return;
    container.innerHTML = '';
    
    appData.combos.forEach(combo => {
        const card = document.createElement('div');
        card.className = 'card combo-card';
        // Al hacer click lleva al detalle
        card.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') location.href = `details.html?type=combo&id=${combo.id}`;
        };
        
        let buyBtn = (currentUserRole === 'visitor') 
            ? `<button class="btn-secondary full-width" onclick="event.stopPropagation(); openModal()">Pedir</button>`
            : `<button class="btn-primary full-width" onclick="event.stopPropagation(); addToCart(${combo.id}, 'combo')">Agregar</button>`;

        card.innerHTML = `
            <div class="badge">${combo.badge}</div>
            
            <img src="${combo.img}" alt="${combo.title}" style="width:100%; height:200px; object-fit:cover; border-bottom:1px solid #333;">
            
            <div class="card-body">
                <h3>${combo.title}</h3>
                <p>${combo.desc}</p>
                <div class="price">$${combo.price}</div>
                ${buyBtn}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');
    
    let item;
    if (type === 'menu') item = appData.menu.find(p => p.id == id);
    else if (type === 'combo') item = appData.combos.find(c => c.id == id);

    if(!item) {
        const container = document.getElementById('details-container');
        if(container) container.innerHTML = "<h2>Producto no encontrado</h2><a href='index.html'>Volver</a>";
        return;
    }

    document.getElementById('detail-img').src = item.img || 'https://via.placeholder.com/500';
    document.getElementById('detail-title').innerText = item.name || item.title;
    document.getElementById('detail-desc').innerText = item.desc;
    document.getElementById('detail-price').innerText = `$${item.price}`;
    
    const btn = document.getElementById('detail-add-btn');
    if(btn) {
        if(currentUserRole === 'visitor') {
            btn.innerText = "Inicia Sesión para Pedir";
            btn.className = 'btn-secondary';
            btn.onclick = openModal;
        } else {
            btn.innerText = "Añadir al Pedido";
            btn.className = 'btn-primary';
            btn.onclick = () => addToCart(item.id, type);
        }
    }
}

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-final-total');
    
    if(!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <h3>Tu carrito está vacío ☹️</h3>
                <br>
                <button class="btn-primary" onclick="location.href='index.html#menu'">Ir al Menú</button>
            </div>
        `;
        if(subtotalEl) subtotalEl.innerText = "$0.00";
        if(totalEl) totalEl.innerText = "$0.00";
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="cart-info">
                <h4>${item.name}</h4>
                <small>$${item.price}</small>
            </div>
            <div class="cart-controls">
                <button class="btn-mini" onclick="updateQty(${item.id}, -1)">-</button>
                <span style="margin: 0 10px; font-weight:bold;">${item.qty}</span>
                <button class="btn-mini" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <div class="cart-price">$${itemTotal.toFixed(2)}</div>
            <button class="btn-delete-icon" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    const shipping = 2.00;
    const finalTotal = subtotal + shipping;
    if(subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if(totalEl) totalEl.innerText = `$${finalTotal.toFixed(2)}`;
}

// --- 8. ACCIONES ADMIN ---

// Función "Agregar Pizza" mejorada con SweetAlert (Inputs Múltiples)
async function addProduct() {
    const { value: formValues } = await SwalDark.fire({
        title: 'Nueva Pizza',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Nombre de la pizza" style="background:#333; color:white; border:none;">' +
            '<input id="swal-input2" class="swal2-input" placeholder="Precio (ej. 12.99)" type="number" step="0.01" style="background:#333; color:white; border:none;">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        preConfirm: () => {
            return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value
            ]
        }
    });

    if (formValues) {
        const [name, price] = formValues;
        if(name && price) {
            appData.menu.push({
                id: Date.now(),
                name: name,
                desc: "Nueva especialidad creada por el Admin.",
                price: parseFloat(price).toFixed(2),
                img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
            });
            saveData();
            renderMenu();
            Toast.fire({ icon: 'success', title: 'Producto creado' });
        }
    }
}

function deleteProduct(id) {
    SwalDark.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            appData.menu = appData.menu.filter(p => p.id !== id);
            saveData();
            renderMenu();
            SwalDark.fire('¡Borrado!', 'El producto ha sido eliminado.', 'success');
        }
    });
}

function resetFactory() {
    SwalDark.fire({
        title: '¿Restaurar Fábrica?',
        text: "Se borrarán todos los productos nuevos",
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Sí, restaurar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem(DB_KEY);
            location.reload();
        }
    });
}

function toggleMenu() {
    const nav = document.getElementById('nav-links');
    if(nav) {
        nav.classList.toggle('active');
    }
}