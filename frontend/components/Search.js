import React, { Component } from "react";
import Downshift, { resetIdCounter } from "downshift";
import Router from "next/router";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { DropDownItem, DropDown, SearchStyles } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
	query SEARCH_ITEMS_QUERY($searchTerm: String!) {
		items(where: { OR: [{ title_contains: $searchTerm }, { description_contains: $searchTerm }] }) {
			id
			image
			title
		}
	}
`;

function routeToitem(item) {
	Router.push({
		pathname: "/item",
		query: {
			id: item.id,
		},
	});
}

class AutoComplete extends Component {
	state = { items: [], loading: false };
	onChange = debounce(async (e, client) => {
		// console.log("se");
		this.setState({ loading: true });
		const res = await client.query({
			query: SEARCH_ITEMS_QUERY,
			variables: {
				searchTerm: e.target.value,
			},
		});
		this.setState({ items: res.data.items, loading: false });
	}, 350);
	render() {
		resetIdCounter();
		return (
			<SearchStyles>
				<Downshift onChange={routeToitem} itemToString={i => (i === null ? "" : i.title)}>
					{({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => {
						return (
							<div>
								<ApolloConsumer>
									{client => (
										<input
											{...getInputProps({
												type: "search",
												placeholder: "search for an item",
												id: "search",
												className: this.state.loading ? "loading " : "",
												onChange: e => {
													e.persist();
													this.onChange(e, client);
												},
											})}
										/>
									)}
								</ApolloConsumer>
								{isOpen && (
									<DropDown>
										{this.state.items.map((i, index) => (
											<DropDownItem {...getItemProps({ item: i })} highlighted={index === highlightedIndex} key={i.id}>
												<img width="50" src={i.image} alt={i.title} />
												{i.title}
											</DropDownItem>
										))}
										{!this.state.items.length && !this.state.loading && <DropDownItem>Nothing Found {inputValue}</DropDownItem>}
									</DropDown>
								)}
							</div>
						);
					}}
				</Downshift>
			</SearchStyles>
		);
	}
}

export default AutoComplete;
