// ========== ДОМА ==========
function buyHouse(houseId) {
    const house = gameState.houses.find(h => h.id === houseId);
    if (!house || house.owned) return;
    
    if (gameState.balance < house.price) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    gameState.balance -= house.price;
    house.owned = true;
    
    addTaxItem('house', house.id, house.price);
    
    checkAchievements();
    saveGame();
    updateUI();
    showAllHouses();
    alert(`✅ Куплен дом ${house.name}!`);
}

function sellHouse(houseId) {
    const house = gameState.houses.find(h => h.id === houseId);
    if (!house || !house.owned) return;
    
    const taxItem = gameState.taxes.find(t => t.type === 'house' && t.id === house.id);
    const sellPrice = Math.floor(house.price * 0.5);
    
    if (confirm(`Продать дом ${house.name} за ${formatMoney(sellPrice)}?`)) {
        house.owned = false;
        house.upgrades = { interior: 0, kitchen: 0, bed: 0, antenna: 0, tv: 0 };
        gameState.balance += sellPrice;
        
        if (taxItem) {
            const taxIndex = gameState.taxes.findIndex(t => t.type === 'house' && t.id === house.id);
            if (taxIndex !== -1) gameState.taxes.splice(taxIndex, 1);
        }
        
        saveGame();
        updateUI();
        showAllHouses();
        alert(`✅ Дом продан! +${formatMoney(sellPrice)}`);
    }
}

function upgradeHouse(houseId, upgradeType) {
    const house = gameState.houses.find(h => h.id === houseId);
    if (!house || !house.owned) return;
    
    const totalUpgrades = Object.values(house.upgrades).reduce((a, b) => a + b, 0);
    if (totalUpgrades >= MAX_HOUSE_UPGRADES) {
        alert(`❌ МАКСИМУМ ${MAX_HOUSE_UPGRADES} УЛУЧШЕНИЙ ДЛЯ ДОМА!`);
        return;
    }
    
    const costs = {
        interior: 50000000 * Math.pow(2, house.upgrades.interior),
        kitchen: 100000000 * Math.pow(2, house.upgrades.kitchen),
        bed: 150000000 * Math.pow(2, house.upgrades.bed),
        antenna: 200000000 * Math.pow(2, house.upgrades.antenna),
        tv: 300000000 * Math.pow(2, house.upgrades.tv)
    };
    
    const cost = costs[upgradeType];
    if (gameState.balance < cost) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    gameState.balance -= cost;
    house.upgrades[upgradeType]++;
    
    const taxItem = gameState.taxes.find(t => t.type === 'house' && t.id === house.id);
    if (taxItem) {
        taxItem.value += cost;
        taxItem.totalAmount = Math.floor(taxItem.value * TAX_RATE);
        taxItem.hourlyRate = taxItem.totalAmount / 72;
        taxItem.paid = false;
        taxItem.accrued = 0;
        taxItem.dueDate = Date.now() + TAX_PERIOD;
    }
    
    saveGame();
    updateUI();
    openHouseModal(houseId);
    alert(`✅ Улучшение ${upgradeType} дома выполнено!`);
}

