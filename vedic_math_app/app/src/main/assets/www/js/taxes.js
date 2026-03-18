// ========== НАЛОГИ ==========
function addTaxItem(type, id, value) {
    if (!gameState.taxes) gameState.taxes = [];
    
    const existing = gameState.taxes.find(t => t.type === type && t.id === id);
    const totalAmount = Math.floor(value * TAX_RATE);
    
    if (existing) {
        existing.value = value;
        existing.totalAmount = totalAmount;
        existing.hourlyRate = totalAmount / 72;
        existing.paid = false;
        existing.accrued = 0;
        existing.dueDate = Date.now() + TAX_PERIOD;
        existing.lastUpdate = Date.now();
        return;
    }
    
    gameState.taxes.push({
        type: type,
        id: id,
        value: value,
        totalAmount: totalAmount,
        hourlyRate: totalAmount / 72,
        accrued: 0,
        dueDate: Date.now() + TAX_PERIOD,
        paid: false,
        lastUpdate: Date.now()
    });
}

function updateTaxes() {
    if (!gameState.taxes) return;
    const now = Date.now();
    
    gameState.taxes.forEach(tax => {
        if (!tax.paid) {
            const timePassed = Math.min(60 * 60 * 1000, now - (tax.lastUpdate || now));
            tax.accrued += (tax.hourlyRate * timePassed) / (60 * 60 * 1000);
            if (tax.accrued > tax.totalAmount) {
                tax.accrued = tax.totalAmount;
            }
            tax.lastUpdate = now;
        }
    });
}

function payTax(index) {
    const tax = gameState.taxes[index];
    if (!tax) return false;
    
    const amountToPay = Math.floor(tax.accrued);
    
    if (amountToPay <= 0) {
        alert('❌ НЕТ НАЧИСЛЕННЫХ НАЛОГОВ!');
        return false;
    }
    
    if (gameState.balance < amountToPay) {
        alert('❌ НЕДОСТАТОЧНО МОНЕТ ДЛЯ УПЛАТЫ НАЛОГА!');
        return false;
    }
    
    gameState.balance -= amountToPay;
    
    tax.paid = true;
    tax.accrued = 0;
    tax.dueDate = Date.now() + TAX_PERIOD;
    tax.paid = false;
    tax.lastUpdate = Date.now();
    
    saveGame();
    updateUI();
    renderTax();
    alert(`✅ Налог оплачен: ${formatMoney(amountToPay)}`);
    return true;
}

function getTaxStatus(taxItem) {
    if (!taxItem) return 'none';
    if (taxItem.paid) return 'paid';
    const timeLeft = taxItem.dueDate - Date.now();
    if (timeLeft < 0) return 'overdue';
    if (timeLeft < 12 * 60 * 60 * 1000) return 'soon';
    return 'normal';
}

function getTaxProgress(taxItem) {
    if (!taxItem) return 0;
    return (taxItem.accrued / taxItem.totalAmount) * 100;
}

function getTimeLeft(taxItem) {
    if (!taxItem) return 0;
    const timeLeft = taxItem.dueDate - Date.now();
    if (timeLeft < 0) return 0;
    return timeLeft;
}

