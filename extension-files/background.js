console.log("here!")

const re = RegExp("google-analytics\.com\/analytics\.js")

const isTracker = (url) => {
    return re.test(url)
}

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


