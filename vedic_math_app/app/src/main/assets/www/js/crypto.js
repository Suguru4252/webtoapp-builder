// ========== КРИПТА ==========
function updateCryptoPrices() {
    cryptoPrices = cryptoPrices.map((price, i) => {
        const crypto = cryptoCurrencies[i];
        const change = (Math.random() - 0.5) * 2 * crypto.volatility;
        let newPrice = price * (1 + change);
        newPrice = Math.max(newPrice, crypto.basePrice * 0.1);
        newPrice = Math.min(newPrice, crypto.basePrice * 10);
        return Math.floor(newPrice);
    });
}

function calculateTotalCryptoPortfolio() {
    if (!gameState || !cryptoPrices) return 0;
    let total = 0;
    gameState.crypto.forEach(c => {
        if (c.owned > 0) {
            const cryptoData = cryptoCurrencies.find(cr => cr.id === c.id);
            if (cryptoData) {
                const price = cryptoPrices[c.id] || cryptoData.basePrice;
                total += price * c.owned;
            }
        }
    });
    return total;
}

function calculateTotalCryptoIncome() {
    if (!gameState) return 0;
    let total = 0;
    gameState.crypto.forEach(c => {
        if (c.owned > 0) {
            const cryptoData = cryptoCurrencies.find(cr => cr.id === c.id);
            if (cryptoData) {
                total += cryptoData.incomePerCoin * c.owned;
            }
        }
    });
    return total;
}

function openTradeModal(cryptoId, type) {
    const crypto = cryptoCurrencies.find(c => c.id === cryptoId);
    const userCrypto = gameState.crypto.find(c => c.id === cryptoId);
    const currentPrice = cryptoPrices[cryptoId] || crypto.basePrice;
    
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    const maxBuy = crypto.maxBuy - userCrypto.owned;
    const maxSell = userCrypto.owned;
    const maxBuyWithMoney = Math.floor(gameState.balance / currentPrice);
    
    let html = `
        <div class="modal-title">${type === 'buy' ? '📈 КУПИТЬ' : '📉 ПРОДАТЬ'} ${crypto.emoji} ${crypto.name}</div>
        
        <div style="background:#0f1117; border-radius:16px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>Цена:</span>
                <span style="color:#ffd700;">${formatMoney(currentPrice)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>У вас:</span>
                <span style="color:#4caf50;">${formatFullNumber(userCrypto.owned)} шт</span>
            </div>
        </div>
    `;
    
    if (type === 'buy') {
        html += `
            <div class="quick-amount-container">
                <div class="quick-amount-btn" onclick="setTradeAmount(1)">1</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(10)">10</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(100)">100</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(1000)">1K</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(10000)">10K</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(${maxBuy})">МАКС</div>
            </div>
            
            <input type="number" id="tradeAmount" class="input-field" placeholder="Количество" min="1" max="${maxBuy}" value="1">
            
            <div style="display: flex; gap: 10px; margin: 15px 0;">
                <button class="crypto-btn" onclick="quickBuyMaxMoney(${cryptoId})">💰 На все деньги (${formatFullNumber(Math.min(maxBuy, maxBuyWithMoney))} шт)</button>
            </div>
            
            <div style="background:rgba(255,215,0,0.1); border-radius:16px; padding:12px; margin:16px 0; text-align:center;">
                <span>Стоимость: </span>
                <span id="totalPrice" style="color:#ffd700; font-weight:600;">${formatMoney(currentPrice)}</span>
            </div>
            
            <button class="card-btn" onclick="executeTrade(${cryptoId}, 'buy')">✅ КУПИТЬ</button>
        `;
    } else {
        html += `
            <div class="quick-amount-container">
                <div class="quick-amount-btn" onclick="setTradeAmount(1)">1</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(10)">10</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(100)">100</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(1000)">1K</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(10000)">10K</div>
                <div class="quick-amount-btn" onclick="setTradeAmount(${maxSell})">ВСЁ</div>
            </div>
            
            <input type="number" id="tradeAmount" class="input-field" placeholder="Количество" min="1" max="${maxSell}" value="1">
            
            <div style="background:rgba(255,215,0,0.1); border-radius:16px; padding:12px; margin:16px 0; text-align:center;">
                <span>Получите: </span>
                <span id="totalPrice" style="color:#ffd700; font-weight:600;">${formatMoney(currentPrice)}</span>
            </div>
            
            <button class="card-btn" onclick="executeTrade(${cryptoId}, 'sell')">✅ ПРОДАТЬ</button>
            <button class="card-btn" style="margin-top:8px; background:#ff4444;" onclick="quickSellAll(${cryptoId})">💰 Продать всё</button>
        `;
    }
    
    html += '<div class="close-btn" onclick="closeModal(\'modal\')">ОТМЕНА</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
    
    setTimeout(() => {
        const input = document.getElementById('tradeAmount');
        if (input) {
            input.addEventListener('input', function() {
                updateTotalPrice(cryptoId, currentPrice);
            });
        }
    }, 100);
}

function setTradeAmount(amount) {
    const input = document.getElementById('tradeAmount');
    if (input) {
        input.value = amount;
        input.dispatchEvent(new Event('input'));
    }
}

function quickBuyMaxMoney(cryptoId) {
    const crypto = cryptoCurrencies.find(c => c.id === cryptoId);
    const userCrypto = gameState.crypto.find(c => c.id === cryptoId);
    const currentPrice = cryptoPrices[cryptoId] || crypto.basePrice;
    
    const maxBuy = crypto.maxBuy - userCrypto.owned;
    const maxWithMoney = Math.floor(gameState.balance / currentPrice);
    const maxPossible = Math.min(maxBuy, maxWithMoney);
    
    const input = document.getElementById('tradeAmount');
    if (input) {
        input.value = maxPossible;
        updateTotalPrice(cryptoId, currentPrice);
    }
}

