import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";
const ADD_TO_CART_MUTATION = gql`
	mutation ADD_TO_CART_MUTATION($id: ID!) {
		addToCart(id: $id) {
			id
			quantity
		}
	}
`;

class AddToCart extends Component {
	state = {};
	// update=(cache,payload)=>{
	// 	const data = cache.readQuery({ query: CURRENT_USER_QUERY });
	// 	// console.log(data);
	// 	// console.log(payload);
	// 	console.log("update-addtocart");
	// 	const cartItemId = payload.data.removeCartItem.id;
	// 	data.me.cart = data.me.cart.filter(c => c.id !== cartItemId);
	// 	cache.writeQuery({ query: CURRENT_USER_QUERY, data });

	// }
	render() {
		const { id } = this.props;
		return (
			<Mutation
				mutation={ADD_TO_CART_MUTATION}
				variables={{ id }}
				refetchQueries={[{ query: CURRENT_USER_QUERY }]}
				// update={this.update}
				// optimisticResponse={{
				// 	__typename: "Mutation",
				// 	addToCart: {
				// 		__typename: "addToCart",
				// 		id,
				// 	},
				// }}
			>
				{(addToCart, { error, loading }) => (
					<button disabled={loading} onClick={addToCart}>
						{" "}
						Add{loading ? "ing" : ""} to cart
					</button>
				)}
			</Mutation>
		);
	}
}

export default AddToCart;
