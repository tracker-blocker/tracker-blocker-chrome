console.log('popup is here!')

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.runtime.sendMessage({from: "popup", subject: "fetchBlockList", tabs: tabs}, (response) => {
        console.log("blocklist", response.tabBlocks)
        document.getElementById("content").innerText = response.tabBlocks[0]
    });
})

