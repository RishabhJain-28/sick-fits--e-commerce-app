import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import NProgress from "nprogress";
import calcTotalPrice from "./../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";
import order from "../pages/order";

const CREATE_ORDER_MUTATION = gql`
	mutation CREATE_ORDER_MUTATION($token: String!) {
		createOrder(token: $token) {
			id
			charge
			total
			items {
				id
				title
			}
		}
	}
`;

function totalItems(cart) {
	return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class Checkout extends Component {
	state = {};
	onToken = async (res, createOrder) => {
		// console.log(res);
		NProgress.start();
		const order = await createOrder({ variables: { token: res.id } }).catch(err => alert(err.message));
		// console.log(order);
		Router.push({
			pathname: "/order",
			query: { id: order.data.createOrder.id },
		});
	};
	render() {
		return (
			<User>
				{({ data: { me } }) => {
					return (
						<Mutation mutation={CREATE_ORDER_MUTATION} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
							{(createOrder, { loading, error }) => (
								<StripeCheckout
									amount={me && calcTotalPrice(me.cart)}
									name="Sick fits"
									image={me.cart[0] && me.cart[0].item && me.cart[0].item.image}
									description={`order of ${totalItems(me.cart)}`}
									stripeKey="pk_test_51GzN7gBoaZ3yBSZqXnNISYHSP5EZfSg4AotlvgZGOQauUvNcFvrVNvMYg2QJ22ggO5x5IXjMs8aYgFjbbVxOOhlV00tiXcFAFE"
									currency="USD"
									email={me.email}
									token={res => this.onToken(res, createOrder)}
								>
									{this.props.children}
								</StripeCheckout>
							)}
						</Mutation>
					);
				}}
			</User>
		);
	}
}

export default Checkout;
