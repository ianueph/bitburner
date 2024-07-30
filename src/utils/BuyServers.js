/** @param {NS} ns */
export async function main(ns) {
    const vendor = new ServerVendor(ns)

    const decision = await ns.prompt("What would you like to do with your servers?", {type: "select", choices: ["Buy servers", "Upgrade all purchased servers"]})

    switch(decision) {
        case "Buy servers": {
            await vendor.purchaseServer();
            break;
        }
        case "Upgrade all purchased servers": {
            await vendor.upgradeAllServers();
            break;
        }
    }

}

export class ServerVendor {

    constructor (ns) {
        this.ns = ns;
        this.ramLevel = 0;
        this.purchaseAmount = 0;
        this.purchasedServers = ns.getPurchasedServers();

        this.SERVER_PREFIX = "pserv-";
    }

    async purchaseServer() {
        const ns = this.ns;

        await this.setPurchaseAmount();
        await this.setRamLevel();

        const cost = this.calculatePurchaseCost()

        if (!this.hasEnoughMoneyAvailable(cost)) {
        ns.alert("You don't have enough money! \nneeds: " + cost); 
        return;
        }

        if (!(await this.promptUserCostConfirmation(cost))) {
        ns.alert("Cancelling transaction!");
        return;
        }

        for (let i = 0; i < this.purchaseAmount; i++) {
        ns.purchaseServer(this.SERVER_PREFIX+i, 2**this.ramLevel)
        }
    }

    async upgradeAllServers() {
        const ns = this.ns;
        
        await this.setRamLevel();
        const cost = this.calculateUpgradeAllCost();

        if (cost < 0) {
        ns.alert("ramLevel too low!, can't be : " + this.ramLevel); 
        return;
        }

        if (!this.hasEnoughMoneyAvailable(cost)) {
        ns.alert("You don't have enough money! \nneeds: " + cost); 
        return;
        }

        if (!(await this.promptUserCostConfirmation(cost))) {
        ns.alert("Cancelling transaction!");
        return;
        }

        for (let i = 0; i < this.purchasedServers.length; i++) {
        ns.upgradePurchasedServer(this.purchasedServers[i], 2**this.ramLevel)
        }
    }

    async setPurchaseAmount() {
        const ns = this.ns;
        const purchasedServerLimit = ns.getPurchasedServerLimit();
        const purchaseAmount = await ns.prompt("How many servers do you want to buy?", {type: "select", choices: [...Array(purchasedServerLimit).keys()]})
        this.purchaseAmount = purchaseAmount;
    }

    async setRamLevel() {
        const ns = this.ns;
        const ramLevel = await ns.prompt("What ram tier do you want to set?", {type: "text"});
        this.ramLevel = parseInt(ramLevel);
    }

    async promptUserCostConfirmation(cost) {
        const ns = this.ns;
        return await ns.prompt("Are you sure? this will cost " + cost, {type: "boolean"})
    }

    canPurchaseServers() {
        const ns = this.ns;
        return true && ns.getPurchasedServerLimit();
    }

    hasEnoughMoneyAvailable(cost) {
        const ns = this.ns;
        return ns.getPlayer().money > cost;
    }

    calculatePurchaseCost() {
        const ns = this.ns;
        const cost = ns.getPurchasedServerCost(2**this.ramLevel) * this.purchaseAmount;
        return cost;
    }

    calculateUpgradeAllCost() {
        const ns = this.ns;
        let cost = 0;
        for (const server of this.purchasedServers) {
        cost += ns.getPurchasedServerUpgradeCost(server, 2**this.ramLevel)
        }
        return cost;
    }
}