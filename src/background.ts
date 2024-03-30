import { DataTypes, StorageKeys } from "./shared/enums";
import { URLSMapType } from "./shared/storageTypes";
import { replaceSubstring } from "./shared/utils/replaceString";
import { getStorage } from "./shared/utils/storage";
function setListeners(urlsMap: URLSMapType) {
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    let url = details.url;

    for (const [replacerURL, { replaceThis, withThis }] of Object.entries(
      urlsMap,
    )) {
      if (url.startsWith(replacerURL)) {
        url = replaceSubstring(url, replaceThis, withThis);
      }
    }
    chrome.tabs.update(details.tabId, { url });
  });
}

async function main() {
  const urlsMap = await getStorage<URLSMapType>(StorageKeys.URLSMap);
  setListeners(urlsMap);

  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === DataTypes.UpdateURLS) {
      setListeners(message.data as URLSMapType);
    }
  });
}
main();
