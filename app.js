// Mock Data
const transactions = [
    {
        id: 1,
        merchant: "GetirYemek - Burger King",
        amount: 235.50,
        category: "Yemek",
        icon: "fa-burger"
    },
    {
        id: 2,
        merchant: "BiTaksi - Yolculuk",
        amount: 142.00,
        category: "Ulaşım",
        icon: "fa-taxi"
    },
    {
        id: 3,
        merchant: "GetirBüyük - Haftalık",
        amount: 840.25,
        category: "Market",
        icon: "fa-basket-shopping"
    },
    {
        id: 4,
        merchant: "n11 - Kulaklık",
        amount: 499.90,
        category: "Alışveriş",
        icon: "fa-bag-shopping"
    }
];

const TARGET_BALANCE = 14250;

// Merchant Pool (Getir Ecosystem Only)
const merchantPool = [
    { name: "GetirYemek - Burger King", icon: "fa-burger", range: [180, 350] },
    { name: "GetirBüyük - Haftalık", icon: "fa-basket-shopping", range: [600, 1200] },
    { name: "BiTaksi - Yolculuk", icon: "fa-taxi", range: [120, 250] },
    { name: "GetirSu - Damacana", icon: "fa-bottle-water", range: [90, 150] },
    { name: "n11 - Teknoloji", icon: "fa-laptop", range: [300, 1500] }
];

// Round Up Logic (Round to nearest 10 TL)
function calculateRoundUp(amount) {
    // Logic: If amount is 237.50, next 10 is 240.00. Diff is 2.50.
    // If amount is 142.00, next 10 is 150.00. Diff is 8.00.

    const remainder = amount % 10;
    if (remainder === 0) return 10.00; // If exact multiple of 10, save 10 TL

    const nextMultiple = amount + (10 - remainder);
    return nextMultiple - amount;
}

// Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Count Up Animation
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Ease out quart
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        const currentVal = Math.floor(progress * (end - start) + start);
        obj.innerHTML = new Intl.NumberFormat('tr-TR').format(currentVal);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = new Intl.NumberFormat('tr-TR').format(end);
        }
    };
    window.requestAnimationFrame(step);
}

// Render
function renderApp() {
    const list = document.getElementById('transaction-list');
    const loopTotalEl = document.getElementById('loop-total');
    let totalLoopSavings = 0;
    let html = '';

    transactions.forEach(tx => {
        const roundUpAmount = calculateRoundUp(tx.amount);
        totalLoopSavings += roundUpAmount;

        html += `
            <div class="transaction-item">
                <div class="t-icon">
                    <i class="fa-solid ${tx.icon}"></i>
                </div>
                <div class="t-info">
                    <div class="t-merchant">${tx.merchant}</div>
                    <div class="t-category">${tx.category}</div>
                </div>
                <div class="t-amount-group">
                    <span class="t-amount">-${formatCurrency(tx.amount)} TL</span>
                    <div class="t-loop-info">
                        🟣 +${formatCurrency(roundUpAmount)} TL Loop'a atıldı
                    </div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
    loopTotalEl.innerHTML = `${formatCurrency(totalLoopSavings)} TL`;
}

// Simulate Spend Function
function simulateSpend() {
    // 1. Pick random merchant from pool
    const randomMerchant = merchantPool[Math.floor(Math.random() * merchantPool.length)];
    
    // 2. Generate random amount in range
    const [min, max] = randomMerchant.range;
    const randomAmount = Math.random() * (max - min) + min;
    
    // 3. Round to nearest hundredth (for display)
    const amount = Math.round(randomAmount * 100) / 100;
    
    // 4. Calculate round-up to nearest 10 TL
    const roundUpAmount = calculateRoundUp(amount);
    
    // 5. Create new transaction object
    const newTransaction = {
        id: Date.now(), // Unique ID based on timestamp
        merchant: randomMerchant.name,
        amount: amount,
        category: getCategoryName(randomMerchant.name),
        icon: randomMerchant.icon,
        loopAmount: roundUpAmount
    };
    
    // 6. Add to beginning of transactions array
    transactions.unshift(newTransaction);
    
    // 7. Update DOM with animation
    updateTransactionList(newTransaction);
    updateBalances(roundUpAmount);
}

// Helper: Get category name based on merchant
function getCategoryName(merchantName) {
    if (merchantName.includes("Yemek")) return "Yemek";
    if (merchantName.includes("Taksi")) return "Ulaşım";
    if (merchantName.includes("Büyük")) return "Market";
    if (merchantName.includes("Su")) return "İçecek";
    if (merchantName.includes("n11")) return "Alışveriş";
    return "Diğer";
}

// Update transaction list (prepend with animation)
function updateTransactionList(transaction) {
    const list = document.getElementById('transaction-list');
    
    const html = `
        <div class="transaction-item slide-in">
            <div class="t-icon">
                <i class="fa-solid ${transaction.icon}"></i>
            </div>
            <div class="t-info">
                <div class="t-merchant">${transaction.merchant}</div>
                <div class="t-category">${transaction.category}</div>
            </div>
            <div class="t-amount-group">
                <span class="t-amount">-${formatCurrency(transaction.amount)} TL</span>
                <div class="t-loop-info">
                    🟣 +${formatCurrency(transaction.loopAmount)} TL Loop'a atıldı
                </div>
            </div>
        </div>
    `;
    
    // Create temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const newElement = temp.firstElementChild;
    
    // Prepend to list
    list.insertBefore(newElement, list.firstChild);
}

// Update balances with pulse animation
function updateBalances(loopAmount) {
    const totalBalanceEl = document.getElementById('total-balance');
    const loopTotalEl = document.getElementById('loop-total');
    
    // Get current values
    let currentTotal = parseInt(totalBalanceEl.textContent.replace(/\./g, ''));
    let currentLoopText = loopTotalEl.textContent;
    let currentLoopAmount = parseFloat(currentLoopText.replace(/\./g, '').replace(',', '.'));
    
    // Calculate new values
    const newTotal = currentTotal + loopAmount;
    const newLoopAmount = currentLoopAmount + loopAmount;
    
    // Add pulse animation
    totalBalanceEl.classList.add('pulse-animation');
    loopTotalEl.classList.add('pulse-animation');
    
    // Remove animation class after animation ends
    setTimeout(() => {
        totalBalanceEl.classList.remove('pulse-animation');
        loopTotalEl.classList.remove('pulse-animation');
    }, 400);
    
    // Update values
    totalBalanceEl.textContent = new Intl.NumberFormat('tr-TR').format(newTotal);
    loopTotalEl.textContent = formatCurrency(newLoopAmount);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('total-balance');
    const simulateBtn = document.getElementById('simulate-btn');

    // Start animations
    setTimeout(() => {
        animateValue(balanceElement, 0, TARGET_BALANCE, 1500);
    }, 300);

    renderApp();
    
    // Add simulate button event listener
    simulateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        simulateSpend();
    });
});
