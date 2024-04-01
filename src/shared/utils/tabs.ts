import { DataTypes } from "../enums";

export function updateAllTabs<T>(data: T) {
  chrome.tabs.query({}, (tabs) => {
    for (const { id } of tabs) {
      if (id) {
        chrome.tabs
          .sendMessage(id, { type: DataTypes.UpdateURLS, data })
          .catch(console.error);
      }
    }
  });
}

export function updateAllTabsExceptCurr<T>(data: T) {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    function (currentTabs) {
      const currentTabId = currentTabs[0].id;

      // Get all tabs
      chrome.tabs.query({}, function (allTabs) {
        // Filter out the current tab
        const tabsToSend = allTabs.filter((tab) => tab.id !== currentTabId);

        // Send data to each tab
        tabsToSend.forEach(function (tab) {
          chrome.tabs.sendMessage(tab.id ?? -1, { data });
        });
      });
    }
  );
}

export type Tab = chrome.tabs.Tab;

export function getCurrentTab(): Promise<Tab> {
  return new Promise((res, rej) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        res(currentTab);
      } else {
        rej(`Current tab not found`);
      }
    });
  });
}
