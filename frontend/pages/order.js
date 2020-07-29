import PleaseSignIn from "../components/PleaseSignIn";
import Order from "./../components/Order";
const orderPage = props => (
	<div>
		<PleaseSignIn>
			<Order id={props.query.id} />
		</PleaseSignIn>
	</div>
);

export default orderPage;
