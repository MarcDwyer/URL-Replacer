import { DataTypes, StorageKeys } from "./shared/enums";
import { ReplacerInfoPayload } from "./shared/payloadTypes";
import { URLSMapType } from "./shared/storageTypes";
import { replaceSubstring } from "./shared/utils/replaceString";
import { getStorage, setStorage } from "./shared/utils/storage";

let urlsCache: URLSMapType = {};

function checkURL({
  url,
  tabId,
}: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
  if (!url) return;
  try {
    const { origin } = new URL(url);
    if (origin in urlsCache) {
      const { replaceThis, withThis } = urlsCache[origin];
      const newURL = replaceSubstring(url, replaceThis, withThis);
      chrome.tabs.update(tabId, { url: newURL }).catch(console.error);
    }
  } catch (e) {
    console.error("Error: " + e);
  }
}
chrome.webNavigation.onBeforeNavigate.addListener(checkURL);

chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
  switch (message.type) {
    case DataTypes.UpdateURLS:
      const { url, replaceThis, withThis } =
        message.data as ReplacerInfoPayload;
      Object.assign(urlsCache, { [url]: { replaceThis, withThis } });
      setStorage(StorageKeys.URLSMap, urlsCache).then(() => {
        sendResp({ updatedURLs: urlsCache });
      });
      break;
    case DataTypes.ClearURLS:
      setStorage(StorageKeys.URLSMap, {}).then(() => {
        urlsCache = {};
        sendResp({ updatedURLs: urlsCache });
      });
  }
  return true;
});

getStorage<URLSMapType>(StorageKeys.URLSMap).then(
  (urlsMap) => (urlsCache = urlsMap)
);
