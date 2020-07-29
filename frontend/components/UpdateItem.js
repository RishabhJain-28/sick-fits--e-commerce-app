import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";

import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";
const UPDATE_ITEM_MUTATION = gql`
	mutation UPDATE_ITEM_MUTATION($id: ID!, $title: String, $description: String, $price: Int) {
		updateItem(id: $id, title: $title, description: $description, price: $price) {
			id
			title
			description
			price
		}
	}
`;

const SNGLE_ITEM_QUERY = gql`
	query SNGLE_ITEM_QUERY($id: ID!) {
		item(where: { id: $id }) {
			id
			title
			description
			price
		}
	}
`;

class UpdateItem extends Component {
	state = {};
	handleChange = e => {
		const { name, type, value } = e.target;
		const val = type === "numbe" ? parseFloat(value) : value;
		this.setState({ [name]: val });
	};
	updateItem = async (e, updateItemMutation) => {
		e.preventDefault();
		const res = await updateItemMutation({
			variables: {
				id: this.props.id,
				...this.state,
			},
		});
	};
	// uploadFile = async e => {
	// 	const files = e.target.files;
	// 	const data = new FormData();
	// 	data.append("file", files[0]);
	// 	data.append("upload_preset", "sickfits"); //needed by cloudinary
	// 	const res = await fetch("https://api.cloudinary.com/v1_1/dyajkyfhr/image/upload", {
	// 		method: "POST",
	// 		body: data,
	// 	});
	// 	const file = await res.json();
	// 	console.log(file);
	// 	this.setState({
	// 		image: file.secure_url,
	// 		largeImage: file.eager[0].secure_url,
	// 	});
	// };
	render() {
		return (
			<Query query={SNGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
				{({ data, loading }) => {
					// console.log(data);
					if (loading) return <p>loading</p>;
					if (!data.item) return <p>No item found for {this.props.id}</p>;
					return (
						<Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
							{(updateItem, { loading, error }) => {
								return (
									<Form
										onSubmit={e => {
											this.updateItem(e, updateItem);
										}}
									>
										<Error error={error}></Error>
										<fieldset disabled={loading} aria-busy={loading}>
											<label htmlFor="title">
												Title
												<input type="text" name="title" id="title" placeholder="Title" required defaultValue={data.item.title} onChange={this.handleChange} />
											</label>
											<label htmlFor="price">
												Price
												<input type="number" name="price" id="price" placeholder="Price" required defaultValue={data.item.price} onChange={this.handleChange} />
											</label>
											<label htmlFor="description">
												Description
												<textarea
													type="text"
													name="description"
													id="description"
													placeholder="Description"
													required
													defaultValue={data.item.description}
													onChange={this.handleChange}
												/>
											</label>
											<button type="submit">Sav{loading ? "ing " : "e"} Changes</button>
										</fieldset>
									</Form>
								);
							}}
						</Mutation>
					);
				}}
			</Query>
		);
	}
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
