// ========== БОЕВОЙ ПРОПУСК ==========
function checkBattlePassLevel() {
    if (!gameState.battlePass) {
        gameState.battlePass = { level: 1, exp: 0, claimed: [], lastReset: Date.now() };
    }
    
    if (gameState.battlePass.level >= 200) return;
    
    const expNeeded = 10000 * gameState.battlePass.level;
    
    while (gameState.battlePass.exp >= expNeeded && gameState.battlePass.level < 200) {
        gameState.battlePass.exp -= expNeeded;
        gameState.battlePass.level++;
    }
}

function getTimeUntilNextPass() {
    const now = Date.now();
    const lastReset = gameState.battlePass?.lastReset || now;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const timeLeft = oneWeek - (now - lastReset);
    
    if (timeLeft <= 0) return "Обновляется...";
    
    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${days}д ${hours}ч ${minutes}м`;
}

function claimBattlePassReward(level) {
    if (!gameState.battlePass) return;
    if (gameState.battlePass.claimed.includes(level)) return;
    if (level > gameState.battlePass.level) return;
    
    let moneyReward = level * 10000;
    gameState.balance += moneyReward;
    
    if (level % 5 === 0) {
        gameState.diamonds += 10;
    }
    
    if (level % 10 === 0) {
        const randomCrypto = cryptoCurrencies[Math.floor(Math.random() * cryptoCurrencies.length)];
        const userCrypto = gameState.crypto.find(c => c.id === randomCrypto.id);
        userCrypto.owned += 100000;
        alert(`🎉 Вы получили 100,000 ${randomCrypto.name}!`);
    }
    
    if (level === 200) {
        gameState.businessSlots = (gameState.businessSlots || MAX_BUSINESSES) + 1;
        alert('🎉 ПОЗДРАВЛЯЕМ! Вы получили +1 слот для бизнеса!');
    }
    
    gameState.battlePass.claimed.push(level);
    saveGame();
    updateUI();
    renderProfile();
    alert(`✅ Получено ${formatMoney(moneyReward)} за ${level} уровень пропуска!`);
}

function showBattlePass() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    let html = '<div class="modal-title">🎫 БОЕВОЙ ПРОПУСК</div>';
    
    const expNeeded = gameState.battlePass ? 10000 * gameState.battlePass.level : 10000;
    const timeUntilNext = getTimeUntilNextPass();
    
    html += `
        <div class="battle-pass">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>УРОВЕНЬ: ${gameState.battlePass?.level || 1}/200</span>
                <span>⚡ ОПЫТ: ${Math.floor(gameState.battlePass?.exp || 0)}/${expNeeded}</span>
            </div>
            <div class="level-progress">
                <div class="level-progress-bar" style="width: ${((gameState.battlePass?.exp || 0) / expNeeded) * 100}%"></div>
            </div>
            <div class="pass-timer">⏱️ Следующий пропуск через: ${timeUntilNext}</div>
        </div>
        
        <div class="pass-nav">
            <div class="pass-nav-btn" onclick="changePassPage(-1)">◀</div>
            <div class="pass-nav-info">УРОВНИ ${passStartLevel}-${Math.min(200, passStartLevel + PASS_LEVELS_PER_PAGE - 1)}</div>
            <div class="pass-nav-btn" onclick="changePassPage(1)">▶</div>
        </div>
    `;
    
    const endLevel = Math.min(200, passStartLevel + PASS_LEVELS_PER_PAGE - 1);
    
    for (let i = passStartLevel; i <= endLevel; i++) {
        const isClaimed = gameState.battlePass.claimed.includes(i);
        const isAvailable = i <= gameState.battlePass.level && !isClaimed;
        
        let rewardText = `💰 ${formatFullNumber(i * 10000)} монет`;
        if (i % 5 === 0) rewardText += ' + 💎 10';
        if (i % 10 === 0) rewardText += ' + 🎲 100k крипты';
        if (i === 200) rewardText = '🎁 +1 СЛОТ БИЗНЕСА';
        
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#0f1117; border-radius:12px; padding:12px; margin-bottom:8px;">
                <div>
                    <span style="font-weight:600; color:#ffd700;">Уровень ${i}</span>
                    <div style="font-size:11px; color:#8e8e98;">${rewardText}</div>
                </div>
                ${!isClaimed && i <= gameState.battlePass.level ? 
                    `<button class="card-btn" style="width:auto;" onclick="claimBattlePassReward(${i}); closeModal('modal');">Получить</button>` :
                    isClaimed ? '<span style="color:#4caf50;">✓ Получено</span>' : '<span style="color:#666;">🔒 Закрыто</span>'
                }
            </div>
        `;
    }
    
    html += '<div class="close-btn" onclick="closeModal(\'modal\')">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}

function changePassPage(direction) {
    passStartLevel += direction * PASS_LEVELS_PER_PAGE;
    if (passStartLevel < 1) passStartLevel = 1;
    if (passStartLevel > 200) passStartLevel = 191;
    showBattlePass();
}