document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("keydown", handleKeyPress);

    // Game state
    const gameState = {
        coins: 5,
        isPlaying: false,
        clawX: 50,
        hasGrabbed: false,
        timerId: null,
        timeRemaining: 10,
        inventory: {}
    };

    // Game elements
    const elements = {
        claw: document.getElementById("claw"),
        coinSlot: document.getElementById("coin-slot"),
        resultDiv: document.getElementById("result"),
        container: document.getElementById("container"),
        coinsDisplay: document.getElementById("coins-display"),
        timerDisplay: document.getElementById("timer-display"),
        timerProgress: document.querySelector(".timer-progress"),
        inventory: document.getElementById("inventory")
    };

    // Collectibles with rarity information
    const rarityWeights = {
        common: 50,
        uncommon: 30,
        rare: 15,
        ultraRare: 8,
        legendary: 2
    };

    const collectibles = [
        { name: "Nothing :(", emoji: "😢", rarity: "" },
        { name: "Rock", emoji: "🪨", rarity: "common" },
        { name: "Cat", emoji: "🐱", rarity: "uncommon" },
        { name: "Dog", emoji: "🐶", rarity: "uncommon" },
        { name: "Teddy Bear", emoji: "🧸", rarity: "rare" },
        { name: "Fish-Holding Otter", emoji: "🦦🐟", rarity: "ultraRare" },
        { name: "Frog", emoji: "🐸", rarity: "ultraRare" },
        { name: "👽", emoji: "👽", rarity: "legendary" }
    ];

    // Initialize the game
    function initGame() {
        populateContainer();
        updateCoinsDisplay();
        elements.coinSlot.addEventListener("click", insertCoin);

        // Add touch controls for mobile
        setupTouchControls();
    }

    function setupTouchControls() {
        // Add left/right buttons for mobile
        const touchControls = document.createElement("div");
        touchControls.className = "touch-controls";
        touchControls.innerHTML = `
            <button id="move-left">←</button>
            <button id="grab">GRAB</button>
            <button id="move-right">→</button>
        `;
        document.getElementById("game-container").appendChild(touchControls);

        document.getElementById("move-left").addEventListener("click", () => moveClaw("left"));
        document.getElementById("move-right").addEventListener("click", () => moveClaw("right"));
        document.getElementById("grab").addEventListener("click", grab);
    }

    function moveClaw(direction) {
        if (gameState.hasGrabbed || !gameState.isPlaying) return;

        if (direction === "right") {
            gameState.clawX = Math.min(gameState.clawX + 5, 95);
        } else if (direction === "left") {
            gameState.clawX = Math.max(gameState.clawX - 5, 5);
        }

        elements.claw.style.left = `${gameState.clawX}%`;
    }

    function populateContainer() {
        elements.container.innerHTML = "";
        const itemCount = getRandomInt(5, 8);

        // Ensure at least one of each rarity appears
        const guaranteedItems = [
            collectibles.find(item => item.rarity === "common"),
            collectibles.find(item => item.rarity === "uncommon"),
            collectibles.find(item => item.rarity === "rare"),
            collectibles.find(item => Math.random() > 0.5 ? item.rarity === "ultraRare" : item.rarity === "legendary")
        ];

        // Filter out the "Nothing" item
        const availableItems = collectibles.filter(item => item.name !== "Nothing :(");

        // Position guaranteed items
        guaranteedItems.forEach((item, index) => {
            const position = index * (100 / (guaranteedItems.length + 1));
            placeItem(item, position);
        });

        // Add some random items
        for (let i = 0; i < itemCount - guaranteedItems.length; i++) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            const randomPosition = getRandomInt(5, 95);
            placeItem(randomItem, randomPosition);
        }
    }

    function placeItem(item, xPosition) {
        const itemDiv = document.createElement("div");
        itemDiv.className = `item ${item.rarity}`;
        itemDiv.textContent = item.emoji;
        itemDiv.dataset.name = item.name;
        itemDiv.dataset.rarity = item.rarity;

        // Random position adjustments to make the machine look naturally filled
        itemDiv.style.left = `${xPosition}%`;
        itemDiv.style.bottom = `${getRandomInt(10, 60)}px`;
        itemDiv.style.transform = `rotate(${getRandomInt(-20, 20)}deg)`;

        elements.container.appendChild(itemDiv);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function insertCoin() {
        if (gameState.coins > 0 && !gameState.isPlaying) {
            playSoundEffect('coinInsert');
            gameState.coins--;
            gameState.isPlaying = true;
            gameState.hasGrabbed = false;
            gameState.timeRemaining = 10;

            updateCoinsDisplay();
            elements.resultDiv.textContent = "Move the claw with arrow keys, press SPACE to grab!";
            elements.resultDiv.className = "";

            // Reset claw position
            gameState.clawX = 50;
            elements.claw.style.left = "50%";
            elements.claw.style.top = "0";
            elements.claw.classList.remove("grabbing");

            startTimer();
        } else if (gameState.coins <= 0) {
            elements.resultDiv.textContent = "No more coins! Game over.";
            elements.resultDiv.className = "result-lose";
            playSoundEffect('error');
        }
    }

    function updateCoinsDisplay() {
        elements.coinsDisplay.textContent = `Coins: ${gameState.coins}`;
    }

    function startTimer() {
        updateTimerDisplay();

        // Reset and start timer animation
        elements.timerProgress.style.transition = 'none';
        elements.timerProgress.style.width = '100%';
        setTimeout(() => {
            elements.timerProgress.style.transition = 'width 10s linear';
            elements.timerProgress.style.width = '0%';
        }, 50);

        gameState.timerId = setInterval(() => {
            gameState.timeRemaining--;
            updateTimerDisplay();

            if (gameState.timeRemaining <= 0 || gameState.hasGrabbed) {
                timeUp();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        elements.timerDisplay.textContent = gameState.timeRemaining;
    }

    function timeUp() {
        if (!gameState.hasGrabbed && gameState.isPlaying) {
            clearInterval(gameState.timerId);
            gameState.isPlaying = false;

            elements.resultDiv.textContent = "Time's up! You got nothing :(";
            elements.resultDiv.className = "result-lose";
            playSoundEffect('timeUp');
        }
    }

    function handleKeyPress(e) {
        if (gameState.hasGrabbed || !gameState.isPlaying) return;

        if (e.key === "ArrowRight") {
            moveClaw("right");
        } else if (e.key === "ArrowLeft") {
            moveClaw("left");
        } else if (e.key === " " || e.key === "Spacebar") {
            e.preventDefault(); // Prevent page scrolling
            grab();
        }
    }

    function grab() {
        if (gameState.hasGrabbed || !gameState.isPlaying) return;

        gameState.hasGrabbed = true;
        clearInterval(gameState.timerId);

        // Add grabbing class to animate the claw
        elements.claw.classList.add("grabbing");

        // Play sound effect
        playSoundEffect('clawDrop');

        // Move claw down
        elements.claw.style.top = "70%";

        // Determine if player grabbed anything and what it is
        setTimeout(() => {
            const grabbedItem = determineGrabbedItem();
            processGrab(grabbedItem);

            // Return claw back up
            setTimeout(() => {
                elements.claw.style.top = "0";
                elements.claw.classList.remove("grabbing");

                // End of turn
                setTimeout(() => {
                    gameState.hasGrabbed = false;
                    gameState.isPlaying = false;

                    // Refresh the machine
                    populateContainer();
                }, 1000);
            }, 1500);
        }, 1500);
    }

    function determineGrabbedItem() {
        const clawPosition = gameState.clawX;
        const items = Array.from(document.querySelectorAll('.item'));

        // Find items that are close to the claw position
        const nearbyItems = items.filter(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenterX = itemRect.left + (itemRect.width / 2);
            const clawRect = elements.claw.getBoundingClientRect();
            const clawCenterX = clawRect.left + (clawRect.width / 2);

            // Calculate distance between claw and item centers
            return Math.abs(itemCenterX - clawCenterX) < 40;
        });

        if (nearbyItems.length > 0) {
            // Add some randomness based on item rarity
            const probabilityAdjustedItems = nearbyItems.map(item => {
                const rarity = item.dataset.rarity;
                let probability;

                switch (rarity) {
                    case "common": probability = 0.9; break;
                    case "uncommon": probability = 0.7; break;
                    case "rare": probability = 0.5; break;
                    case "ultraRare": probability = 0.3; break;
                    case "legendary": probability = 0.15; break;
                    default: probability = 0.8;
                }

                return { item, probability };
            });

            // Try to grab based on probability
            for (const { item, probability } of probabilityAdjustedItems) {
                if (Math.random() < probability) {
                    return item;
                }
            }
        }

        // If no item was successfully grabbed or probability check failed
        return null;
    }

    function processGrab(grabbedItem) {
        if (grabbedItem) {
            const itemName = grabbedItem.dataset.name;
            const itemRarity = grabbedItem.dataset.rarity;
            const itemEmoji = grabbedItem.textContent;

            // Make the grabbed item disappear
            grabbedItem.style.opacity = "0";
            setTimeout(() => grabbedItem.remove(), 500);

            // Award prize
            elements.resultDiv.textContent = `You grabbed ${itemName}!`;
            elements.resultDiv.className = "result-win";

            // Add coin reward based on rarity
            let coinReward = 1;
            switch (itemRarity) {
                case "rare": coinReward = 2; break;
                case "ultraRare": coinReward = 3; break;
                case "legendary": coinReward = 5; break;
            }

            gameState.coins += coinReward;
            updateCoinsDisplay();

            // Add to inventory
            addToInventory(itemName, itemEmoji, itemRarity);

            // Play winning sound
            playSoundEffect('win');
        } else {
            elements.resultDiv.textContent = "The claw slipped! You got nothing :(";
            elements.resultDiv.className = "result-lose";
            playSoundEffect('clawSlip');
        }
    }

    function addToInventory(itemName, itemEmoji, itemRarity) {
        // Update inventory count
        if (!gameState.inventory[itemName]) {
            gameState.inventory[itemName] = { count: 0, emoji: itemEmoji, rarity: itemRarity };
        }
        gameState.inventory[itemName].count++;

        // Update inventory display
        updateInventoryDisplay();
    }

    function updateInventoryDisplay() {
        elements.inventory.innerHTML = "";

        // Sort by rarity
        const rarityOrder = ["legendary", "ultraRare", "rare", "uncommon", "common"];
        const sortedItems = Object.entries(gameState.inventory).sort((a, b) => {
            const rarityA = rarityOrder.indexOf(a[1].rarity);
            const rarityB = rarityOrder.indexOf(b[1].rarity);
            return rarityA - rarityB;
        });

        if (sortedItems.length === 0) {
            elements.inventory.innerHTML = "<p>Your collection is empty. Win some prizes!</p>";
            return;
        }

        sortedItems.forEach(([name, details]) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = `inventory-item ${details.rarity} ${details.count === 1 ? 'new-item' : ''}`;
            itemDiv.innerHTML = `${details.emoji} ${name} x${details.count}`;
            elements.inventory.appendChild(itemDiv);
        });
    }

    function playSoundEffect(type) {
        // You would implement actual sounds here
        // For now, we'll just console log which sound would play
        console.log(`Playing sound: ${type}`);

        // Create audio context API implementation here if desired
        // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // etc.
    }

    // Initialize the game when page loads
    initGame();
});