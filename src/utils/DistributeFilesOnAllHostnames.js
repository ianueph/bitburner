/** @param {NS} ns */
export async function main(ns) {
    const hostnames = ns.read("UniqueHostnames.txt").split(",");
    const scripts = ns.ls("home").filter((file) => file.endsWith(".js"))
  
    for (const hostname of hostnames) {
      ns.scp(scripts, hostname, "home")
      ns.tprint("SUCCESS distributed files from home to ", hostname)
    }
}