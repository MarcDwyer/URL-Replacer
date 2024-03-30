import { ReplacerInfoPayload } from "../../shared/payloadTypes";

export const InitialialReplacerInfoState: ReplacerInfoPayload = {
  url: "",
  replaceThis: "",
  withThis: "",
};

type Action = {
  type: Symbol;
  payload: Partial<ReplacerInfoPayload>;
};

export const SET_REPLACER_INFO = Symbol(),
  RESET_REPLACER_INFO = Symbol();

export function ReplacerInfoReducer(
  state: ReplacerInfoPayload,
  { type, payload }: Action,
): ReplacerInfoPayload {
  switch (type) {
    case SET_REPLACER_INFO:
      return { ...state, ...payload };
    case RESET_REPLACER_INFO:
      return { ...InitialialReplacerInfoState };
    default:
      return state;
  }
}
