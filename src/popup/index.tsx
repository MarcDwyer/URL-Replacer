import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import ReactDOM from "react-dom/client";
import { DataTypes, StorageKeys } from "../shared/enums";
import {
  InitialialReplacerInfoState,
  ReplacerInfoReducer,
  RESET_REPLACER_INFO,
  SET_REPLACER_INFO,
} from "./reducers/replacerInfoReducer";
import { ReplacerInfo, URLSMapType } from "../shared/storageTypes";
import { getStorage, setStorage } from "../shared/utils/storage";
import "./index.css";
import { updateAllTabs } from "../shared/utils/tabs";

type Tab = chrome.tabs.Tab;

function getCurrentTab(): Promise<Tab> {
  return new Promise((res) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      console.log("Current tab:", currentTab.url);
      res(currentTab);
    });
  });
}

function Popup() {
  const [replacerInfo, dispatch] = useReducer(
    ReplacerInfoReducer,
    InitialialReplacerInfoState
  );

  const [currentTab, setCurrentTab] = useState<Tab | null>(null);

  const [urls, setURLs] = useState<Record<string, ReplacerInfo> | null>(null);

  async function handleURLSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentTab || (currentTab && !currentTab.url)) return;
    const { replaceThis, withThis } = replacerInfo;

    const url = currentTab.url as string;

    const updatedURLS = { ...urls };
    Object.assign(updatedURLS, {
      [url]: { replaceThis, withThis },
    });

    setStorage(StorageKeys.URLSMap, updatedURLS).then(() => {
      setURLs(updatedURLS);
      dispatch({ type: RESET_REPLACER_INFO, payload: {} });
      chrome.runtime.sendMessage({
        message: { type: DataTypes.UpdateURLS, data: updatedURLS },
      });
      chrome.tabs.reload(currentTab.id ?? -1);
    });
  }

  function handleInputChange(
    keyOfChange: keyof typeof InitialialReplacerInfoState,
    change: string
  ) {
    dispatch({
      type: SET_REPLACER_INFO,
      payload: { [keyOfChange]: change },
    });
  }

  function clear() {
    setStorage(StorageKeys.URLSMap, {}).then(() => {
      updateAllTabs({ type: DataTypes.UpdateURLS, data: {} });
      chrome.runtime.sendMessage({
        message: { type: DataTypes.UpdateURLS, data: {} },
      });
      setURLs({});
    });
  }
  useEffect(() => {
    async function getInitialURLsMap() {
      const initialURLsMap = await getStorage<URLSMapType>(StorageKeys.URLSMap);
      setURLs(initialURLsMap);
    }
    getInitialURLsMap();
  }, [setURLs]);

  useEffect(() => {
    getCurrentTab().then((tab) => setCurrentTab(tab));
  }, []);

  const urlList = useMemo(() => Array.from(Object.entries(urls ?? {})), [urls]);

  console.log({ currentTab });

  return (
    <div className="App" style={{ height: 300, width: 300 }}>
      <header className="App-header">
        <div className="clear-btn-container">
          <button className="clear-btn" onClick={clear}>
            Clear
          </button>
        </div>
        <form className="container" onSubmit={handleURLSubmit}>
          {currentTab && <label>Replace the text of {currentTab.url}</label>}
          <label>
            The text to replace
            <input
              onChange={(e) => handleInputChange("replaceThis", e.target.value)}
              value={replacerInfo.replaceThis}
              placeholder="..."
            />
          </label>
          <label>
            With this:
            <input
              onChange={(e) => handleInputChange("withThis", e.target.value)}
              value={replacerInfo.withThis}
              placeholder="..."
            />
          </label>
          <button type="submit">Add</button>
        </form>
        <div className="list-container">
          {urlList.map(([url, { withThis, replaceThis }], index) => {
            return (
              <div key={index}>
                {url}
                <span>
                  Replacing {replaceThis} with {withThis}
                </span>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Popup />
);
