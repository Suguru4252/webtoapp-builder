// ========== МАГАЗИН ==========
function buySalonItem(category, itemId) {
    const item = salonItems[category].find(i => i.id === itemId);
    if (!item) return;
    
    if (gameState.balance < item.price) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    gameState.balance -= item.price;
    
    if (!gameState.garages[category]) {
        gameState.garages[category] = [];
    }
    
    const newItem = {
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        purchasedAt: Date.now()
    };
    
    gameState.garages[category].push(newItem);
    
    saveGame();
    updateUI();
    renderItems();
    alert(`✅ Куплен ${item.name}!`);
}

function sellGarageItem(category, itemId) {
    const garage = gameState.garages[category];
    if (!garage || garage.length === 0) return;
    
    const index = garage.findIndex(item => item.id === itemId);
    if (index === -1) return;
    
    const item = garage[index];
    const sellPrice = Math.floor(salonItems[category].find(i => i.id === itemId).price * 0.5);
    
    if (confirm(`Продать ${item.name} за ${formatMoney(sellPrice)}?`)) {
        garage.splice(index, 1);
        gameState.balance += sellPrice;
        
        saveGame();
        updateUI();
        renderItems();
        alert(`✅ Продано! +${formatMoney(sellPrice)}`);
    }
}

function getGarageCount(category) {
    return gameState?.garages[category]?.length || 0;
}

function buySpecialItem() {
    if (specialItem.owned) {
        alert('❌ У вас уже есть Suguru Coin!');
        return;
    }
    
    if ((gameState.balance || 0) < specialItem.price) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    if (confirm(`Купить Suguru Coin за ${formatMoney(specialItem.price)}?\n\nДоход: +${formatMoney(specialItem.income)}/мин`)) {
        gameState.balance -= specialItem.price;
        specialItem.owned = true;
        specialItem.revealed = true;
        
        saveGame();
        updateUI();
        renderInvestments();
        alert('✅ ПОЗДРАВЛЯЮ!\n\nВы купили легендарный Suguru Coin!');
        
        document.getElementById('username').innerHTML += ' <span class="suguru-badge">💎</span>';
    }
}

function showSalon(category) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    const titles = {
        cars: '🚗 АВТОСАЛОН (20 машин)',
        planes: '✈️ АВИАСАЛОН (20 самолетов)',
        ships: '🚢 КОРАБЛЕСАЛОН (20 кораблей)'
    };
    
    let html = `<div class="modal-title">${titles[category]}</div>`;
    
    salonItems[category].forEach(item => {
        html += `
            <div style="background:#0f1117; border-radius:16px; padding:12px; margin-bottom:8px; display:flex; align-items:center; gap:12px;">
                <div style="font-size:32px;">${item.emoji}</div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${item.name}</div>
                    <div style="color:#ffd700; font-size:14px;">${formatMoney(item.price)}</div>
                </div>
                <button class="card-btn" style="width:auto;" onclick="buySalonItem('${category}', ${item.id}); closeModal('modal');">Купить</button>
            </div>
        `;
    });
    
    html += '<div class="close-btn" onclick="closeModal(\'modal\')">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

function showGarage(category) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    const titles = {
        cars: '🚗 ГАРАЖ',
        planes: '✈️ АНГАР',
        ships: '⚓ ПРИЧАЛ'
    };
    
    const items = gameState.garages[category] || [];
    
    let html = `<div class="modal-title">${titles[category]} (${items.length} шт)</div>`;
    
    if (items.length === 0) {
        html += '<div style="text-align:center; padding:30px; color:#8e8e98;">Пока ничего нет</div>';
    } else {
        const grouped = {};
        items.forEach(item => {
            if (!grouped[item.id]) grouped[item.id] = { count: 0, name: item.name, emoji: item.emoji, price: salonItems[category].find(i => i.id === item.id)?.price || 0 };
            grouped[item.id].count++;
        });
        
        Object.values(grouped).forEach(group => {
            const sellPrice = Math.floor(group.price * 0.5);
            html += `
                <div style="background:#0f1117; border-radius:16px; padding:12px; margin-bottom:8px; display:flex; align-items:center; gap:12px;">
                    <div style="font-size:32px;">${group.emoji}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">${group.name}</div>
                        <div style="color:#8e8e98;">Количество: ${group.count}</div>
                    </div>
                    <button class="sell-btn" onclick="sellGarageItem('${category}', ${group.id}); closeModal('modal');">Продать за ${formatMoney(sellPrice)}</button>
                </div>
            `;
        });
    }
    
    html += '<div class="close-btn" onclick="closeModal(\'modal\')">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

