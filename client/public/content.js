
var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
s.onload = function() {
    this.remove();
};

(document.head || document.documentElement).appendChild(s);


window.addEventListener("message", async (event) => {
    if (event.source != window){
        return;
    }
    
    const {host} = event.data;

    let eventMap = await chrome.storage.sync.get(host);
    if (! (host in eventMap)){
        eventMap[host] = [];
    }

    eventMap[host].push(event.data);

    console.log(eventMap);
    await chrome.storage.sync.set(eventMap);
});
