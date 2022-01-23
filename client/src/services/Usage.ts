import { Device } from "../components/home/Home";
import mockData from "../utils/mock";
/* global chrome */
class UsageService {

    static async getUsageData(deviceType: Device): Promise<any> {
        const sessions: any = [];

        const allHosts: any = await chrome.storage.sync.get(null);
        const hosts = Object.keys(allHosts);

        const hostEventMap = new Map<string, any>();
        
        for (const host of hosts) {
            if (host !== "undefined") {
                for (const { type, session, timestamp, device } of allHosts[host]) {
                    if (device === deviceType) {
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
            }
        }

        console.log(sessions);
        return sessions;
    }
}

export default UsageService;