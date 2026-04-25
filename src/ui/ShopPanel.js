// ===== ShopPanel.js =====
// Upgrade shop UI using DOM elements

class ShopPanel {
    constructor(scene, x = 400, y = 300) {
        this.scene = scene;

        // Root container
        const div = document.createElement('div');
        div.className = 'shop-panel';
        div.style.backgroundColor = 'rgba(230, 126, 34, 0.95)'; // Warning orange
        div.style.border = '4px solid #d35400';
        div.style.borderRadius = '12px';
        div.style.padding = '20px';
        div.style.width = '500px';
        div.style.maxHeight = '450px';
        div.style.overflowY = 'auto';
        div.style.fontFamily = 'sans-serif';
        div.style.color = '#fff';

        // Header
        const header = document.createElement('h2');
        header.innerHTML = `🏪 Max's Upgrade Shop`;
        header.style.textAlign = 'center';
        header.style.margin = '0 0 10px 0';
        header.style.color = '#fff';
        div.appendChild(header);

        // Current points display
        const pts = document.createElement('div');
        pts.style.textAlign = 'center';
        pts.style.marginBottom = '20px';
        pts.style.fontSize = '18px';
        div.appendChild(pts);
        this.ptsContainer = pts;

        // Upgrade list container
        this.listContainer = document.createElement('div');
        div.appendChild(this.listContainer);

        this.renderList();

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close Shop';
        closeBtn.style.display = 'block';
        closeBtn.style.width = '100%';
        closeBtn.style.padding = '10px';
        closeBtn.style.marginTop = '20px';
        closeBtn.style.backgroundColor = '#e74c3c';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => this.destroy();
        div.appendChild(closeBtn);

        this.domElement = this.scene.add.dom(x, y, div).setOrigin(0.5);
        this.scene.input.keyboard.disableGlobalCapture();
    }

    renderList() {
        this.ptsContainer.innerHTML = `<strong>Your Points: <span style="color:#f1c40f">⭐ ${gameState.points}</span></strong>`;
        this.listContainer.innerHTML = '';
        
        UPGRADES.forEach(u => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.backgroundColor = 'rgba(0,0,0,0.2)';
            row.style.padding = '10px';
            row.style.borderRadius = '8px';
            row.style.marginBottom = '10px';

            const info = document.createElement('div');
            info.innerHTML = `<strong>${u.icon} ${u.label}</strong><br><small>${u.description}</small>`;
            row.appendChild(info);

            const btn = document.createElement('button');
            const isOwned = gameState.isUpgradePurchased(u.id);
            const canAfford = gameState.points >= u.cost;
            const requiresMet = !u.requires || gameState.isUpgradePurchased(u.requires);

            if (isOwned) {
                btn.innerText = 'Owned';
                btn.disabled = true;
                btn.style.backgroundColor = '#2ecc71';
            } else if (!requiresMet) {
                btn.innerText = `Needs ${u.requires}`;
                btn.disabled = true;
                btn.style.backgroundColor = '#7f8c8d';
            } else {
                btn.innerHTML = `Buy (⭐${u.cost})`;
                btn.disabled = !canAfford;
                btn.style.backgroundColor = canAfford ? '#3498db' : '#95a5a6';
                btn.onclick = () => this.buyUpgrade(u);
            }
            
            btn.style.padding = '8px 12px';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.color = '#fff';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';

            row.appendChild(btn);
            this.listContainer.appendChild(row);
        });
    }

    buyUpgrade(upgrade) {
        if (gameState.spendPoints(upgrade.cost)) {
            gameState.purchaseUpgrade(upgrade.id);
            EventBus.emit('upgrade:purchased', upgrade.id);
            this.renderList();
        }
    }

    destroy() {
        this.scene.input.keyboard.enableGlobalCapture();
        EventBus.emit('panel:close');
        this.domElement.destroy();
    }
}
