// ========== ИНИЦИАЛИЗАЦИЯ ==========

window.onload = function() {
    console.log('Game initializing...'); // Для отладки
    
    // Получаем device ID
    currentUserId = getDeviceId();
    
    // Загружаем игру
    if (!loadGame()) {
        console.log('Creating new game state...');
        // Создаем новый gameState если загрузка не удалась
        gameState = {
            balance: 1000000,
            diamonds: 1000,
            exp: 0,
            level: 1,
            totalClicks: 0,
            totalEarned: 1000000,
            lastOnlineTime: Date.now(),
            myBusinesses: [],
            miningFarms: [],
            battlePass: { level: 1, exp: 0, claimed: [], lastReset: Date.now() },
            businessSlots: MAX_BUSINESSES,
            businessPassUpgraded: false,
            houses: houses.map(h => ({ ...h })),
            islands: islands.map(i => ({ ...i })),
            garages: { cars: [], planes: [], ships: [] },
            crypto: cryptoCurrencies.map(c => ({ id: c.id, owned: 0 })),
            cryptoPrices: cryptoCurrencies.map(c => c.basePrice),
            taxes: [],
            calendar: {
                currentDay: 1,
                lastClaimTime: Date.now() - 24 * 60 * 60 * 1000,
                claimedDays: [],
                totalDiamonds: 0,
                streak: 0
            },
            space: {
                level: 0,
                unlockedLevels: [0],
                lastLaunch: null
            },
            achievements: [],
            claimedAchievements: [],
            rocketLaunches: []
        };
        
        cryptoPrices = gameState.cryptoPrices;
    }
    
    // Проверяем админ режим
    if (ADMIN_SECRETS.includes(currentUser)) {
        console.log('Admin mode enabled');
        enableAdminMode();
    }
    
    // Обновляем отображение ника
    updateUsernameDisplay();
    
    // Обновляем UI
    updateUI();
    
    // Рендерим главную вкладку
    console.log('Rendering earn tab...');
    renderEarn();
    
    console.log('Game initialized successfully');
};