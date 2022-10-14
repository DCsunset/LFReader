import { useParams } from "react-router-dom";

function EntryList() {
	const params = useParams();
	// TODO: validate type in params
	console.log(params);

	return (
		<h6>
			Entry list
		</h6>
	);
}

export default EntryList;
