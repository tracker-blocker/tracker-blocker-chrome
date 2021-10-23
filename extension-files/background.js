
// const re = RegExp("google-analytics\.com\/analytics\.js")
let domainRegex = null
let domains = {}

const isTracker = (url) => {
    if (domainRegex) {
        // TODO: Implement proper logic here

        return domainRegex.test(url)
    }
    return false
}

const storeData = async () => {
    const url = "https://raw.githubusercontent.com/tracker-blocker/tracker-blocker-data/master/block.compiled.minified.json"

    const response = await fetch(url)
    const responseJson = await response.json()

    chrome.storage.local.set({"tbDomainRegex": responseJson.domainRegex}, () => {
        console.log("Domain regex set.")
        domainRegex = RegExp(responseJson.domainRegex)
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
        if (isTracker(details.url)) {
            console.log(details.url)
            console.log('gotcha!')
            return { cancel: true}
        }
        return { cancel: false};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
)


