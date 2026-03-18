// ========== ПРОФИЛЬ ==========
function renderProfile() {
    const expNeeded = (gameState.level || 1) * 1500;
    const expPercent = ((gameState.exp || 0) / expNeeded) * 100;
    
    let businessTotal = gameState.myBusinesses?.reduce((sum, b) => sum + (b.totalEarned || 0), 0) || 0;
    let cryptoTotal = 0;
    gameState.crypto.forEach(c => {
        const cryptoData = cryptoCurrencies.find(cr => cr.id === c.id);
        if (cryptoData && c.owned > 0) {
            cryptoTotal += cryptoData.basePrice * c.owned;
        }
    });
    let miningTotal = gameState.miningFarms?.reduce((sum, f) => sum + (f.level * f.crypto.basePrice * 1000), 0) || 0;
    let housesTotal = gameState.houses.filter(h => h.owned).reduce((sum, h) => sum + h.price, 0) || 0;
    let islandsTotal = gameState.islands.filter(i => i.owned).reduce((sum, i) => sum + i.price, 0) || 0;
    let spaceTotal = SPACE_LEVELS.slice(0, gameState.space?.level || 0).reduce((sum, l) => sum + l.price, 0) || 0;
    
    const { rank } = getPlayerRank();
    
    let taxSummary = '';
    const overdueCount = gameState.taxes.filter(t => !t.paid && getTaxStatus(t) === 'overdue').length;
    const dueCount = gameState.taxes.filter(t => !t.paid && t.accrued > 0).length;
    if (overdueCount > 0) {
        taxSummary = `<span style="color:#ff4444; font-size:12px; margin-left:8px;">⚠️ Просрочено: ${overdueCount}</span>`;
    } else if (dueCount > 0) {
        taxSummary = `<span style="color:#ff9800; font-size:12px; margin-left:8px;">⏳ Налогов: ${dueCount}</span>`;
    }
    
    document.getElementById('content').innerHTML = `
        <div class="section-title">
            <h3>Профиль ${taxSummary}</h3>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Никнейм</div>
            <div class="stat-value">${currentUser}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Уровень</div>
            <div class="stat-value">${gameState.level || 1}/${MAX_PLAYER_LEVEL}</div>
        </div>
        
        <div class="level-progress">
            <div class="level-progress-bar" style="width: ${Math.min(expPercent, 100)}%"></div>
        </div>
        <div style="text-align:center; font-size:12px; color:#8e8e98; margin-top:4px;">
            ${formatNumber(gameState.exp || 0)} / ${formatNumber(expNeeded)} опыта
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Место в топе</div>
            <div class="stat-value">#${rank}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Алмазы</div>
            <div class="stat-value">💎 ${gameState.diamonds || 0}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Сила клика</div>
            <div class="stat-value">${formatMoney(BASE_CLICK_POWER * (gameState.level || 1))}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Всего кликов</div>
            <div class="stat-value">${formatNumber(gameState.totalClicks || 0)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано всего</div>
            <div class="stat-value">${formatMoney(gameState.totalEarned || 0)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано с бизнесов</div>
            <div class="stat-value">${formatMoney(businessTotal)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано с крипты</div>
            <div class="stat-value">${formatMoney(cryptoTotal)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано с майнинга</div>
            <div class="stat-value">${formatMoney(miningTotal)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано с домов</div>
            <div class="stat-value">${formatMoney(housesTotal)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано с островов</div>
            <div class="stat-value">${formatMoney(islandsTotal)}</div>
        </div>
        
        <div class="stat-box" style="margin-bottom:12px;">
            <div class="stat-label">Заработано с космоса</div>
            <div class="stat-value">${formatMoney(spaceTotal)}</div>
        </div>
        
        <div class="battle-pass">
            <div class="pass-header">
                <span class="pass-level">Боевой пропуск: ур.${gameState.battlePass?.level || 1}/200</span>
                <span class="pass-exp">⚡ ${Math.floor(gameState.battlePass?.exp || 0)}/${10000 * (gameState.battlePass?.level || 1)}</span>
            </div>
            <div class="pass-progress">
                <div class="pass-progress-bar" style="width: ${((gameState.battlePass?.exp || 0) / (10000 * (gameState.battlePass?.level || 1))) * 100}%"></div>
            </div>
            <div class="pass-timer">⏱️ Следующий пропуск через: ${getTimeUntilNextPass()}</div>
            <button class="card-btn" style="margin-top:12px;" onclick="showBattlePass()">ПОЛУЧИТЬ НАГРАДЫ</button>
        </div>
        
        <div style="background:#1a1c24; border-radius:12px; padding:16px; margin-bottom:16px;">
            <h4 style="color:#ffd700; margin-bottom:12px;">⚙️ НАСТРОЙКИ</h4>
            <div class="settings-item">
                <span class="settings-label">🔊 Звук клика</span>
                <div class="settings-switch ${settings.soundEnabled ? 'active' : ''}" onclick="toggleSound()"></div>
            </div>
            <div class="settings-item">
                <span class="settings-label">✨ Визуальные эффекты</span>
                <div class="settings-switch ${settings.effectsEnabled ? 'active' : ''}" onclick="toggleEffects()"></div>
            </div>
        </div>
        
        <button class="card-btn" onclick="showTop100()">🏆 ТОП-100 FORBES</button>
        <button class="card-btn" style="margin-top:8px;" onclick="showNicknameModal()">✏️ Изменить ник</button>
        <button class="card-btn" style="margin-top:8px; background:#ff4444;" onclick="resetGame()">🔄 Сбросить прогресс</button>
    `;
}

function getPlayerRank() {
    const allWealth = [];
    
    for (let i = 0; i < forbesTop100.length; i++) {
        allWealth.push({
            name: forbesTop100[i],
            money: (100 - i) * 1000000000000,
            isPlayer: false
        });
    }
    
    const playerMoney = gameState.totalEarned || 0;
    allWealth.push({
        name: currentUser,
        money: playerMoney,
        isPlayer: true
    });
    
    allWealth.sort((a, b) => b.money - a.money);
    
    const playerIndex = allWealth.findIndex(item => item.isPlayer);
    
    return {
        rank: playerIndex + 1,
        list: allWealth.slice(0, 100)
    };
}

function showTop100() {
    const modal = document.getElementById('topModal');
    const modalContent = document.getElementById('topModalContent');
    
    const { rank, list } = getPlayerRank();
    
    let html = '<div class="modal-title">🏆 ТОП-100 БОГАТЕЙШИХ ЛЮДЕЙ</div>';
    html += `<div style="text-align:center; margin-bottom:16px; color:#ffd700;">Ваше место: ${rank}</div>`;
    
    for (let i = 0; i < Math.min(100, list.length); i++) {
        const item = list[i];
        let rankClass = '';
        if (i === 0) rankClass = 'top-rank-1';
        else if (i === 1) rankClass = 'top-rank-2';
        else if (i === 2) rankClass = 'top-rank-3';
        
        const isPlayer = item.isPlayer;
        
        html += `
            <div class="top-item ${isPlayer ? 'top-player-highlight' : ''}">
                <div class="top-rank ${rankClass}">${i + 1}</div>
                <div class="top-name">${item.name} ${isPlayer ? '👑' : ''}</div>
                <div class="top-money">${formatMoney(item.money)}</div>
            </div>
        `;
    }
    
    html += '<div class="close-btn" onclick="closeTopModal()">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

function closeTopModal() {
    document.getElementById('topModal').classList.remove('active');
}