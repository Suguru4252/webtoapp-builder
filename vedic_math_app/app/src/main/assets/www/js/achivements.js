// ========== АЧИВКИ ==========
function renderAchievements() {
    achievementsPage = 1;
    let html = `
        <div class="achievements-container">
            <div class="achievements-categories" id="achievementCategories">
                <div class="achievements-category active" data-cat="all">🏆 ВСЕ</div>
                <div class="achievements-category" data-cat="easy">🟢 ЛЕГКИЕ</div>
                <div class="achievements-category" data-cat="medium">🟠 СРЕДНИЕ</div>
                <div class="achievements-category" data-cat="hard">🔴 СЛОЖНЫЕ</div>
                <div class="achievements-category" data-cat="epic">🟣 ЭПИЧЕСКИЕ</div>
            </div>
            
            <div class="achievements-grid" id="achievementsGrid"></div>
            
            <div class="achievements-pagination" id="achievementsPagination"></div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
    
    renderAchievementsGrid('all');
    
    document.querySelectorAll('.achievements-category').forEach(cat => {
        cat.addEventListener('click', function() {
            document.querySelectorAll('.achievements-category').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            achievementsPage = 1;
            renderAchievementsGrid(this.dataset.cat);
        });
    });
}

function renderAchievementsGrid(category) {
    const grid = document.getElementById('achievementsGrid');
    const pagination = document.getElementById('achievementsPagination');
    if (!grid) return;
    
    const filtered = ACHIEVEMENTS.filter(ach => {
        if (category === 'all') return true;
        if (category === 'easy' && ach.difficulty === 'easy') return true;
        if (category === 'medium' && ach.difficulty === 'medium') return true;
        if (category === 'hard' && ach.difficulty === 'hard') return true;
        if (category === 'epic' && ach.difficulty === 'epic') return true;
        return false;
    });
    
    const totalPages = Math.ceil(filtered.length / ACHIEVEMENTS_PER_PAGE);
    if (achievementsPage > totalPages) achievementsPage = totalPages;
    if (achievementsPage < 1) achievementsPage = 1;
    
    const start = (achievementsPage - 1) * ACHIEVEMENTS_PER_PAGE;
    const paginated = filtered.slice(start, start + ACHIEVEMENTS_PER_PAGE);
    
    let html = '';
    
    paginated.forEach(ach => {
        const isCompleted = gameState.achievements?.includes(ach.id);
        const isClaimed = gameState.claimedAchievements?.includes(ach.id);
        
        let current = 0;
        
        switch (ach.type) {
            case 'clicks': current = gameState.totalClicks || 0; break;
            case 'money': current = gameState.totalEarned || 0; break;
            case 'businessCount': current = gameState.myBusinesses?.length || 0; break;
            case 'cryptoAmount': current = gameState.crypto.reduce((sum, c) => sum + c.owned, 0); break;
            case 'farmCount': current = gameState.miningFarms?.length || 0; break;
            case 'houseCount': current = gameState.houses.filter(h => h.owned).length; break;
            case 'islandCount': current = gameState.islands.filter(i => i.owned).length; break;
            case 'calendarClaims': current = gameState.calendar?.claimedDays?.length || 0; break;
            case 'spaceLevel': current = gameState.space?.level || 0; break;
            case 'achievementCount': current = gameState.claimedAchievements?.length || 0; break;
        }
        
        const progress = Math.min(100, (current / ach.target) * 100);
        
        let difficultyClass = '';
        if (ach.difficulty === 'easy') difficultyClass = 'difficulty-easy';
        if (ach.difficulty === 'medium') difficultyClass = 'difficulty-medium';
        if (ach.difficulty === 'hard') difficultyClass = 'difficulty-hard';
        if (ach.difficulty === 'epic') difficultyClass = 'difficulty-epic';
        
        html += `
            <div class="achievement-card ${isClaimed ? 'completed' : ''}">
                <div class="difficulty-badge ${difficultyClass}">${ach.difficulty.toUpperCase()}</div>
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-progress">${formatNumber(current)} / ${formatNumber(ach.target)}</div>
                <div style="height:3px; background:#2a2c36; border-radius:2px; margin:5px 0;">
                    <div style="height:100%; width:${progress}%; background:${progress >= 100 ? '#4caf50' : '#ffd700'}; border-radius:2px;"></div>
                </div>
                <div class="achievement-reward">💰 +${formatMoney(ach.reward * 1000000)} 💎 +${ach.reward}</div>
                ${progress >= 100 && !isClaimed ? 
                    `<button class="achievement-claim" onclick="claimAchievement(${ach.id})">ПОЛУЧИТЬ</button>` : 
                    isClaimed ? '<span style="color:#4caf50; font-size:9px;">✓ ПОЛУЧЕНО</span>' : ''
                }
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    if (pagination) {
        let paginationHtml = '';
        paginationHtml += `<button class="pagination-btn" onclick="changeAchievementsPage(-1)" ${achievementsPage <= 1 ? 'disabled' : ''}>◀</button>`;
        paginationHtml += `<span class="pagination-info">${achievementsPage}/${totalPages}</span>`;
        paginationHtml += `<button class="pagination-btn" onclick="changeAchievementsPage(1)" ${achievementsPage >= totalPages ? 'disabled' : ''}>▶</button>`;
        pagination.innerHTML = paginationHtml;
    }
}