function renderTax() {
    let totalTaxDue = 0;
    let overdueCount = 0;
    let soonCount = 0;
    
    gameState.taxes.forEach(tax => {
        const status = getTaxStatus(tax);
        if (status === 'overdue') overdueCount++;
        else if (status === 'soon') soonCount++;
        if (!tax.paid && tax.accrued > 0) totalTaxDue += tax.accrued;
    });
    
    let html = `
        <div class="tax-summary">
            <div class="tax-summary-title">💰 НАЛОГОВ К ОПЛАТЕ СЕЙЧАС</div>
            <div class="tax-summary-value">${formatMoney(Math.floor(totalTaxDue))}</div>
            <div class="tax-summary-sub">
                ⚠️ Просрочено: ${overdueCount} | ⏳ Скоро: ${soonCount}
            </div>
        </div>
    `;
    
    if (gameState.taxes.length === 0) {
        html += '<div style="text-align:center; padding:30px; color:#8e8e98;">У вас нет активных налогов</div>';
    } else {
        const businessTaxes = gameState.taxes.filter(t => t.type === 'business');
        if (businessTaxes.length > 0) {
            html += '<h4 style="color:#ffd700; margin:16px 0 8px;">💼 БИЗНЕСЫ</h4>';
            businessTaxes.forEach((tax, index) => {
                const business = gameState.myBusinesses.find(b => b.id === tax.id);
                if (!business) return;
                
                const status = getTaxStatus(tax);
                let statusClass = '';
                if (status === 'paid') statusClass = 'tax-paid';
                else if (status === 'overdue') statusClass = 'tax-overdue';
                else if (status === 'soon') statusClass = 'tax-soon';
                
                const progress = getTaxProgress(tax);
                const timeLeft = getTimeLeft(tax);
                
                html += `
                    <div class="tax-item ${statusClass}">
                        <div class="tax-header">
                            <span class="tax-name">${business.name}</span>
                            <span class="tax-amount">${formatMoney(Math.floor(tax.accrued))} / ${formatMoney(tax.totalAmount)}</span>
                        </div>
                        <div class="tax-price">💰 Стоимость: ${formatMoney(tax.value)}</div>
                        <div class="tax-progress">
                            <div class="tax-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="tax-timer">⏱️ До сброса: ${formatTimeShort(timeLeft)}</div>
                        ${!tax.paid && tax.accrued > 0 ? 
                            `<button class="tax-btn" onclick="payTaxByIndex(${gameState.taxes.indexOf(tax)})">ОПЛАТИТЬ ${formatMoney(Math.floor(tax.accrued))}</button>` :
                            tax.paid ? `<div class="tax-paid-status">✓ Оплачено</div>` : ''
                        }
                    </div>
                `;
            });
        }
        
        const houseTaxes = gameState.taxes.filter(t => t.type === 'house');
        if (houseTaxes.length > 0) {
            html += '<h4 style="color:#ffd700; margin:16px 0 8px;">🏠 ДОМА</h4>';
            houseTaxes.forEach((tax, index) => {
                const house = gameState.houses.find(h => h.id === tax.id);
                if (!house) return;
                
                const status = getTaxStatus(tax);
                let statusClass = '';
                if (status === 'paid') statusClass = 'tax-paid';
                else if (status === 'overdue') statusClass = 'tax-overdue';
                else if (status === 'soon') statusClass = 'tax-soon';
                
                const progress = getTaxProgress(tax);
                const timeLeft = getTimeLeft(tax);
                
                html += `
                    <div class="tax-item ${statusClass}">
                        <div class="tax-header">
                            <span class="tax-name">${house.emoji} ${house.name}</span>
                            <span class="tax-amount">${formatMoney(Math.floor(tax.accrued))} / ${formatMoney(tax.totalAmount)}</span>
                        </div>
                        <div class="tax-price">💰 Стоимость: ${formatMoney(tax.value)}</div>
                        <div class="tax-progress">
                            <div class="tax-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="tax-timer">⏱️ До сброса: ${formatTimeShort(timeLeft)}</div>
                        ${!tax.paid && tax.accrued > 0 ? 
                            `<button class="tax-btn" onclick="payTaxByIndex(${gameState.taxes.indexOf(tax)})">ОПЛАТИТЬ ${formatMoney(Math.floor(tax.accrued))}</button>` :
                            tax.paid ? `<div class="tax-paid-status">✓ Оплачено</div>` : ''
                        }
                    </div>
                `;
            });
        }
        
        const cryptoTaxes = gameState.taxes.filter(t => t.type === 'crypto');
        if (cryptoTaxes.length > 0) {
            html += '<h4 style="color:#ffd700; margin:16px 0 8px;">📈 КРИПТА</h4>';
            cryptoTaxes.forEach((tax, index) => {
                const crypto = cryptoCurrencies.find(c => c.id === tax.id);
                if (!crypto) return;
                
                const userCrypto = gameState.crypto.find(c => c.id === tax.id);
                if (!userCrypto || userCrypto.owned === 0) return;
                
                const status = getTaxStatus(tax);
                let statusClass = '';
                if (status === 'paid') statusClass = 'tax-paid';
                else if (status === 'overdue') statusClass = 'tax-overdue';
                else if (status === 'soon') statusClass = 'tax-soon';
                
                const progress = getTaxProgress(tax);
                const timeLeft = getTimeLeft(tax);
                
                html += `
                    <div class="tax-item ${statusClass}">
                        <div class="tax-header">
                            <span class="tax-name">${crypto.emoji} ${crypto.name}</span>
                            <span class="tax-amount">${formatMoney(Math.floor(tax.accrued))} / ${formatMoney(tax.totalAmount)}</span>
                        </div>
                        <div class="tax-price">💰 Инвестиции: ${formatMoney(tax.value)}</div>
                        <div class="tax-progress">
                            <div class="tax-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="tax-timer">⏱️ До сброса: ${formatTimeShort(timeLeft)}</div>
                        <div style="font-size:11px; color:#8e8e98; margin-bottom:4px;">
                            Владею: ${formatFullNumber(userCrypto.owned)} шт
                        </div>
                        ${!tax.paid && tax.accrued > 0 ? 
                            `<button class="tax-btn" onclick="payTaxByIndex(${gameState.taxes.indexOf(tax)})">ОПЛАТИТЬ ${formatMoney(Math.floor(tax.accrued))}</button>` :
                            tax.paid ? `<div class="tax-paid-status">✓ Оплачено</div>` : ''
                        }
                    </div>
                `;
            });
        }
        
        const miningTaxes = gameState.taxes.filter(t => t.type === 'mining');
        if (miningTaxes.length > 0) {
            html += '<h4 style="color:#ffd700; margin:16px 0 8px;">⛏️ МАЙНИНГ</h4>';
            miningTaxes.forEach((tax, index) => {
                const farm = gameState.miningFarms.find(f => f.id === tax.id);
                if (!farm) return;
                
                const status = getTaxStatus(tax);
                let statusClass = '';
                if (status === 'paid') statusClass = 'tax-paid';
                else if (status === 'overdue') statusClass = 'tax-overdue';
                else if (status === 'soon') statusClass = 'tax-soon';
                
                const progress = getTaxProgress(tax);
                const timeLeft = getTimeLeft(tax);
                
                html += `
                    <div class="tax-item ${statusClass}">
                        <div class="tax-header">
                            <span class="tax-name">${farm.crypto.emoji} ${farm.crypto.name} (ур.${farm.level})</span>
                            <span class="tax-amount">${formatMoney(Math.floor(tax.accrued))} / ${formatMoney(tax.totalAmount)}</span>
                        </div>
                        <div class="tax-price">💰 Стоимость: ${formatMoney(tax.value)}</div>
                        <div class="tax-progress">
                            <div class="tax-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="tax-timer">⏱️ До сброса: ${formatTimeShort(timeLeft)}</div>
                        ${!tax.paid && tax.accrued > 0 ? 
                            `<button class="tax-btn" onclick="payTaxByIndex(${gameState.taxes.indexOf(tax)})">ОПЛАТИТЬ ${formatMoney(Math.floor(tax.accrued))}</button>` :
                            tax.paid ? `<div class="tax-paid-status">✓ Оплачено</div>` : ''
                        }
                    </div>
                `;
            });
        }
        
        const islandTaxes = gameState.taxes.filter(t => t.type === 'island');
        if (islandTaxes.length > 0) {
            html += '<h4 style="color:#ffd700; margin:16px 0 8px;">🏝️ ОСТРОВА</h4>';
            islandTaxes.forEach((tax, index) => {
                const island = gameState.islands.find(i => i.id === tax.id);
                if (!island) return;
                
                const status = getTaxStatus(tax);
                let statusClass = '';
                if (status === 'paid') statusClass = 'tax-paid';
                else if (status === 'overdue') statusClass = 'tax-overdue';
                else if (status === 'soon') statusClass = 'tax-soon';
                
                const progress = getTaxProgress(tax);
                const timeLeft = getTimeLeft(tax);
                
                html += `
                    <div class="tax-item ${statusClass}">
                        <div class="tax-header">
                            <span class="tax-name">${island.emoji} ${island.name}</span>
                            <span class="tax-amount">${formatMoney(Math.floor(tax.accrued))} / ${formatMoney(tax.totalAmount)}</span>
                        </div>
                        <div class="tax-price">💰 Стоимость: ${formatMoney(tax.value)}</div>
                        <div class="tax-progress">
                            <div class="tax-progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <div class="tax-timer">⏱️ До сброса: ${formatTimeShort(timeLeft)}</div>
                        ${!tax.paid && tax.accrued > 0 ? 
                            `<button class="tax-btn" onclick="payTaxByIndex(${gameState.taxes.indexOf(tax)})">ОПЛАТИТЬ ${formatMoney(Math.floor(tax.accrued))}</button>` :
                            tax.paid ? `<div class="tax-paid-status">✓ Оплачено</div>` : ''
                        }
                    </div>
                `;
            });
        }
    }
    
    document.getElementById('content').innerHTML = html;
}

function payTaxByIndex(index) {
    payTax(index);
}