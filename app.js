const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Проверка на светлую/темную тему
if (tg.colorScheme === 'light') {
    document.body.classList.add('light');
    tg.setHeaderColor('#f8fafc');
    tg.setBackgroundColor('#f8fafc');
} else {
    document.body.classList.remove('light');
    tg.setHeaderColor('#09090b');
    tg.setBackgroundColor('#09090b');
}

let cart = [];
let currentDiscount = 0;
const catalog = document.getElementById('catalog');
const modal = document.getElementById('modal');
const promoBox = document.getElementById('promo-box');
const searchInput = document.getElementById('search-input');

// База данных услуг
const products = [
    {
        id: 1,
        category: 'tg',
        title: 'B2B Автоматизация',
        desc: 'Telegram-бот для учета складской логистики и интеграции с базами данных.',
        fullDesc: 'Полноценная архитектура для корпоративного сектора. Помогает отслеживать остатки, генерировать отчеты в Excel и управлять сотрудниками прямо со смартфона. Высокая отказоустойчивость.',
        price: 15000,
        stack: ['Python', 'MySQL', 'aiogram 3.x', 'Pandas'],
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>'
    },
    {
        id: 2,
        category: 'tg',
        title: 'Web App Магазин',
        desc: 'Интерактивный UI с корзиной внутри Telegram.',
        fullDesc: 'Разработка нативного интерфейса (мини-приложения) внутри мессенджера. Подключение оплат (ЮKassa, CryptoBot), корзина товаров и админ-панель.',
        price: 25000,
        stack: ['HTML/CSS/JS', 'Python', 'Telegram API', 'PostgreSQL'],
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="1" y1="9" x2="4" y2="9"></line></svg>'
    },
    {
        id: 3,
        category: 'game',
        title: 'Discord Интеграция',
        desc: 'Связка Minecraft сервера (Java) с Discord.',
        fullDesc: 'Разработка сложной системы управления сервером через Discord: синхронизация ролей, вывод онлайна, RCON команды и логирование чата.',
        price: 10000,
        stack: ['Java', 'Spigot API', 'Python', 'Discord.py'],
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>'
    }
];

// Рендер карточек с учетом поиска и табов
function renderProducts(filterCategory = 'all', searchQuery = '') {
    catalog.innerHTML = '';
    
    const filtered = products.filter(p => {
        const matchCategory = filterCategory === 'all' || p.category === filterCategory;
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCategory && matchSearch;
    });
    
    filtered.forEach((product, index) => {
        const isActive = cart.some(item => item.id === product.id);
        const card = document.createElement('div');
        card.className = `card ${isActive ? 'active' : ''}`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="icon-wrap">${product.icon}</div>
            <div class="info" onclick="openModal(${product.id})">
                <div class="title">${product.title}</div>
                <div class="desc">${product.desc}</div>
            </div>
            <div class="action">
                <div class="price">${product.price.toLocaleString('ru-RU')} ₽</div>
                <button class="btn" onclick="toggleCart(${product.id}, event)">
                    ${isActive ? 'Убрать' : 'Добавить'}
                </button>
            </div>
        `;
        catalog.appendChild(card);
    });
}

// Живой поиск
searchInput.addEventListener('input', (e) => {
    const activeTab = document.querySelector('.tab.active').dataset.category;
    renderProducts(activeTab, e.target.value);
});

// Управление корзиной
function toggleCart(id, event) {
    event.stopPropagation();
    const product = products.find(p => p.id === id);
    const index = cart.findIndex(i => i.id === id);

    if (index > -1) {
        cart.splice(index, 1);
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } else {
        cart.push(product);
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    }
    
    const activeTab = document.querySelector('.tab.active').dataset.category;
    renderProducts(activeTab, searchInput.value);
    updateMainButton();
}

// Система промокодов
function applyPromo() {
    const input = document.getElementById('promo-input').value.trim().toUpperCase();
    if (input === 'TONNDA') {
        currentDiscount = 0.15; // 15% скидка
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        updateMainButton();
        document.getElementById('promo-input').value = 'Скидка 15% применена!';
        document.getElementById('promo-input').disabled = true;
    } else {
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        const box = document.getElementById('promo-input');
        box.style.transform = 'translateX(10px)';
        setTimeout(() => box.style.transform = 'translateX(-10px)', 50);
        setTimeout(() => box.style.transform = 'translateX(0)', 100);
        setTimeout(() => box.style.transform = 'none', 150);
    }
}

// Главная кнопка TG
function updateMainButton() {
    if (cart.length === 0) {
        tg.MainButton.hide();
        promoBox.style.display = 'none';
    } else {
        promoBox.style.display = 'flex';
        
        let subtotal = cart.reduce((s, i) => s + i.price, 0);
        let total = subtotal - (subtotal * currentDiscount);
        
        tg.MainButton.text = currentDiscount > 0 
            ? `ОФОРМИТЬ СО СКИДКОЙ • ${total.toLocaleString('ru-RU')} ₽`
            : `ОФОРМИТЬ • ${total.toLocaleString('ru-RU')} ₽`;
            
        tg.MainButton.color = '#6366f1';
        tg.MainButton.textColor = '#ffffff';
        tg.MainButton.show();
    }
}

// Модальное окно
function openModal(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('modal-icon').innerHTML = `<div class="icon-wrap" style="margin-bottom:16px; width:64px; height:64px;">${product.icon}</div>`;
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-desc').innerText = product.fullDesc;
    
    const stackContainer = document.getElementById('modal-stack');
    stackContainer.innerHTML = product.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
    
    modal.classList.add('open');
    if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
}

function closeModal() {
    modal.classList.remove('open');
}

// Переключение табов
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts(e.target.dataset.category, searchInput.value);
        if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
    });
});

// Отправка данных боту при оформлении заказа
Telegram.WebApp.onEvent('mainButtonClicked', function() {
    let items = cart.map(i => `🔸 ${i.title}`).join('\n');
    let subtotal = cart.reduce((s, i) => s + i.price, 0);
    let finalTotal = subtotal - (subtotal * currentDiscount);
    
    let msg = `🚀 Запрос на разработку:\n\n${items}\n\n💰 Итого: ${finalTotal.toLocaleString('ru-RU')} ₽`;
    if (currentDiscount > 0) {
        msg += ` (С учетом скидки 15%)`;
    }
    
    tg.sendData(msg);
});

// Запуск при старте
renderProducts();