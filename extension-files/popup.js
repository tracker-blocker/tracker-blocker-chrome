console.log('popup is here!')

const addToList = (parent, array) => {
    for (item of array) {
        const row = document.createElement("p")
        row.className = 'item'
        row.innerText = item
        parent.appendChild(row)
    }
}

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.runtime.sendMessage({from: "popup", subject: "fetchPopupData", tabs: tabs}, (response) => {
        console.log("blocklist", response.tabBlocks)
        addToList(document.getElementById("blocked-sites"), response.tabBlocks)

        document.getElementById('site-tracker-switch').checked = !response.isUnblocked
    });
})

const toggleSiteTracker = () => {
    const trackerSwitch = document.getElementById('site-tracker-switch').checked

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const hostname = new URL(tabs[0].url).hostname
        if (!trackerSwitch) {
            chrome.runtime.sendMessage({from: "popup", subject: "unblockTracker", domain: hostname}, (response) => {
                console.log("received:", response.status)
            })
        } else {
            chrome.runtime.sendMessage({from: "popup", subject: "blockTracker", domain: hostname}, (response) => {
                console.log("received:", response.status)
            })
        }
    })
}

document.getElementById('site-tracker-switch').onclick = toggleSiteTracker;