function renderItems() {
    const ownedIslands = gameState.islands.filter(i => i.owned).length;
    
    document.getElementById('content').innerHTML = `
        <div class="section-title">
            <h3>🏝️ ОСТРОВА</h3>
            <span style="color:#8e8e98;">${ownedIslands} / 10</span>
        </div>
        
        <div style="margin-bottom:20px;">
            <a href="#" class="garage-link" onclick="showAllIslands()">🏝️ ВСЕ ОСТРОВА →</a>
        </div>
        
        <div class="section-title" style="margin-top:20px;">
            <h3>🏢 АВТОСАЛОН</h3>
            <span style="color:#8e8e98;">${getGarageCount('cars')} шт в гараже</span>
        </div>
        
        <div class="cards-row">
            ${salonItems.cars.slice(0, 3).map(item => `
                <div class="card">
                    <div class="card-title">${item.emoji} ${item.name}</div>
                    <div class="card-sub">${formatMoney(item.price)}</div>
                    <button class="card-btn" onclick="buySalonItem('cars', ${item.id})">Купить</button>
                </div>
            `).join('')}
        </div>
        
        <div style="margin:16px 0;">
            <a href="#" class="garage-link" onclick="showSalon('cars')">Перейти в автосалон (20 машин) →</a>
        </div>
        
        <div class="section-title">
            <h3>✈️ АВИАСАЛОН</h3>
            <span style="color:#8e8e98;">${getGarageCount('planes')} шт в ангаре</span>
        </div>
        
        <div class="cards-row">
            ${salonItems.planes.slice(0, 3).map(item => `
                <div class="card">
                    <div class="card-title">${item.emoji} ${item.name}</div>
                    <div class="card-sub">${formatMoney(item.price)}</div>
                    <button class="card-btn" onclick="buySalonItem('planes', ${item.id})">Купить</button>
                </div>
            `).join('')}
        </div>
        
        <div style="margin:16px 0;">
            <a href="#" class="garage-link" onclick="showSalon('planes')">Перейти в авиасалон (20 самолетов) →</a>
        </div>
        
        <div class="section-title">
            <h3>🚢 КОРАБЛЕСАЛОН</h3>
            <span style="color:#8e8e98;">${getGarageCount('ships')} шт на причале</span>
        </div>
        
        <div class="cards-row">
            ${salonItems.ships.slice(0, 3).map(item => `
                <div class="card">
                    <div class="card-title">${item.emoji} ${item.name}</div>
                    <div class="card-sub">${formatMoney(item.price)}</div>
                    <button class="card-btn" onclick="buySalonItem('ships', ${item.id})">Купить</button>
                </div>
            `).join('')}
        </div>
        
        <div style="margin:16px 0;">
            <a href="#" class="garage-link" onclick="showSalon('ships')">Перейти в кораблесалон (20 кораблей) →</a>
        </div>
        
        <div class="section-title" style="margin-top:20px;">
            <h3>🚗 ГАРАЖ</h3>
            <span style="color:#8e8e98;">${getGarageCount('cars')} шт</span>
        </div>
        
        <div style="margin-bottom:20px;">
            <a href="#" class="garage-link" onclick="showGarage('cars')">Открыть гараж →</a>
        </div>
        
        <div class="section-title">
            <h3>✈️ АНГАР</h3>
            <span style="color:#8e8e98;">${getGarageCount('planes')} шт</span>
        </div>
        
        <div style="margin-bottom:20px;">
            <a href="#" class="garage-link" onclick="showGarage('planes')">Открыть ангар →</a>
        </div>
        
        <div class="section-title">
            <h3>⚓ ПРИЧАЛ</h3>
            <span style="color:#8e8e98;">${getGarageCount('ships')} шт</span>
        </div>
        
        <div style="margin-bottom:20px;">
            <a href="#" class="garage-link" onclick="showGarage('ships')">Открыть причал →</a>
        </div>
    `;
}