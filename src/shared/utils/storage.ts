export function getStorage<T>(key: string): Promise<T> {
  return new Promise((res, rej) => {
    chrome.storage.sync.get([key], (data) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      if (key in data) {
        res(data[key] as T);
      } else {
        rej(`Could not find ${key}`);
      }
    });
  });
}

export function setStorage<T>(key: string, data: T): Promise<void> {
  return new Promise((res, rej) => {
    chrome.storage.sync.set({ [key]: data }, () => {
      console.log("Successfully set data to storage API");
      res();
    });
  });
}
