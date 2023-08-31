window.onload = () => {
    chrome.tabs.create({url: chrome.runtime.getURL("app.html")});
}

export {}