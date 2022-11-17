import { Base64 } from "js-base64";

export interface Params {
	type?: "tag" | "feed",
	item?: string
};

export const parseParams = (params: Params): Params => ({
	...params,
	item: params.item && Base64.decode(params.item)
});
