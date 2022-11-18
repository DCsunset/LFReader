import { Base64 } from "js-base64";

// Route: /:type/:item/:entry
export interface Params {
	type?: "tag" | "feed",
	item?: string,
	entry?: string
};

// Parse Base64-encoded params
export const parseParams = (params: Params): Params => ({
	...params,
	item: params.item && Base64.decode(params.item),
	entry: params.entry&& Base64.decode(params.entry)
});
