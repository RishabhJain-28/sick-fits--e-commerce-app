import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

const SIGNOUT_MUTATOIN = gql`
	mutation SIGNOUT_MUTATOIN {
		signout {
			message
		}
	}
`;

const Signout = () => {
	return (
		<Mutation mutation={SIGNOUT_MUTATOIN} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
			{(signout, { error, loading }) => {
				return <button onClick={signout}>Sign Out</button>;
			}}
		</Mutation>
	);
};

export default Signout;
