import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { format } from "date-fns";
import Head from "next/head";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import formatMoney from "../lib/formatMoney";
import OrderStyles from "./styles/OrderStyles";

const SINGLE_ORDER_QUERY = gql`
	query SINGLE_ORDER_QUERY($id: ID!) {
		order(id: $id) {
			id
			total
			user {
				id
			}
			items {
				id
				title
				description
				image
				price
				quantity
			}
		}
	}
`;

class Order extends Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
	};
	state = {};
	render() {
		return (
			<Query query={SINGLE_ORDER_QUERY} variables={{ id: this.props.id }}>
				{({ data, error, loading }) => {
					if (error) return <Error error={error} />;
					if (loading) return <p>Loading...</p>;
					return (
						<div>
							<p>order id = {this.props.id}</p>
						</div>
					);
				}}
			</Query>
		);
	}
}

export default Order;
