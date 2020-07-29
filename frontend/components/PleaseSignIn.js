import React, { Component } from "react";
import { CURRENT_USER_QUERY } from "../components/User";
import Signin from "./Signin";
import { Query } from "react-apollo";

const PleaseSignIn = props => (
	<Query query={CURRENT_USER_QUERY}>
		{({ data, loading }) => {
			if (loading) return <p>loading...</p>;
			if (!data.me) {
				return (
					<div>
						<p>please sign in first</p>
						<Signin />
					</div>
				);
			}
			return props.children;
		}}
	</Query>
);

export default PleaseSignIn;
