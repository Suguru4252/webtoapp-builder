// ========== ПЕРЕМЕННЫЕ СОСТОЯНИЯ ==========
let rocketLaunchEnd = null;
let rocketInterval = null;
let achievementsPage = 1;
let calendarStartDate = Date.now() - (24 * 60 * 60 * 1000);
let currentUser = "ИГРОК";
let currentUserId = null;
let gameState = null;
let isAdmin = false;
let pendingAdminUser = null;
let passStartLevel = 1;
let cryptoPrices = [];

let settings = {
    soundEnabled: true,
    effectsEnabled: true
};

let specialItem = {
    id: 999,
    name: "???????",
    hiddenName: "SUGURU COIN",
    emoji: "❓",
    hiddenEmoji: "💎",
    price: 777777777777777777,
    income: 7777777 / 60,
    owned: false,
    revealed: false
};

// ========== 50 ДОМОВ ==========
const houses = [];
for (let i = 0; i < 50; i++) {
    houses.push({
        id: i,
        name: `${['Квартира', 'Дом', 'Вилла', 'Особняк', 'Замок'][i % 5]} ${Math.floor(i/5) + 1}`,
        emoji: ['🏢', '🏠', '🏡', '🏰', '🏯'][i % 5],
        price: (50000000 + (i * 20000000)) * 3,
        baseIncome: 1000 * (i + 1) * HOUSE_INCOME_MULTIPLIER / 60,
        owned: false,
        upgrades: { interior: 0, kitchen: 0, bed: 0, antenna: 0, tv: 0 }
    });
}

// ========== 10 ОСТРОВОВ ==========
const islands = [];
for (let i = 0; i < 10; i++) {
    islands.push({
        id: i,
        name: `${['Тропический', 'Вулканический', 'Ледяной', 'Пустынный', 'Райский'][i % 5]} остров ${Math.floor(i/2) + 1}`,
        emoji: ['🏝️', '🌋', '🏔️', '🏜️', '🌴'][i % 5],
        price: 1000000000 * Math.pow(5, i),
        income: 5000000 * Math.pow(2, i) / 60,
        owned: false
    });
}