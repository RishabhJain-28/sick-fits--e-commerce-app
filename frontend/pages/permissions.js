import PleaseSignIn from "../components/PleaseSignIn";
import Permission from "./../components/Permission";
const Permissons = props => (
	<div>
		<PleaseSignIn>
			<p>Permissons</p>
			<Permission />
		</PleaseSignIn>
	</div>
);

export default Permissons;
