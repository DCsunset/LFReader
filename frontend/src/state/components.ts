import { createStore } from "solid-js/store"
import { Feed } from "./feed";
import { FeedInfo } from "./actions";

export const feedDialogState = createStore({
  open: false,
  feed: undefined as Feed|undefined,
  onSave: undefined as ((feed: FeedInfo) => Promise<boolean>) | undefined
})

