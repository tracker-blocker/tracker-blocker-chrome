let domainRegex = null
let domains = {}

let unblockedDomains = []

const blockedInfo = {}
// {"tabId@initiator":{"count": 1, "blocked": Set([])}}

const setBadgeInfo = (tabId, initiator, domain) => {
    key = `${tabId}@${initiator}`
    if (key in blockedInfo) {
        blockedInfo[key].blocked.add(domain)
        blockedInfo[key].count = blockedInfo[key].blocked.size
    } else {
        blockedInfo[key] = {"count": 1, "blocked": new Set([domain])}
    }

    chrome.browserAction.setBadgeText({ tabId: tabId, text: blockedInfo[key].count.toString() })
}

const isTracker = (url, tabId, initiator) => {
    if (domainRegex) {
        allMatches = url.matchAll(domainRegex)
        for (match of allMatches) {
            // console.log("match, initiator...", match[0], initiator, url)
            if (initiator.includes(match[0])) { continue }
            if (
                domains[match[0]].hardblock || RegExp(domains[match[0]].rules).test(url)
            ) {
                setBadgeInfo(tabId, initiator, match[0])
                return true
            }
        }
    }
    return false
}

const storeData = async () => {
    const url = "https://raw.githubusercontent.com/tracker-blocker/tracker-blocker-data/master/block.compiled.minified.json"

    const response = await fetch(url)
    const responseJson = await response.json()

    chrome.storage.local.set({"tbDomainRegex": responseJson.domainRegex}, () => {
        console.log("Domain regex set.")
        domainRegex = responseJson.domainRegex
    })

    chrome.storage.local.set({"tbDomains": responseJson.domains}, () => {
        console.log("Tracker domain information stored.")
        domains = responseJson.domains
    })

    chrome.storage.local.get(["tbUnblockedList"], (unblockList) => {
        console.log("loadedunblocklist", unblockList.tbUnblockedList)
        unblockedDomains = unblockList.tbUnblockedList
    })
    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
}

chrome.runtime.onInstalled.addListener(() => {
    storeData()
    console.log("domain regex", domainRegex)
})

chrome.runtime.onStartup.addListener(()=>{
    storeData()
})

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (details.tabId != -1 && details.initiator) {
        const hostname = new URL(details.initiator).hostname
        if (!unblockedDomains.includes(hostname) && isTracker(details.url, details.tabId, hostname)) {
            console.log(details.url)
            console.log('gotcha!')
            return { cancel: true}
        }
        return { cancel: false};
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.from == "popup" && request.subject == "fetchPopupData") {
        const hostname = new URL(request.tabs[0].url).hostname

        isUnblocked = unblockedDomains.includes(hostname)

        const blockedSiteInfo = blockedInfo[`${request.tabs[0].id}@${hostname}`]
        let tabBlocks = []
        if (blockedSiteInfo) { tabBlocks = [...blockedSiteInfo.blocked]}

        console.log("received from popup", request)
        console.log("sending to popup", tabBlocks, blockedInfo, hostname, request.tabs[0].id)
        sendResponse({tabBlocks: tabBlocks, isUnblocked: isUnblocked})
    }

    if (request.from == "popup" && request.subject == "unblockTracker") {
        console.log("from popup:", request.domain)
        sendResponse({status: "to popup: done!"})
        unblockedDomains.push(request.domain)
        chrome.storage.local.set({"tbUnblockedList": unblockedDomains}, () => {
            console.log("current unblock list", unblockedDomains)
        })
    }
    if (request.from == "popup" && request.subject == "blockTracker") {
        unblockedDomains = unblockedDomains.filter(domain => domain !== request.domain)
        chrome.storage.local.set({"tbUnblockedList": unblockedDomains}, () => {
            console.log("current unblock list", unblockedDomains)
        })
        sendResponse({status: "to popup: done!"})
    }
})


// {
//     frameId: -1
//     initiator: "chrome-extension://lichhobjaapckkmkfikjbigjilmcimoi"
//     method: "GET"
//     parentFrameId: -1
//     requestId: "21128"
//     tabId: -1
//     timeStamp: 1635089437272.0562
//     type: "xmlhttprequest"
//     url: "https://raw.githubusercontent.com/tracker-blocker/tracker-blo
// }
