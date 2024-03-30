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
import { updateAllTabs, updateAllTabsExceptCurr } from "../shared/utils/tabs";

function Popup() {
  const [replacerInfo, dispatch] = useReducer(
    ReplacerInfoReducer,
    InitialialReplacerInfoState,
  );
  const [urls, setURLs] = useState<Record<string, ReplacerInfo> | null>(null);
  async function handleURLSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { url, replaceThis, withThis } = replacerInfo;

    const updatedURLS = { ...urls };
    Object.assign(updatedURLS, {
      [url]: { replaceThis, withThis },
    });

    setStorage(StorageKeys.URLSMap, updatedURLS).then(() => {
      setURLs(updatedURLS);
      dispatch({ type: RESET_REPLACER_INFO, payload: {} });
      updateAllTabsExceptCurr({
        type: DataTypes.UpdateURLS,
        data: updatedURLS,
      });
    });
  }

  function handleInputChange(
    keyOfChange: keyof typeof InitialialReplacerInfoState,
    change: string,
  ) {
    dispatch({
      type: SET_REPLACER_INFO,
      payload: { [keyOfChange]: change },
    });
  }

  function clear() {
    setStorage(StorageKeys.URLSMap, {}).then(() => {
      updateAllTabs({ type: DataTypes.UpdateURLS, data: {} });
    });
  }

  useEffect(() => {
    async function getInitialURLsMap() {
      const initialURLsMap = await getStorage<URLSMapType>(StorageKeys.URLSMap);
      setURLs(initialURLsMap);
    }
    getInitialURLsMap();
    chrome.runtime.onMessage.addListener((message) => {
      console.log({ message });
      switch (message.type) {
        case DataTypes.UpdateURLS:
          setURLs(message.data as URLSMapType);
      }
    });
  }, [setURLs]);

  const urlList = useMemo(() => Array.from(Object.entries(urls ?? {})), [urls]);

  return (
    <div className="App" style={{ height: 300, width: 300 }}>
      <header className="App-header">
        <div className="clear-btn-container">
          <button className="clear-btn" onClick={clear}>
            Clear
          </button>
        </div>
        <form className="container" onSubmit={handleURLSubmit}>
          <label>
            Replace text in URLS that start with:
            <input
              onChange={(e) => handleInputChange("url", e.target.value)}
              value={replacerInfo.url}
              placeholder="https://"
            />
          </label>
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
  <Popup />,
);
