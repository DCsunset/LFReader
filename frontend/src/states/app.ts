import { atom } from "recoil";
import { Notification } from "../types/states";

// Only keeps the latest notification
export const notificationState = atom<Notification | null>({
	key: "notification",
	default: null
});
