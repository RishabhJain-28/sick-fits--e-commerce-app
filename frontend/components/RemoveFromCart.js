import React, { Component } from "react";
import { Mutation } from "react-apollo";
import styled from "styled-components";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";

const REMOVE_FROM_CART_MUTATION = gql`
	mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
		removeCartItem(id: $id) {
			id
		}
	}
`;

const BigButton = styled.button`
	font-size: 3rem;
	background: none;
	border: none;
	&:hover {
		color: ${props => props.theme.red};
		cursor: pointer;
	}
`;

class RemoveFromCart extends Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
	};
	update = (cache, payload) => {
		const data = cache.readQuery({ query: CURRENT_USER_QUERY });
		// console.log(data);
		// console.log(payload);
		console.log("update");
		const cartItemId = payload.data.removeCartItem.id;
		data.me.cart = data.me.cart.filter(c => c.id !== cartItemId);
		cache.writeQuery({ query: CURRENT_USER_QUERY, data });
	};
	state = {};
	render() {
		return (
			<Mutation
				mutation={REMOVE_FROM_CART_MUTATION}
				variables={{ id: this.props.id }}
				update={this.update}
				optimisticResponse={{
					__typename: "Mutation",
					removeCartItem: {
						__typename: "CartItem",
						id: this.props.id,
					},
				}}
			>
				{(removeFromCart, { loading, error }) => (
					<BigButton
						onClick={() => {
							removeFromCart().catch(err => alert(err.message));
						}}
						disabled={loading}
						title="Delete Item"
					>
						&times;
					</BigButton>
				)}
			</Mutation>
		);
	}
}

export default RemoveFromCart;
