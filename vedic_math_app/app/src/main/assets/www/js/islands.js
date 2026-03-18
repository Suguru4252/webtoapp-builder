// ========== ОСТРОВА ==========
function buyIsland(islandId) {
    const island = gameState.islands.find(i => i.id === islandId);
    if (!island || island.owned) return;
    
    if (gameState.balance < island.price) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    gameState.balance -= island.price;
    island.owned = true;
    
    addTaxItem('island', island.id, island.price);
    
    checkAchievements();
    saveGame();
    updateUI();
    showAllIslands();
    alert(`✅ Куплен ${island.name}!`);
}

function showMyIslands() {
    const modal = document.getElementById('islandsModal');
    const modalContent = document.getElementById('islandsModalContent');
    
    let html = '<div class="modal-title">🏝️ МОИ ОСТРОВА</div>';
    
    const ownedIslands = gameState.islands.filter(i => i.owned);
    
    if (ownedIslands.length === 0) {
        html += '<div style="text-align:center; padding:30px; color:#8e8e98;">У вас нет островов</div>';
    } else {
        ownedIslands.forEach(island => {
            const taxItem = gameState.taxes.find(t => t.type === 'island' && t.id === island.id);
            const taxStatus = taxItem && !taxItem.paid && taxItem.accrued > 0 ? '⚠️' : '';
            
            html += `
                <div class="island-item">
                    <div class="island-name">${island.emoji} ${island.name} ${taxStatus}</div>
                    <div class="island-income">💰 Доход: +${formatMoney(island.income)}/мин</div>
                </div>
            `;
        });
    }
    
    html += '<div class="close-btn" onclick="closeIslandsModal()">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

function closeIslandsModal() {
    document.getElementById('islandsModal').classList.remove('active');
}

function showAllIslands() {
    const modal = document.getElementById('islandsModal');
    const modalContent = document.getElementById('islandsModalContent');
    
    let html = '<div class="modal-title">🏝️ ВСЕ ОСТРОВА</div>';
    html += '<div class="all-items-list">';
    
    gameState.islands.forEach(island => {
        if (!island.owned) {
            html += `
                <div class="island-item">
                    <div class="island-name">${island.emoji} ${island.name}</div>
                    <div class="island-income">💰 +${formatMoney(island.income)}/мин</div>
                    <div class="island-price">${formatMoney(island.price)}</div>
                    <button class="card-btn" onclick="buyIsland(${island.id}); closeIslandsModal();">Купить остров</button>
                </div>
            `;
        } else {
            const taxItem = gameState.taxes.find(t => t.type === 'island' && t.id === island.id);
            const taxStatus = taxItem && !taxItem.paid && taxItem.accrued > 0 ? '⚠️' : '';
            
            html += `
                <div class="island-item">
                    <div class="island-name">${island.emoji} ${island.name} ${taxStatus}</div>
                    <div class="island-income">💰 Доход: +${formatMoney(island.income)}/мин</div>
                </div>
            `;
        }
    });
    
    html += '</div><div class="close-btn" onclick="closeIslandsModal()">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}