// ========== ОФФЛАЙН ДОХОД ==========
function calculateOfflineEarnings(seconds) {
    const minutes = seconds / 60;
    let income = 0;
    
    if (gameState.autoClickerLevel > 0) {
        income += gameState.autoClickerLevel * minutes;
    }
    
    if (gameState.myBusinesses && gameState.myBusinesses.length > 0) {
        gameState.myBusinesses.forEach(b => {
            const taxItem = gameState.taxes.find(t => t.type === 'business' && t.id === b.id);
            if (!taxItem || !taxItem.paid) {
                let inc = (b.income || 0) * minutes;
                if (b.manager) {
                    inc *= (1 + b.manager.level * 0.1);
                }
                if (gameState.businessPassUpgraded) {
                    inc *= 1.5;
                }
                income += inc;
                b.totalEarned = (b.totalEarned || 0) + inc;
            }
        });
    }
    
    if (gameState.crypto && cryptoPrices) {
        gameState.crypto.forEach(c => {
            const taxItem = gameState.taxes.find(t => t.type === 'crypto' && t.id === c.id);
            if ((!taxItem || !taxItem.paid) && c.owned > 0) {
                const cryptoData = cryptoCurrencies.find(cr => cr.id === c.id);
                if (cryptoData) {
                    income += cryptoData.incomePerCoin * c.owned * minutes;
                }
            }
        });
    }
    
    if (gameState.miningFarms) {
        gameState.miningFarms.forEach(farm => {
            const taxItem = gameState.taxes.find(t => t.type === 'mining' && t.id === farm.id);
            if (!taxItem || !taxItem.paid) {
                income += farm.crypto.basePrice * farm.level * 10 / 60 * minutes;
            }
        });
    }
    
    if (gameState.houses) {
        gameState.houses.forEach(h => {
            if (h.owned) {
                const taxItem = gameState.taxes.find(t => t.type === 'house' && t.id === h.id);
                if (!taxItem || !taxItem.paid) {
                    let houseIncome = h.baseIncome;
                    const upgradeCount = Object.values(h.upgrades).reduce((a, b) => a + b, 0);
                    houseIncome *= (1 + upgradeCount);
                    income += houseIncome * minutes;
                }
            }
        });
    }
    
    if (gameState.islands) {
        gameState.islands.forEach(i => {
            if (i.owned) {
                const taxItem = gameState.taxes.find(t => t.type === 'island' && t.id === i.id);
                if (!taxItem || !taxItem.paid) {
                    income += i.income * minutes;
                }
            }
        });
    }
    
    if (specialItem.owned) {
        income += specialItem.income * minutes;
    }
    
    if (income > 0) {
        const earned = Math.floor(income);
        gameState.balance = (gameState.balance || 0) + earned;
        gameState.totalEarned = (gameState.totalEarned || 0) + earned;
    }
}