
window.onload = () => {
    chrome.tabs.create({url: chrome.runtime.getURL("newtab.html")});
}