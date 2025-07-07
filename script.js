document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const incomeForm = document.getElementById('income-form');
    const incomeInput = document.getElementById('income-input');
    const transactionForm = document.getElementById('transaction-form');
    const incomeDisplay = document.getElementById('income-display');
    const expensesDisplay = document.getElementById('expenses-display');
    const balanceDisplay = document.getElementById('balance-display');
    const transactionList = document.getElementById('transaction-list');

    // State Management
    let monthlyIncome = JSON.parse(localStorage.getItem('monthlyIncome')) || 0;
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // --- Functions ---

    function saveState() {
        localStorage.setItem('monthlyIncome', JSON.stringify(monthlyIncome));
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function render() {
        // Calculate current month's expenses
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyExpenses = transactions.reduce((total, tx) => {
            const txDate = new Date(tx.date);
            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                return total + tx.amount;
            }
            return total;
        }, 0);

        const balance = monthlyIncome - monthlyExpenses;

        // Update summary display
        incomeDisplay.textContent = `฿${monthlyIncome.toFixed(2)}`;
        expensesDisplay.textContent = `฿${monthlyExpenses.toFixed(2)}`;
        balanceDisplay.textContent = `฿${balance.toFixed(2)}`;
        
        // Update transaction list
        transactionList.innerHTML = ''; // Clear current list
        if (transactions.length === 0) {
            transactionList.innerHTML = '<p>ยังไม่มีรายการ</p>';
        } else {
            transactions.forEach(tx => {
                const item = document.createElement('div');
                item.className = 'history-item';
                
                const dateFormatted = new Date(tx.date).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

                item.innerHTML = `
                    <div class="history-details">
                        <p class="history-merchant">${tx.merchant}</p>
                        <p class="history-date">${dateFormatted}</p>
                    </div>
                    <div class="history-amount">
                        <p>฿${tx.amount.toFixed(2)}</p>
                        <button class="delete-btn" data-id="${tx.id}">ลบ</button>
                    </div>
                `;
                transactionList.appendChild(item);
            });
        }
    }

    function setIncome(e) {
        e.preventDefault();
        const incomeValue = parseFloat(incomeInput.value);
        if (!isNaN(incomeValue) && incomeValue >= 0) {
            monthlyIncome = incomeValue;
            incomeInput.value = '';
            saveState();
            render();
        } else {
            alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
        }
    }
    
    function addTransaction(e) {
        e.preventDefault();
        const merchant = document.getElementById('merchant').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;

        if (!merchant || isNaN(amount) || !date) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        
        const newTransaction = {
            id: crypto.randomUUID(),
            merchant: merchant,
            amount: amount,
            date: date,
        };
        
        transactions.unshift(newTransaction); // Add to the beginning of the array
        transactionForm.reset(); // Clear form fields
        
        saveState();
        render();
    }
    
    function deleteTransaction(e) {
        if (e.target.classList.contains('delete-btn')) {
            const idToDelete = e.target.getAttribute('data-id');
            transactions = transactions.filter(tx => tx.id !== idToDelete);
            saveState();
            render();
        }
    }

    // --- Event Listeners ---
    incomeForm.addEventListener('submit', setIncome);
    transactionForm.addEventListener('submit', addTransaction);
    transactionList.addEventListener('click', deleteTransaction);

    // Initial Render
    render();
});