function showAllHouses() {
    const modal = document.getElementById('housesModal');
    const modalContent = document.getElementById('housesModalContent');
    
    let html = '<div class="modal-title">🏠 ВСЕ ДОМА</div>';
    html += '<div class="all-items-list">';
    
    gameState.houses.forEach(house => {
        const isOwned = house.owned;
        const taxItem = gameState.taxes.find(t => t.type === 'house' && t.id === house.id);
        const taxStatus = taxItem && !taxItem.paid && taxItem.accrued > 0 ? '⚠️' : '';
        
        const totalUpgrades = Object.values(house.upgrades).reduce((a, b) => a + b, 0);
        const houseIncome = house.baseIncome * (1 + totalUpgrades);
        const sellPrice = Math.floor(house.price * 0.5);
        
        if (isOwned) {
            html += `
                <div class="house-item">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="font-size:32px;">${house.emoji}</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;">${house.name} ${taxStatus}</div>
                            <div style="color:#4caf50;">💰 +${formatMoney(houseIncome)}/мин</div>
                            <div style="color:#8e8e98; font-size:12px;">Улучшений: ${totalUpgrades}/${MAX_HOUSE_UPGRADES}</div>
                            <div style="display:flex; gap:8px; margin-top:8px;">
                                <button class="card-btn" style="width:auto; background:#7b1fa2;" onclick="openHouseModal(${house.id}); closeHousesModal();">Улучшить</button>
                                <button class="sell-btn" onclick="sellHouse(${house.id}); closeHousesModal();">Продать за ${formatMoney(sellPrice)}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="house-item">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="font-size:32px;">${house.emoji}</div>
                        <div style="flex:1;">
                            <div style="font-weight:600;">${house.name}</div>
                            <div style="color:#ffd700;">${formatMoney(house.price)}</div>
                            <div style="color:#4caf50; font-size:12px;">💰 +${formatMoney(house.baseIncome)}/мин</div>
                            <button class="card-btn" style="margin-top:8px;" onclick="buyHouse(${house.id}); closeHousesModal();">Купить</button>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div><div class="close-btn" onclick="closeHousesModal()">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

function closeHousesModal() {
    document.getElementById('housesModal').classList.remove('active');
}

function openHouseModal(houseId) {
    const house = gameState.houses.find(h => h.id === houseId);
    if (!house) return;
    
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    const totalUpgrades = Object.values(house.upgrades).reduce((a, b) => a + b, 0);
    const houseIncome = house.baseIncome * (1 + totalUpgrades);
    
    let html = `
        <div class="modal-title">${house.emoji} ${house.name}</div>
        <div style="background:#0f1117; border-radius:16px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>Текущий доход</span>
                <span style="color:#4caf50;">+${formatMoney(houseIncome)}/мин</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>Доступно улучшений</span>
                <span style="color:#ffd700;">${MAX_HOUSE_UPGRADES - totalUpgrades}</span>
            </div>
        </div>
        <div style="background:#0f1117; border-radius:16px; padding:16px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div>
                    <div style="color:#8e8e98;">Интерьер</div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Ур. ${house.upgrades.interior}</span>
                        ${totalUpgrades < MAX_HOUSE_UPGRADES ? 
                            `<button class="card-btn" style="width:auto; background:#7b1fa2;" onclick="upgradeHouse(${house.id}, 'interior'); closeModal('modal');">+ (${formatMoney(50000000 * Math.pow(2, house.upgrades.interior))})</button>` :
                            '<span style="color:#ff4444;">Макс</span>'
                        }
                    </div>
                </div>
                <div>
                    <div style="color:#8e8e98;">Кухня</div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Ур. ${house.upgrades.kitchen}</span>
                        ${totalUpgrades < MAX_HOUSE_UPGRADES ? 
                            `<button class="card-btn" style="width:auto; background:#7b1fa2;" onclick="upgradeHouse(${house.id}, 'kitchen'); closeModal('modal');">+ (${formatMoney(100000000 * Math.pow(2, house.upgrades.kitchen))})</button>` :
                            '<span style="color:#ff4444;">Макс</span>'
                        }
                    </div>
                </div>
                <div>
                    <div style="color:#8e8e98;">Кровать</div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Ур. ${house.upgrades.bed}</span>
                        ${totalUpgrades < MAX_HOUSE_UPGRADES ? 
                            `<button class="card-btn" style="width:auto; background:#7b1fa2;" onclick="upgradeHouse(${house.id}, 'bed'); closeModal('modal');">+ (${formatMoney(150000000 * Math.pow(2, house.upgrades.bed))})</button>` :
                            '<span style="color:#ff4444;">Макс</span>'
                        }
                    </div>
                </div>
                <div>
                    <div style="color:#8e8e98;">Антенна</div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Ур. ${house.upgrades.antenna}</span>
                        ${totalUpgrades < MAX_HOUSE_UPGRADES ? 
                            `<button class="card-btn" style="width:auto; background:#7b1fa2;" onclick="upgradeHouse(${house.id}, 'antenna'); closeModal('modal');">+ (${formatMoney(200000000 * Math.pow(2, house.upgrades.antenna))})</button>` :
                            '<span style="color:#ff4444;">Макс</span>'
                        }
                    </div>
                </div>
                <div>
                    <div style="color:#8e8e98;">Телевизор</div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Ур. ${house.upgrades.tv}</span>
                        ${totalUpgrades < MAX_HOUSE_UPGRADES ? 
                            `<button class="card-btn" style="width:auto; background:#7b1fa2;" onclick="upgradeHouse(${house.id}, 'tv'); closeModal('modal');">+ (${formatMoney(300000000 * Math.pow(2, house.upgrades.tv))})</button>` :
                            '<span style="color:#ff4444;">Макс</span>'
                        }
                    </div>
                </div>
            </div>
        </div>
        <div class="close-btn" onclick="closeModal('modal')">ЗАКРЫТЬ</div>
    `;
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}