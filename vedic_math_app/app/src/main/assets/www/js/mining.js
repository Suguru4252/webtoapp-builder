// ========== МАЙНИНГ ==========
function buyMiningFarm() {
    if (gameState.miningFarms.length >= MAX_MINING_FARMS) {
        alert(`❌ МАКСИМУМ ${MAX_MINING_FARMS} ФЕРМ!`);
        return;
    }
    
    const cost = 1000000000;
    if (gameState.balance < cost) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    gameState.balance -= cost;
    
    if (!gameState.miningFarms) gameState.miningFarms = [];
    
    const newFarm = {
        id: Date.now(),
        level: 1,
        crypto: miningCryptos[Math.floor(Math.random() * miningCryptos.length)],
        progress: 0,
        maxProgress: 100,
        lastUpdate: Date.now()
    };
    
    gameState.miningFarms.push(newFarm);
    
    addTaxItem('mining', newFarm.id, cost);
    
    checkAchievements();
    saveGame();
    updateUI();
    renderMining();
}

function upgradeMiningFarm(index) {
    const farm = gameState.miningFarms[index];
    if (!farm) return;
    
    if (farm.level >= MAX_FARM_LEVEL) {
        alert(`❌ МАКСИМАЛЬНЫЙ УРОВЕНЬ ${MAX_FARM_LEVEL}!`);
        return;
    }
    
    const cost = 2000000000 * farm.level;
    if (gameState.balance < cost) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
        return;
    }
    
    gameState.balance -= cost;
    farm.level++;
    
    const taxItem = gameState.taxes.find(t => t.type === 'mining' && t.id === farm.id);
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
    renderMining();
}

function sellMiningFarm(index) {
    const farm = gameState.miningFarms[index];
    if (!farm) return;
    
    const taxItem = gameState.taxes.find(t => t.type === 'mining' && t.id === farm.id);
    const baseValue = taxItem ? taxItem.value : 1000000000 + (farm.level - 1) * 2000000000;
    const sellPrice = Math.floor(baseValue * 0.5);
    
    if (confirm(`Продать ферму за ${formatMoney(sellPrice)}💰?`)) {
        gameState.miningFarms.splice(index, 1);
        if (taxItem) {
            const taxIndex = gameState.taxes.findIndex(t => t.type === 'mining' && t.id === farm.id);
            if (taxIndex !== -1) gameState.taxes.splice(taxIndex, 1);
        }
        gameState.balance += sellPrice;
        
        saveGame();
        updateUI();
        renderMining();
    }
}

function renderMining() {
    let html = '<div class="section-title"><h3>⛏️ КРИПТО-МАЙНИНГ</h3></div>';
    html += `<div style="text-align:center; margin:10px 0; color:#8e8e98;">📊 ФЕРМ: ${gameState.miningFarms?.length || 0}/${MAX_MINING_FARMS}</div>`;
    
    if (!gameState.miningFarms || gameState.miningFarms.length === 0) {
        html += '<div style="text-align:center; padding:30px; color:#8e8e98;">У вас нет майнинг-ферм</div>';
    } else {
        gameState.miningFarms.forEach((farm, index) => {
            const taxItem = gameState.taxes.find(t => t.type === 'mining' && t.id === farm.id);
            const taxStatus = taxItem && !taxItem.paid && taxItem.accrued > 0 ? '⚠️' : '';
            
            html += `
                <div class="mining-farm">
                    <div class="farm-header">
                        <span class="farm-name">${farm.crypto.emoji} ${farm.crypto.name} ${taxStatus}</span>
                        <span class="farm-level">УРОВЕНЬ ${farm.level}/${MAX_FARM_LEVEL}</span>
                    </div>
                    <div class="farm-income">💰 ДОХОД: +${formatMoney(farm.crypto.basePrice * farm.level * 10 / 60)}/мин</div>
                    ${taxItem ? `
                        <div style="font-size:12px; color:#ff9800; margin:5px 0;">
                            Налог: ${formatMoney(Math.floor(taxItem.accrued))} / ${formatMoney(taxItem.totalAmount)}
                        </div>
                    ` : ''}
                    <div class="farm-actions">
                        <button class="farm-btn" onclick="upgradeMiningFarm(${index})">📈 Улучшить (${formatMoney(2000000000 * farm.level)})</button>
                        <button class="farm-btn" style="background:#ff4444;" onclick="sellMiningFarm(${index})">💰 Продать</button>
                    </div>
                </div>
            `;
        });
    }
    
    if (gameState.miningFarms.length < MAX_MINING_FARMS) {
        html += '<button class="card-btn" style="margin-top:16px;" onclick="buyMiningFarm()">+ КУПИТЬ ФЕРМУ (1.000.000.000💰)</button>';
    }
    
    document.getElementById('content').innerHTML = html;
}