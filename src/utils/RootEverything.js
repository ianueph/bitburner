/** @param {NS} ns */
export async function main(ns) {
    const hostnames = ns.read("UniqueHostnames.txt").split(",");
    const homeFiles = ns.ls("home");
  
    for (const hostname of hostnames) { 
        const numPortsRequired = ns.getServerNumPortsRequired(hostname);
        let portsOpened = 0;
        ns.print("Attempting to root ", hostname);
        ns.print("Requires ", numPortsRequired, " opened!");

        if (homeFiles.includes("BruteSSH.exe")) {
            ns.brutessh(hostname); 
            portsOpened++;
        } else {
            ns.print("BruteSSH.exe doesn't exist!");
        }

        if (homeFiles.includes("FTPcrack.exe")) {
            ns.ftpcrack(hostname); 
            portsOpened++;
        } else {
            ns.print("FTPcrack.exe doesn't exist!");
        }

        if (homeFiles.includes("relaySTMP.exe")) {
            ns.relaysmtp(hostname); 
            portsOpened++;
        } else {
            ns.print("relaySTMP.exe doesn't exist!");
        }

        if (homeFiles.includes("HTTPworm.exe")) {
            ns.httpworm(hostname); 
            portsOpened++;
        } else {
            ns.print("HTTPworm.exe doesn't exist!");
        }
        
        if (homeFiles.includes("SQLInject.exe")) {
            ns.sqlinject(hostname); 
            portsOpened++;
        } else {
            ns.print("SQLInject.exe doesn't exist!");
        }

        ns.print("Ports opened: ", portsOpened)
        if (portsOpened >= numPortsRequired) {
            if (homeFiles.includes("NUKE.exe")) {ns.nuke(hostname)}
            ns.tprint("Successfully nuked ", hostname, "!")
        } else {
            ns.print(hostname, " can't be nuked!, requires ", numPortsRequired, " ports opened!")
        }
    }
}