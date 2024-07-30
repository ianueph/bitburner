/** @param {NS} ns */
export async function main(ns) {
  const delay = ns.args[0];
  const hostname = ns.args[1];
  
  await ns.sleep(delay);
  await ns.grow(hostname);  
}