function changeAchievementsPage(direction) {
    achievementsPage += direction;
    const category = document.querySelector('.achievements-category.active')?.dataset.cat || 'all';
    renderAchievementsGrid(category);
}

function checkAchievements() {
    if (!gameState.achievements) gameState.achievements = [];
    
    ACHIEVEMENTS.forEach(ach => {
        if (gameState.achievements.includes(ach.id)) return;
        
        let completed = false;
        
        switch (ach.type) {
            case 'clicks':
                completed = (gameState.totalClicks || 0) >= ach.target;
                break;
            case 'money':
                completed = (gameState.totalEarned || 0) >= ach.target;
                break;
            case 'businessCount':
                completed = (gameState.myBusinesses?.length || 0) >= ach.target;
                break;
            case 'cryptoAmount':
                const total = gameState.crypto.reduce((sum, c) => sum + c.owned, 0);
                completed = total >= ach.target;
                break;
            case 'farmCount':
                completed = (gameState.miningFarms?.length || 0) >= ach.target;
                break;
            case 'houseCount':
                completed = (gameState.houses?.filter(h => h.owned).length || 0) >= ach.target;
                break;
            case 'islandCount':
                completed = (gameState.islands?.filter(i => i.owned).length || 0) >= ach.target;
                break;
            case 'calendarClaims':
                completed = (gameState.calendar?.claimedDays?.length || 0) >= ach.target;
                break;
            case 'spaceLevel':
                completed = (gameState.space?.level || 0) >= ach.target;
                break;
            case 'achievementCount':
                completed = (gameState.claimedAchievements?.length || 0) >= ach.target;
                break;
        }
        
        if (completed) {
            gameState.achievements.push(ach.id);
        }
    });
}

function claimAchievement(id) {
    if (!gameState.claimedAchievements) gameState.claimedAchievements = [];
    if (gameState.claimedAchievements.includes(id)) return;
    
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    
    if (!gameState.achievements?.includes(id)) {
        alert('❌ СНАЧАЛА ВЫПОЛНИ АЧИВКУ!');
        return;
    }
    
    gameState.claimedAchievements.push(id);
    gameState.balance += ach.reward * 1000000;
    gameState.diamonds += ach.reward;
    
    saveGame();
    updateUI();
    
    const activeCategory = document.querySelector('.achievements-category.active')?.dataset.cat || 'all';
    renderAchievementsGrid(activeCategory);
    alert(`✅ ПОЛУЧЕНО: ${ach.reward}💎 + ${formatMoney(ach.reward * 1000000)}`);
}