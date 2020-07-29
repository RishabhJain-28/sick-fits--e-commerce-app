import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form, { form } from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";
import { PropTypes } from "prop-types";
const RESET_MUTATION = gql`
	mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
		resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
			id
			email
			name
		}
	}
`;

class Reset extends Component {
	static propTypes = {
		resetToken: PropTypes.string.isRequired,
	};
	state = { password: "", confirmPassword: "" };
	saveToState = e => {
		this.setState({ [e.target.name]: e.target.value });
	};
	render() {
		return (
			<Mutation
				mutation={RESET_MUTATION}
				variables={{
					resetToken: this.props.resetToken,
					...this.state,
					//     password
					//     confirmPassword
					//
				}}
				refetchQueries={[{ query: CURRENT_USER_QUERY }]}
			>
				{(reset, { loading, error }) => {
					// if (loading) return <p>Loading</p>;
					// if (Error) return <Error error={error} />;
					return (
						<Form
							method="POST"
							onSubmit={async e => {
								e.preventDefault();
								await reset();
								// this.setState({ email: "" });
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Reset your Password</h2>
								<Error error={error} />
								<label htmlFor="password">
									Password
									<input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.saveToState} />
								</label>
								<label htmlFor="confirmPassword">
									Confirm Password
									<input type="password" name="confirmPassword" placeholder="confirmPassword" value={this.state.confirmPassword} onChange={this.saveToState} />
								</label>
								<button type="submit">change password</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default Reset;
