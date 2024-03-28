function replaceURL(oldURL: string, newURL: string) {
  let result = newURL;

  for (let i = newURL.length + 1; i < oldURL.length; i++) {
    const char = oldURL[i];
    console.log({ char, result });
    result += char;
  }
  return result;
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.url.startsWith("https://www.reddit.com")) {
    const shReddit = "https://sh.reddit.com/";
    // const redirectUrlParams = new URLSearchParams({ originalUrl: details.url });
    const finalRedirectUrl = replaceURL(details.url, shReddit);
    console.log({ finalRedirectUrl });
    chrome.tabs.update(details.tabId, { url: finalRedirectUrl });
  }
});

export {};
