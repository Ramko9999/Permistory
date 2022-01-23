var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
s.onload = function () {
    this.remove();
};

(document.head || document.documentElement).appendChild(s);


window.addEventListener("message", async (event) => {
    if (event.source != window) {
        return;
    }

    const {
        message_type, host, timestamp
    } = event.data;

    console.info(event.data);

    if (message_type === "MEDIA_INTENT") {
        let eventMap = await chrome.storage.sync.get(host);
        if (!(host in eventMap)) {
            eventMap[host] = [];
        }
        eventMap[host].push(event.data);
        await chrome.storage.sync.set(eventMap);
    }
    else if (message_type === "LOCATION_INTENT") {
        let domainLocationMap = await chrome.storage.sync.get("location");
        if (!(host in domainLocationMap)) {
            domainLocationMap[host] = [];
        }
        domainLocationMap[host].push(timestamp);
        await chrome.storage.sync.set(domainLocationMap);
    }
});