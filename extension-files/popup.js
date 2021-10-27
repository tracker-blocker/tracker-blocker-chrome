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
    chrome.runtime.sendMessage({from: "popup", subject: "fetchBlockList", tabs: tabs}, (response) => {
        console.log("blocklist", response.tabBlocks)
        // document.getElementById("content").innerText = response.tabBlocks[0]
        addToList(document.getElementById("blocked-sites"), response.tabBlocks)
    });
})

const ccc = () => {console.log("popup clicked!!")}
document.getElementById('stop-blocking').addEventListener('click', ccc)