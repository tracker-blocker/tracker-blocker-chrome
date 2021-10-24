let domainRegex = null
let domains = {}

const blockedInfo = {}
// {"tabId@initiator":{"count": 1, "blocked": []}}

const setBadgeInfo = (tabId, initiator, domain) => {
    console.log('sent:', tabId, domain, initiator)
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
}

chrome.runtime.onInstalled.addListener(()=>{
    storeData()
    console.log("domain regex", domainRegex)
})

chrome.runtime.onStartup.addListener(()=>{
    storeData()
})

chrome.webRequest.onBeforeRequest.addListener((details) => {
    // console.log("details", details)
    if (details.tabId != -1 && isTracker(details.url, details.tabId, details.initiator)) {
            console.log(details.url)
            console.log('gotcha!')
            return { cancel: true}
        }
        return { cancel: false};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
)


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