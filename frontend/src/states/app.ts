import { atom } from "recoil";

export const notificationListState = atom({
	key: "NotificationList",
	default: [] as string[]
});
