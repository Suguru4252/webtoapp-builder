// ========== АДМИН ПАНЕЛЬ ==========

// Показать модалку смены ника
function showNicknameModal() {
    document.getElementById('nicknameInput').value = currentUser;
    document.getElementById('nicknameModal').classList.add('active');
}

// Сохранить новый ник
function saveNickname() {
    const newNick = document.getElementById('nicknameInput').value.trim();
    if (!newNick) return;
    
    const oldUser = currentUser;
    currentUser = newNick;
    
    // Проверяем, является ли новый ник админским
    if (ADMIN_SECRETS.includes(currentUser) && !ADMIN_SECRETS.includes(oldUser)) {
        // Если старый ник не был админским, а новый стал - запрашиваем пароль
        showAdminPasswordModal();
    } else if (!ADMIN_SECRETS.includes(currentUser) && ADMIN_SECRETS.includes(oldUser)) {
        // Если был админом, а стал обычным - выключаем админ режим
        disableAdminMode();
    }
    
    // Обновляем ник в шапке
    updateUsernameDisplay();
    
    saveGame();
    closeNicknameModal();
    
    // Обновляем профиль если открыт
    if (document.querySelector('.nav-item.active')?.innerText.includes('Профиль')) {
        renderProfile();
    }
}

// Обновить отображение ника
function updateUsernameDisplay() {
    let usernameHtml = '👑 ' + currentUser + ' <span class="warning-badge">⚠️ ЛОКАЛЬНО</span>';
    if (specialItem.owned) {
        usernameHtml += ' <span class="suguru-badge">💎</span>';
    }
    document.getElementById('username').innerHTML = usernameHtml;
}

// Показать модалку ввода пароля админа
function showAdminPasswordModal() {
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminPasswordModal').classList.add('active');
}

// Проверить пароль админа
function checkAdminPassword() {
    const password = document.getElementById('adminPasswordInput').value;
    if (password === ADMIN_PASSWORD) {
        enableAdminMode();
        closeAdminPasswordModal();
    } else {
        alert('❌ Неверный пароль!');
    }
}

// Включить админ режим
function enableAdminMode() {
    isAdmin = true;
    
    // Добавляем классы для визуала
    document.body.classList.add('admin-mode');
    document.querySelector('.app-container').classList.add('admin-app');
    document.querySelector('.header').classList.add('admin-header');
    document.getElementById('username').classList.add('admin-username');
    document.querySelector('.bottom-nav').classList.add('admin-nav');
    
    // ДАЕМ АДМИНУ ДЕНЬГИ И АЛМАЗЫ
    gameState.balance = (gameState.balance || 0) + 1000000000000; // +1 триллион
    gameState.diamonds = (gameState.diamonds || 0) + 10000; // +10000 алмазов
    gameState.exp = (gameState.exp || 0) + 1000000; // +1 млн опыта
    
    // Проверяем повышение уровня
    const expNeeded = (gameState.level || 1) * 1500;
    while (gameState.exp >= expNeeded && (gameState.level || 1) < MAX_PLAYER_LEVEL) {
        gameState.exp -= expNeeded;
        gameState.level = (gameState.level || 1) + 1;
    }
    
    // Красная вспышка
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 0, 0, 0.3)';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1000);
    
    // Показываем сообщение с полученными ресурсами
    alert('🔥 АДМИН РЕЖИМ АКТИВИРОВАН!\n\n' +
          '💰 Получено: 1,000,000,000,000 монет\n' +
          '💎 Получено: 10,000 алмазов\n' +
          '⚡ Получено: 1,000,000 опыта');
    
    // Обновляем интерфейс
    updateUI();
    saveGame();
    
    // Обновляем текущую вкладку
    const activeTab = document.querySelector('.nav-item.active')?.innerText || '';
    if (activeTab.includes('Профиль')) {
        renderProfile();
    } else if (activeTab.includes('Заработок')) {
        renderEarn();
    }
}

// Выключить админ режим
function disableAdminMode() {
    isAdmin = false;
    
    // Убираем классы
    document.body.classList.remove('admin-mode');
    document.querySelector('.app-container').classList.remove('admin-app');
    document.querySelector('.header').classList.remove('admin-header');
    document.getElementById('username').classList.remove('admin-username');
    document.querySelector('.bottom-nav').classList.remove('admin-nav');
    
    // Сохраняем статус
    saveGame();
}

// Переключить звук
function toggleSound() {
    settings.soundEnabled = !settings.soundEnabled;
    saveGame();
}

// Переключить эффекты
function toggleEffects() {
    settings.effectsEnabled = !settings.effectsEnabled;
    saveGame();
}