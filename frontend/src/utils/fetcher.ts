import axios from "axios";

const fetcher = async (url: string) => (
	(await axios.get(url)).data
);

export default fetcher;
