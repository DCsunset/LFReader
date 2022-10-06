import axios from "axios";

/// Download and parse html file to get the icon
async function fetchIcon(url: string) {
	try {
		const { data } = await axios.get(url);
		const parser = new DOMParser();
		const doc = parser.parseFromString(data, "text/html");
		const nodes = doc.getElementsByTagName("link");
		for (const node of nodes) {
			const relAttr = node.getAttribute("rel");
			if (relAttr === "icon") {
				return node.getAttribute("href");
			}
		}
		return undefined;
	}
	catch (err) {
		console.error(err);
		return undefined;
	}
}

export default fetchIcon;
