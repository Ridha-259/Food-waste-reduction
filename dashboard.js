// Check if user is logged in
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'index.html';
}

let foodItems = JSON.parse(localStorage.getItem(`foodItems_${currentUser}`)) || [];

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

document.getElementById('addFoodForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const foodName = document.getElementById('foodName').value;
    const expiryDate = document.getElementById('expiryDate').value;

    foodItems.push({
        name: foodName,
        expiry: expiryDate,
        id: Date.now()
    });

    localStorage.setItem(`foodItems_${currentUser}`, JSON.stringify(foodItems));
    displayFoodItems();
    this.reset();
});

function displayFoodItems() {
    const foodList = document.getElementById('foodItems');
    const expiredList = document.getElementById('expiredItems');
    foodList.innerHTML = '';
    expiredList.innerHTML = '';

    foodItems.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    foodItems.forEach(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
        const itemDiv = document.createElement('div');

        if (daysUntilExpiry <= 0) {
            // Expired items
            itemDiv.className = 'food-item expired';
            itemDiv.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <p>Expired on: ${item.expiry} (${Math.abs(daysUntilExpiry)} days ago)</p>
                </div>
                <button onclick="deleteItem(${item.id})" class="delete-btn">Delete</button>
            `;
            expiredList.appendChild(itemDiv);
        } else {
            // Non-expired items
            itemDiv.className = `food-item ${daysUntilExpiry <= 3 ? 'expiring-soon' : ''}`;
            itemDiv.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <p>Expires: ${item.expiry} (${daysUntilExpiry} days left)</p>
                </div>
                <button onclick="deleteItem(${item.id})" class="delete-btn">Delete</button>
            `;
            foodList.appendChild(itemDiv);
        }
    });
}

function deleteItem(id) {
    foodItems = foodItems.filter(item => item.id !== id);
    localStorage.setItem(`foodItems_${currentUser}`, JSON.stringify(foodItems));
    displayFoodItems();
}

// Check for expiring items and expired items
function checkExpiringItems() {
    foodItems.forEach(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
        
        // Check for items expiring soon (within 3 days)
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
            // Show browser notification
            if (Notification.permission === "granted") {
                new Notification(`Food Expiring Soon!`, {
                    body: `${item.name} will expire in ${daysUntilExpiry} days!`,
                });
            }
            
            // Send email notification (using emailjs)
            emailjs.send("service_id", "template_id", {
                to_email: currentUser,
                food_name: item.name,
                days_left: daysUntilExpiry,
                message: `Your food item ${item.name} will expire in ${daysUntilExpiry} days!`
            });
        }
        
        // Check for expired items
        if (daysUntilExpiry <= 0) {
            // Show browser notification
            if (Notification.permission === "granted") {
                new Notification(`Food Item Expired!`, {
                    body: `${item.name} has expired!`,
                });
            }
            
            // Send email notification
            emailjs.send("service_id", "template_id", {
                to_email: currentUser,
                food_name: item.name,
                message: `Your food item ${item.name} has expired!`
            });
        }
    });
}

// Request notification permission
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Initial display
displayFoodItems();

// Check for expiring items daily
setInterval(checkExpiringItems, 24 * 60 * 60 * 1000);
checkExpiringItems();