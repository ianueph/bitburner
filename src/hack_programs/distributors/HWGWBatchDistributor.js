import { HWGWbatcher } from "/hack_programs/batchers/HWGWbatcher.js";

/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const uniqueHostnames = ns.read("UniqueHostnames.txt").split(",");

  const distributor = new HWGWBatchDistributor(ns, target, uniqueHostnames)
  
  distributor.initializeBatchers();
  await distributor.start();

  ns.tprint("womp womp!")
}

class HWGWBatchDistributor {
  constructor(ns, target, servers) {
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
      await this.fillAllServersWithHWGWbatches();
      await ns.sleep(this.UPDATE_RATE);
    }
  }

  initializeBatchers() {
    const ns = this.ns;
    
    for(const server of this.servers) {
      this.createHWGWBatcher(server);
    }
    ns.tprint("Successfully created HWGWbatchers on " + Object.keys(this.batchers).length + " servers")
  }
  
  async setIsHomeExcluded() {
    const ns = this.ns;
    this.isHomeExcluded = await ns.prompt("Exclude home from distribution? ", {type: "boolean"});
  }

  async fillAllServersWithHWGWbatches() {
    for (const server of Object.keys(this.batchers)) {
      await this.fillIndividualServerWithHWGWbatches(this.batchers[server])
    }
    
  }

  async fillIndividualServerWithHWGWbatches(batcher) {
    const ns = this.ns;
    while(batcher.hasEnoughRam()) {
      batcher.createBatch();
      await ns.sleep(batcher.INTERVAL * 5)
    }
  }

  createHWGWBatcher(server) {
    const ns = this.ns;

    if (!ns.hasRootAccess(server)) {return;} 
    if (this.isHomeExcluded && server === "home") {return;}

    this.batchers[server] = new HWGWbatcher(ns, this.target, server)
  }

  hasMinSecurityAndMaxMoney(batcher) {
    return batcher.hasMinSecurity() && batcher.hasMaxMoney();
  }
}