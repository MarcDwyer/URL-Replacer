import { DataTypes, StorageKeys } from "./shared/enums";
import { URLSMapType } from "./shared/storageTypes";
import { replaceSubstring } from "./shared/utils/replaceString";
import { getStorage } from "./shared/utils/storage";

async function checkURL({
  url,
  tabId,
}: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
  if (!url) return;
  try {
    const urlsMap = await getStorage<URLSMapType>(StorageKeys.URLSMap);

    if (url in urlsMap) {
      const { replaceThis, withThis } = urlsMap[url];
      const newURL = replaceSubstring(url, replaceThis, withThis);
      console.log({ newURL });
      chrome.tabs.update(tabId, { url: newURL }).catch(console.error);
    }
  } catch (e) {
    console.error("Error: " + e);
  }
}
chrome.webNavigation.onBeforeNavigate.addListener(checkURL);

chrome.runtime.onMessage.addListener(async (message) => {
  console.log({ message });
  if (message.type === DataTypes.UpdateURLS) {
    console.log({ message });
  }
});
