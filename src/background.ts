import { DataTypes, StorageKeys } from "./shared/enums";
import { URLSMapType } from "./shared/storageTypes";
import { replaceSubstring } from "./shared/utils/replaceString";
import { getStorage } from "./shared/utils/storage";
function setListeners(urlsMap: URLSMapType) {
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    const url = details.url;
    console.log({ url });
    const replacerInfo = Object.entries(urlsMap);
    console.log({ replacerInfo });
    for (const [replacerURL, { replaceThis, withThis }] of replacerInfo) {
      if (url.startsWith(replacerURL)) {
        const newURL = replaceSubstring(url, replaceThis, withThis);
        chrome.tabs.update(details.tabId, { url: newURL }).catch(console.error);
      }
    }
  });
}

async function main() {
  try {
    const urlsMap = await getStorage<URLSMapType>(StorageKeys.URLSMap);
    setListeners(urlsMap);
  } catch (e) {
    console.error(e);
  }

  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === DataTypes.UpdateURLS) {
      setListeners(message.data as URLSMapType);
    }
  });
}
main();
