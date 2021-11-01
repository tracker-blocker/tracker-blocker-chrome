
const addToList = (parent, array) => {
    for (item of array) {
        const row = document.createElement("div")
        row.className = 'item'

        const domainRow = document.createElement("p")
        domainRow.className = 'domain'
        domainRow.innerText = item.domain
        row.appendChild(domainRow)

        const ownerRow = document.createElement("p")
        ownerRow.className = 'owner'

        ownerRow.innerText = item.owner ? item.owner : 'unidentified owner'

        row.appendChild(ownerRow)

        parent.appendChild(row)
    }
    if (!array.length) {
        const empty = document.createElement("p")
        empty.id = "empty-item"
        empty.innerText = 'No trackers identified'
        parent.appendChild(empty)
    }
}

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.runtime.sendMessage({from: "popup", subject: "fetchPopupData", tabs: tabs}, (response) => {
        addToList(document.getElementById("blocked-sites"), response.tabBlocks)

        document.getElementById('site-tracker-switch').checked = !response.isUnblocked
    });
})

const toggleSiteTracker = () => {
    const trackerSwitch = document.getElementById('site-tracker-switch').checked

    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const hostname = new URL(tabs[0].url).hostname
        if (!trackerSwitch) {
            chrome.runtime.sendMessage({from: "popup", subject: "unblockTracker", domain: hostname})
        } else {
            chrome.runtime.sendMessage({from: "popup", subject: "blockTracker", domain: hostname})
        }
    })
}

document.getElementById('site-tracker-switch').onclick = toggleSiteTracker;
