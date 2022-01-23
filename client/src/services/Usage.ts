/* global chrome */
class UsageService {

    static async getUsageData(): Promise<any> {
        const sessions: any = [];

        const allHosts: any = await chrome.storage.sync.get(null);
        const hosts = Object.keys(allHosts);

        const hostEventMap = new Map<string, any>();

        for (const host of hosts) {
            if (host !== "undefined") {
                for (const { type, session, timestamp, device } of allHosts[host]) {
                    const hostEventKey = `${host}-${session}`;
                    if (type === "FINISH") {
                        if (hostEventMap.has(hostEventKey)) {
                            sessions.push({
                                device,
                                session,
                                host,
                                endingTimestamp: timestamp,
                                startingTimestamp: hostEventMap.get(hostEventKey),
                                duration: timestamp - hostEventMap.get(hostEventKey)
                            });
                            hostEventMap.delete(hostEventKey);
                        }
                    } else {
                        hostEventMap.set(hostEventKey, timestamp);
                    }
                }
            }
            return allHosts;
        }
        return sessions;
    }
}

export default UsageService;