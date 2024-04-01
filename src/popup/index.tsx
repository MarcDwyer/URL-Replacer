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
import { getStorage } from "../shared/utils/storage";
import "./index.css";
import { Tab, getCurrentTab } from "../shared/utils/tabs";
import { ReplacerInfoPayload } from "../shared/payloadTypes";

const runtime = chrome.runtime;

function Popup() {
  const [replacerInfo, dispatch] = useReducer(
    ReplacerInfoReducer,
    InitialialReplacerInfoState
  );

  const [currentTab, setCurrentTab] = useState<Tab | null>(null);

  const [urls, setURLs] = useState<Record<string, ReplacerInfo> | null>(null);

  const url = useMemo(() => {
    if (!currentTab || !currentTab.url) {
      return null;
    }
    return new URL(currentTab.url);
  }, [currentTab]);

  async function handleURLSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentTab || !url) return;
    const { replaceThis, withThis } = replacerInfo;

    const data: ReplacerInfoPayload = {
      url: url.origin,
      replaceThis,
      withThis,
    };
    try {
      const resp = (await runtime.sendMessage({
        type: DataTypes.UpdateURLS,
        data,
      })) as { updatedURLs: URLSMapType };
      const updatedURLs = resp.updatedURLs;
      if (!updatedURLs) throw "UpdatedURLs not in response";
      dispatch({ type: RESET_REPLACER_INFO, payload: {} });
      setURLs(updatedURLs);
      chrome.tabs.reload(currentTab.id ?? -1);
    } catch (e) {
      console.error(e);
    }
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
    runtime
      .sendMessage({ type: DataTypes.ClearURLS })
      .then(({ updatedURLs }) => {
        setURLs(updatedURLs);
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
    if (!currentTab) {
      getCurrentTab().then((tab) => setCurrentTab(tab));
    }
  }, [setCurrentTab]);

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
          {url && <label>Replace the text of {url.origin}</label>}
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
