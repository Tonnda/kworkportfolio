const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();
tg.setHeaderColor('#09090b');
tg.setBackgroundColor('#09090b');

// База данных товаров
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

let cart = [];
const catalog = document.getElementById('catalog');
const modal = document.getElementById('modal');

// Рендер карточек
function renderProducts(filterCategory = 'all') {
    catalog.innerHTML = '';
    const filtered = filterCategory === 'all' ? products : products.filter(p => p.category === filterCategory);
    
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

// Управление корзиной
function toggleCart(id, event) {
    event.stopPropagation(); // Чтобы не открывалась модалка при клике на кнопку
    const product = products.find(p => p.id === id);
    const index = cart.findIndex(i => i.id === id);

    if (index > -1) {
        cart.splice(index, 1);
        tg.HapticFeedback.impactOccurred('light');
    } else {
        cart.push(product);
        tg.HapticFeedback.impactOccurred('medium');
    }
    renderProducts(document.querySelector('.tab.active').dataset.category);
    updateMainButton();
}

// Главная кнопка TG
function updateMainButton() {
    if (cart.length === 0) {
        tg.MainButton.hide();
    } else {
        let total = cart.reduce((s, i) => s + i.price, 0);
        tg.MainButton.text = `ОФОРМИТЬ • ${total.toLocaleString('ru-RU')} ₽`;
        tg.MainButton.color = '#6366f1';
        tg.MainButton.textColor = '#ffffff';
        tg.MainButton.show();
    }
}

// Модальное окно
function openModal(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('modal-icon').innerHTML = `<div class="icon-wrap" style="margin-bottom:16px;">${product.icon}</div>`;
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-desc').innerText = product.fullDesc;
    
    const stackContainer = document.getElementById('modal-stack');
    stackContainer.innerHTML = product.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
    
    modal.classList.add('open');
    tg.HapticFeedback.selectionChanged();
}

function closeModal() {
    modal.classList.remove('open');
}

// Переключение табов
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts(e.target.dataset.category);
        tg.HapticFeedback.selectionChanged();
    });
});

// Отправка данных боту
Telegram.WebApp.onEvent('mainButtonClicked', function() {
    let items = cart.map(i => `🔸 ${i.title}`).join('\n');
    tg.sendData(`🚀 Запрос на разработку:\n\n${items}`);
});

// Инициализация при старте
renderProducts();