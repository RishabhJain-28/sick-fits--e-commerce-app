import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import PropTypes from "prop-types";
// import {Error} from './ErrorMessage';
const ALL_USERS_QUERY = gql`
	query ALL_USERS_QUERY {
		users {
			id
			name
			permissions
			email
		}
	}
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
	mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission], $userId: ID!) {
		updatePermissions(permissions: $permissions, userId: $userId) {
			id
			permissions
			name
			email
		}
	}
`;

const possiblePermissions = ["ADMIN", "USER", "ITEMCREATE", "ITEMUPDATE", "ITEMDELETE", "PERMISSIONUPDATE"];

const Permission = props => {
	return (
		// <p>sas</p>
		<Query query={ALL_USERS_QUERY}>
			{({ data, loading, error }) => {
				console.log(data);
				return (
					<div>
						<Error error={error} />
						<h2>Manage permissions</h2>
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									{possiblePermissions.map(p => (
										<th key={p}>{p}</th>
									))}
									<th></th>
								</tr>
							</thead>
							<tbody>
								{data.users.map(user => {
									return <User key={user.id} user={user} />;
								})}
							</tbody>
						</Table>
					</div>
				);
			}}
		</Query>
	);
};

class User extends Component {
	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			permission: PropTypes.array,
		}).isRequired,
	};
	state = {
		permissions: this.props.user.permissions,
	};
	handlePermissionChange = e => {
		// console.log(e.target);
		const checkbox = e.target;
		let updatedPermissions = [...this.state.permissions];
		if (checkbox.checked) {
			updatedPermissions.push(checkbox.value);
		} else {
			updatedPermissions = updatedPermissions.filter(p => p !== checkbox.value);
		}
		this.setState({ permissions: updatedPermissions });
	};
	render() {
		const user = this.props.user;
		return (
			<Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{ permissions: this.state.permissions, userId: this.props.user.id }}>
				{(updatePermissions, { loading, error }) => {
					return (
						<>
							{error && (
								<tr>
									<td colSpan="8">
										<Error error={error} />
									</td>
								</tr>
							)}
							<tr>
								<td>{user.name}</td>
								<td>{user.email}</td>
								{possiblePermissions.map(p => (
									<td key={p}>
										<label htmlFor={`${user.id}-permisson-${p}`}>
											<input id={`${user.id}-permisson-${p}`} type="checkbox" checked={this.state.permissions.includes(p)} value={p} onChange={this.handlePermissionChange} />
										</label>
									</td>
								))}
								<td>
									<SickButton type="button" disabled={loading} onClick={updatePermissions}>
										Updat{loading ? "ing" : "e"}
									</SickButton>
								</td>
							</tr>
						</>
					);
				}}
			</Mutation>
		);
	}
}

// export default User;

export default Permission;
