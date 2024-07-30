/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const server = ns.args[1];

  const agent = new MaxMoneyAgent(ns, target, server);
  while (!agent.hasMaxMoney() && !agent.hasMaxMoney()) {
    agent.setupTargetForHacking();
    await ns.sleep(agent.INTERVAL*3)
  }

  ns.tprint(target, " has maximum money! scripts terminated.");
  ns.killall(server, false);
}

export class MaxMoneyAgent {
  constructor(ns, target, server) {
    this.ns = ns
    this.target = target;
    this.server = server;

    this.INTERVAL = 100;
    this.GROWTH_PERCENTAGE = 3;
    this.WEAK_PADDING = 1.75;
    this.cores = ns.getServer(target).cores;

    this.minSecurity = ns.getServerMinSecurityLevel(target);
    this.maxMoney = ns.getServerMaxMoney(target);
  }

  setupTargetForHacking() {
    if (!this.hasMinSecurity()) {
      this.createWeakScript();
    }
    if (!this.hasMaxMoney() && this.hasMinSecurity()) {
      this.createGrowWeakBatch();
    }
  }

  hasMinSecurity() {
    const ns = this.ns;
    const currentSecurity = ns.getServerSecurityLevel(this.target);

    return currentSecurity <= this.minSecurity;
  }

  hasMaxMoney() {
    const ns = this.ns;
    const currentMoney = ns.getServerMoneyAvailable(this.target);

    return currentMoney >= this.maxMoney;
  }

  createGrowWeakBatch() {
    const ns = this.ns;

    let growDelay = ns.getWeakenTime(this.target) - ns.getGrowTime(this.target);

    if (this.hasEnoughRam()) {
      this.createGrowScript(growDelay);
      this.createWeakScript();
    }
  }

  hasEnoughRam() {
    const ns = this.ns;
    const serverMaxRam = ns.getServerMaxRam(this.server);
    const serverUsedRam = ns.getServerUsedRam(this.server);
    const availableRam = serverMaxRam - serverUsedRam;
    
    const growScriptRam = ns.getScriptRam("grow.js", this.server) * this.getGrowThreads();
    const weakScriptRam = ns.getScriptRam("weak.js", this.server) * this.getWeakenThreads();
    const incomingRam = growScriptRam + weakScriptRam;

    return availableRam > incomingRam;
  }

  createWeakScript() {
    const ns = this.ns;
    const delay = this.INTERVAL;
    const weakScriptPath = "/hack_programs/scripts/weak.js"

    ns.print("Weakening ", this.target, " in ", delay/1000, " seconds");
    ns.exec(weakScriptPath, this.server, this.getWeakenThreads(), delay, this.target)
  }

  createGrowScript(delay) {
    const ns = this.ns;
    const growScriptPath = "/hack_programs/scripts/grow.js";
    
    ns.print("Growing ", this.target, " in ", delay/1000, " seconds");
    ns.exec(growScriptPath, this.server, this.getWeakenThreads(), delay, this.target);
  }

  getWeakenThreads() {
    const ns = this.ns;

    const growThreads = this.getGrowThreads();
    const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads, this.target, this.cores);

    let weakenThreads = (growSecurityIncrease/0.05) * this.WEAK_PADDING;
    weakenThreads = Math.floor(weakenThreads);
    if (weakenThreads < 1) { weakenThreads = 1; }

    return weakenThreads;
  }

  getGrowThreads() {
    const ns = this.ns;

    let growThreads = ns.growthAnalyze(this.target, this.GROWTH_PERCENTAGE, this.cores);
    growThreads = Math.floor(growThreads);
    if (growThreads < 1) { growThreads = 1; }

    return growThreads;
  }
}