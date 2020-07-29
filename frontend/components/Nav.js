import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import Signout from "./Signout";
import { Mutation } from "react-apollo";
import { TOGGLE_CART_MUTATION } from "./Cart";
import CartCount from "./CartCount";
const Nav = () => {
	return (
		<User>
			{({ data: { me } }) => {
				return (
					<NavStyles>
						<Link href="/items">
							<a>Shop</a>
						</Link>
						{me && (
							<>
								<Link href="/sell">
									<a>sell</a>
								</Link>
								<Link href="/orders">
									<a>orders</a>
								</Link>
								<Link href="/me">
									<a>Accont</a>
								</Link>
								<Signout />
								<Mutation mutation={TOGGLE_CART_MUTATION}>
									{toggleCart => (
										<button onClick={toggleCart}>
											My cart
											<CartCount count={me.cart.reduce((tally, c) => tally + c.quantity, 0)} />
										</button>
									)}
								</Mutation>
							</>
						)}
						{!me && (
							<Link href="/signup">
								<a>sign In</a>
							</Link>
						)}
					</NavStyles>
				);
			}}
		</User>
	);
};

export default Nav;
