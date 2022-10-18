import { useParams } from "react-router-dom";

function EntryListLayout() {
	const params = useParams();
	// TODO: validate type in params
	console.log(params);

	return (
		<h6>
			Entry list
		</h6>
	);
}

export default EntryListLayout;