function quickSellAll(cryptoId) {
    const crypto = cryptoCurrencies.find(c => c.id === cryptoId);
    const userCrypto = gameState.crypto.find(c => c.id === cryptoId);
    
    const input = document.getElementById('tradeAmount');
    if (input) {
        input.value = userCrypto.owned;
        updateTotalPrice(cryptoId, cryptoPrices[cryptoId] || crypto.basePrice);
    }
}

function updateTotalPrice(cryptoId, currentPrice) {
    const amount = parseInt(document.getElementById('tradeAmount')?.value) || 0;
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) {
        totalPriceEl.textContent = formatMoney(currentPrice * amount);
    }
}

function executeTrade(cryptoId, type) {
    const crypto = cryptoCurrencies.find(c => c.id === cryptoId);
    const userCrypto = gameState.crypto.find(c => c.id === cryptoId);
    const currentPrice = cryptoPrices[cryptoId] || crypto.basePrice;
    const amount = parseInt(document.getElementById('tradeAmount')?.value);
    
    if (!amount || amount <= 0) {
        alert('❌ Введите количество!');
        return;
    }
    
    if (type === 'buy') {
        const maxBuy = crypto.maxBuy - userCrypto.owned;
        if (amount > maxBuy) {
            alert(`❌ Можно купить только ${formatFullNumber(maxBuy)}!`);
            return;
        }
        
        const totalPrice = currentPrice * amount;
        if (gameState.balance < totalPrice) {
            alert('❌ НЕДОСТАТОЧНО МОНЕТ!');
            return;
        }
        
        gameState.balance -= totalPrice;
        userCrypto.owned += amount;
        
        const taxItem = gameState.taxes.find(t => t.type === 'crypto' && t.id === cryptoId);
        if (taxItem) {
            taxItem.value += totalPrice;
            taxItem.totalAmount = Math.floor(taxItem.value * TAX_RATE);
            taxItem.hourlyRate = taxItem.totalAmount / 72;
            taxItem.paid = false;
            taxItem.accrued = 0;
            taxItem.dueDate = Date.now() + TAX_PERIOD;
        } else {
            addTaxItem('crypto', cryptoId, totalPrice);
        }
        
        saveGame();
        updateUI();
        closeModal('modal');
        alert(`✅ Куплено ${amount} ${crypto.name} за ${formatMoney(totalPrice)}`);
        
    } else {
        if (amount > userCrypto.owned) {
            alert(`❌ У вас только ${formatFullNumber(userCrypto.owned)}!`);
            return;
        }
        
        const totalPrice = currentPrice * amount;
        gameState.balance += totalPrice;
        userCrypto.owned -= amount;
        
        if (userCrypto.owned === 0) {
            const taxIndex = gameState.taxes.findIndex(t => t.type === 'crypto' && t.id === cryptoId);
            if (taxIndex !== -1) gameState.taxes.splice(taxIndex, 1);
        }
        
        saveGame();
        updateUI();
        closeModal('modal');
        alert(`✅ Продано ${amount} ${crypto.name} за ${formatMoney(totalPrice)}`);
    }
}

function showCryptoPortfolio() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    let totalPortfolio = calculateTotalCryptoPortfolio();
    let totalIncome = calculateTotalCryptoIncome();
    
    let html = '<div class="modal-title">📊 МОЙ КРИПТОПОРТФЕЛЬ</div>';
    
    html += `
        <div style="background:rgba(123,31,162,0.2); border-radius:16px; padding:16px; margin-bottom:20px; text-align:center;">
            <div style="color:#b39ddb; font-size:14px; margin-bottom:4px;">💰 ОБЩАЯ СТОИМОСТЬ</div>
            <div style="font-size:24px; font-weight:600; color:#ffd700;">${formatMoney(totalPortfolio)}</div>
            <div style="color:#4caf50; font-size:14px; margin-top:8px;">⏱️ Доход/мин: +${formatMoney(totalIncome)}</div>
        </div>
    `;
    
    let hasCrypto = false;
    gameState.crypto.forEach(c => {
        if (c.owned > 0) {
            hasCrypto = true;
            const cryptoData = cryptoCurrencies.find(cr => cr.id === c.id);
            if (cryptoData) {
                const price = cryptoPrices[c.id] || cryptoData.basePrice;
                const value = price * c.owned;
                const income = cryptoData.incomePerCoin * c.owned;
                
                html += `
                    <div style="background:#0f1117; border-radius:16px; padding:12px; margin-bottom:8px; border-left:4px solid #00c853;">
                        <div style="display:flex; justify-content:space-between;">
                            <span style="font-weight:600; color:#00c853;">${cryptoData.emoji} ${cryptoData.name}</span>
                            <span style="color:#ffd700;">${formatFullNumber(c.owned)} шт</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:13px;">
                            <span style="color:#8e8e98;">Стоимость:</span>
                            <span style="color:#ffd700;">${formatMoney(value)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:2px; font-size:12px;">
                            <span style="color:#8e8e98;">Доход/мин:</span>
                            <span style="color:#4caf50;">+${formatMoney(income)}</span>
                        </div>
                    </div>
                `;
            }
        }
    });
    
    if (!hasCrypto) {
        html += '<div style="text-align:center; padding:30px; color:#8e8e98;">У вас пока нет криптовалюты</div>';
    }
    
    html += '<div class="close-btn" onclick="closeModal(\'modal\')">ЗАКРЫТЬ</div>';
    
    modalContent.innerHTML = html;
    modal.classList.add('active');
}