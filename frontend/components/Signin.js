import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form, { form } from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";
const SIGNIN_MUTATION = gql`
	mutation SIGNIN_MUTATION($email: String!, $password: String!) {
		signin(email: $email, password: $password) {
			id
			name
			email
		}
	}
`;

class Signin extends Component {
	state = { email: "", password: "" };
	saveToState = e => {
		this.setState({ [e.target.name]: e.target.value });
	};
	render() {
		// console.log(CURRENT_USER_QUERY);
		return (
			<Mutation mutation={SIGNIN_MUTATION} variables={this.state} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
				{(signin, { loading, error }) => {
					// if (loading) return <p>Loading</p>;
					// if (Error) return <Error error={error} />;
					return (
						<Form
							method="POST"
							onSubmit={async e => {
								e.preventDefault();
								await signin();
								this.setState({ email: "", password: "" });
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Sign in </h2>
								<Error error={error} />
								<label htmlFor="email">
									Email
									<input type="email" name="email" placeholder="email" value={this.state.email} onChange={this.saveToState} />
								</label>
								<label htmlFor="password">
									Password
									<input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.saveToState} />
								</label>
								<button type="submit">SignIN</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default Signin;
