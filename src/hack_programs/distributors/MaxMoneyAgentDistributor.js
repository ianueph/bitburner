/** @param {NS} ns */
import { MaxMoneyAgent } from "/hack_programs/batchers/MaxMoneyAgent.js";

export async function main(ns) {
  const target = ns.args[0];
  const uniqueHostnames = ns.read("UniqueHostnames.txt").split(",");

  const distributor = new MaxMoneyAgentDistributor(ns, target, uniqueHostnames)
  
  distributor.initializeBatchers();
  await distributor.start();

  ns.tprint(target, " has Mininimum Security and Maximum Money!")
}

export class MaxMoneyAgentDistributor {
  constructor (ns, target, servers) {
    this.ns = ns;

    this.UPDATE_RATE = 25;
    this.target = target;
    this.servers = servers;

    this.batchers = {};
  }

  async start() {
    const ns = this.ns;
    await this.setIsHomeExcluded();
    
    while (true) {
      if (this.hasMinSecurityAndMaxMoney()) {
        break;
      }
      await this.fillAllServersWithGrowWeakenBatches();
      await ns.sleep(this.UPDATE_RATE);
    }
  }

  initializeBatchers() {
    const ns = this.ns;
    
    for(const server of this.servers) {
      this.createMaxMoneyAgent(server);
    }
    ns.tprint("Successfully created MaxMoneyAgents on " + Object.keys(this.batchers).length + " servers")
  }

  async setIsHomeExcluded() {
    const ns = this.ns
    this.isHomeExcluded = await ns.prompt("Exclude home from distribution? ", {type: "boolean"});
  }

  hasMinSecurityAndMaxMoney() {
    const firstBatcher = this.batchers[this.servers[0]];
    const hasMinSecurityAndMaxMoney = firstBatcher.hasMinSecurity() && firstBatcher.hasMaxMoney();
    return hasMinSecurityAndMaxMoney;
  }

  async fillAllServersWithGrowWeakenBatches() {
    for (const server of Object.keys(this.batchers)) {
      await this.fillIndividualServerWithGrowWeakenBatches(this.batchers[server])
    }
  }

  async fillIndividualServerWithGrowWeakenBatches(batcher) {
    const ns = this.ns;
    while(batcher.hasEnoughRam() ) {
      batcher.setupTargetForHacking();
      await ns.sleep(batcher.INTERVAL * 3)
    }
  }

  createMaxMoneyAgent(server) {
    const ns = this.ns;

    if (!ns.hasRootAccess(server)) {return;} 
    if (this.isHomeExcluded && server === "home") {return;}

    this.batchers[server] = new MaxMoneyAgent(ns, this.target, server)
  }
}