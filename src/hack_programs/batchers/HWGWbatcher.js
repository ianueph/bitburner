/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const server = ns.args[1];

  const hwgw = new HWGWbatcher(ns, target, server);

  while (hwgw.hasMinSecurity() && hwgw.hasMaxMoney()) {
    hwgw.createBatch();

    ns.print("batch time:\t", hwgw.getBatchTime()/1000/60, " minutes");
    ns.print("batch ram:\t", hwgw.getIncomingRam(), " GB");
    ns.print("has enough ram?\t", hwgw.hasEnoughRam());
    ns.print("has min security?\t", hwgw.hasMinSecurity());
    ns.print("has max money?\t", hwgw.hasMaxMoney());

    await ns.sleep(hwgw.INTERVAL*5)
  }
  
  ns.tprint("womp womp!")
  if (!hwgw.hasMinSecurity()) {ns.tprint("does not have enough Security!")}
  if (!hwgw.hasMaxMoney()) {ns.tprint("does not have enough Money!")}
}
  
export class HWGWbatcher  {
  constructor(ns, target, server) {
    this.ns = ns;
    this.target = target;
    this.server = server;
    this.cores = ns.getServer().cores;

    this.INTERVAL = 500;
    this.HACK_PERCENTAGE = 0.25;
    this.GROW_PADDING = 2;
    this.WEAK_PADDING = 2;
    this.MONEY_TOLERANCE = 1.005;
    this.SECURITY_TOLERANCE = 0.995;
    
    this.maxMoney = ns.getServerMaxMoney(target);
    this.hackMoney = this.maxMoney * this.HACK_PERCENTAGE;
    this.previousHackingLevel = ns.getHackingLevel();
  }

  createBatch() {
    if (this.hasEnoughRam() && this.hasMinSecurity() && this.hasMaxMoney()) {
      this.createHackScript(this.getHackDelay());
      this.createWeakenScript(this.getHackWeakenThreads(), 1*this.INTERVAL);
      this.createGrowScript(this.getGrowDelay() + 2*this.INTERVAL);
      this.createWeakenScript(this.getGrowWeakenThreads(), 3*this.INTERVAL);
    }
  }

  hasEnoughRam() {
    const ns = this.ns;

    const serverMaxRam = ns.getServerMaxRam(this.server);
    const serverUsedRam = ns.getServerUsedRam(this.server);
    const availableRam = serverMaxRam - serverUsedRam;
    const incomingRam = this.getIncomingRam();

    return availableRam > incomingRam;
  }

  getIncomingRam() {
    const ns = this.ns

    const hackScriptRam = ns.getScriptRam("hack.js", this.server) * this.getHackThreads();
    const growScriptRam = ns.getScriptRam("grow.js", this.server) * this.getGrowThreads();
    const hackWeakScriptRam = ns.getScriptRam("weak.js", this.server) * this.getHackWeakenThreads();
    const growWeakScriptRam = ns.getScriptRam("weak.js", this.server) * this.getGrowWeakenThreads();
    const incomingRam = hackScriptRam + growScriptRam + hackWeakScriptRam + growWeakScriptRam;
  
    return incomingRam
  }

  hasMinSecurity() {
    const ns = this.ns;
    
    const serverSecurityLevel = ns.getServerSecurityLevel(this.target)*this.SECURITY_TOLERANCE;
    return ns.getServerMinSecurityLevel(this.target) >= serverSecurityLevel;
  }

  hasMaxMoney() {
    const ns = this.ns;

    const serverMoneyAvailable = ns.getServerMoneyAvailable(this.target)*this.MONEY_TOLERANCE
    return ns.getServerMaxMoney(this.target) <= serverMoneyAvailable;
  }

  createHackScript(delay) {
    const ns = this.ns;
    const hackScriptPath = "/hack_programs/scripts/hack.js";

    const threads = this.getHackThreads()
    ns.exec(hackScriptPath, this.server, threads, delay, this.target)
  }

  createWeakenScript(threads, delay) {
    const ns = this.ns;
    const weakScriptPath = "/hack_programs/scripts/weak.js";

    ns.exec(weakScriptPath, this.server, threads, delay, this.target)
  }

  createGrowScript(delay) {
    const ns = this.ns;
    const growScriptPath = "/hack_programs/scripts/grow.js";

    const threads = this.getGrowThreads();
    ns.exec(growScriptPath, this.server, threads, delay, this.target)
  }

  getHackWeakenThreads() {
    const ns = this.ns;

    // 0.05 decrease per weaken thread
    let hackWeakenThreads = (ns.hackAnalyzeSecurity(this.getHackThreads()) / 0.05) * this.WEAK_PADDING 
    hackWeakenThreads = Math.floor(hackWeakenThreads);
    if (hackWeakenThreads < 1) {hackWeakenThreads = 1}
    return hackWeakenThreads;
  }

  getGrowWeakenThreads() {
    const ns = this.ns;

    let growWeakenThreads = (ns.growthAnalyzeSecurity(this.getGrowThreads()) / 0.05) * this.WEAK_PADDING
    growWeakenThreads = Math.floor(growWeakenThreads);
    if (growWeakenThreads < 1) {growWeakenThreads = 1}
    return growWeakenThreads
  }

  getHackThreads() {
    const ns = this.ns;

    let hackThreads = ns.hackAnalyzeThreads(this.target, this.hackMoney)
    hackThreads = Math.floor(hackThreads);
    if (hackThreads < 1) {hackThreads = 1}
    return hackThreads;
  }

  getGrowThreads() {
    const ns = this.ns;

    const growMultiplier = (1 / (1 - this.HACK_PERCENTAGE)) * this.GROW_PADDING;
    let growThreads = ns.growthAnalyze(this.target, growMultiplier, this.cores)
    growThreads = Math.floor(growThreads)
    if (growThreads < 1) {growThreads = 1}
    return growThreads; 
  }

  getHackDelay() {
    const ns = this.ns;

    const weakenTime = ns.getWeakenTime(this.target);
    const hackTime = ns.getHackTime(this.target);
    const hackDelay = weakenTime - hackTime;
    return hackDelay;
  }

  getGrowDelay() {
    const ns = this.ns;

    const weakenTime = ns.getWeakenTime(this.target);
    const growTime = ns.getGrowTime(this.target);
    const growDelay = weakenTime - growTime;
    return growDelay;
  }

  getBatchTime() {
    const ns = this.ns;

    const batchTime = ns.getWeakenTime(this.target) + 3*this.INTERVAL;
    return batchTime;
  }
}