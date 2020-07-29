const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, createEmail } = require("../mail");
const { hasPermission } = require("../utils");
const { createContext } = require("vm");
const stripe = require("../stripe");

const Mutations = {
	async createItem(parent, args, ctx, info) {
		console.log(ctx.request.userId);
		if (!ctx.request.userId) {
			throw new Error("not loggeddd in");
		}
		const item = await ctx.db.mutation.createItem(
			{
				data: {
					user: {
						connect: {
							id: ctx.request.userId,
						},
					},
					...args,
				},
			},
			info
		);
		return item;
	},
	updateItem(parent, args, ctx, info) {
		const updates = { ...args };
		delete updates.id;
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id,
				},
			},
			info
		);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		const item = await ctx.db.query.item({ where }, `{id title user{id}}`);
		const ownsItem = item.user.id === ctx.request.userId;
		const hasPermissions = ctx.request.user.permissions.some(p => ["ADMIN", "ITEM"].includes(p));
		if (!ownsItem && !hasPermissions) {
			throw new Error("not allowed");
		}
		return ctx.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase();
		args.password = await bcrypt.hash(args.password, 10);
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					permissions: { set: ["USER"] },
				},
			},
			info
		);
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24, //one day
		});
		return user;
	},
	async signin(parent, { email, password }, ctx, info) {
		// email=email.toLowerCase();
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`no such email found`);
		}
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error(`invalid pass`);
		}
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
		});
		return user;
	},
	async signout(parent, args, ctx, info) {
		ctx.response.clearCookie("token");
		return { message: "Signed out" };
	},

	async requestReset(parent, args, ctx, info) {
		const user = await ctx.db.query.user({ where: { email: args.email } });
		if (!user) {
			throw new Error("no user");
		}
		const resetToken = (await promisify(randomBytes)(20)).toString("hex");
		const resetTokenExpiry = Date.now() + 3600000;

		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: {
				resetToken,
				resetTokenExpiry,
			},
		});
		// console.log(res);
		const mailRes = await transport.sendMail({
			from: "rx@zxc.com",
			to: user.email,
			subject: "password reset request",
			html: createEmail(`Your password reset token is here \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">click here to reset password</a>`),
		});
		console.log(mailRes);
		return { message: "reset email set" };
	},

	async resetPassword(parent, { password, confirmPassword, resetToken }, ctx, info) {
		console.log(password, confirmPassword);
		if (password !== confirmPassword) {
			throw new Error("passwords do not match");
		}

		const [user] = await ctx.db.query.users({
			where: {
				resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000,
			},
		});

		if (!user) {
			throw new Error("invalid or eexpired token");
		}
		const newPassword = await bcrypt.hash(password, 10);

		const updateUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password: newPassword,
				resetToken: null,
				resetTokenExpiry: null,
			},
		});

		const token = jwt.sign({ userId: updateUser.id }, process.env.APP_SECRET);

		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
		});
		return updateUser;
	},
	async updatePermissions(parent, args, ctx, info) {
		if (!ctx.request.userId) throw new Error("not logged  in");
		const user = await ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
		hasPermission(user, ["ADMIN", "PERMISSIONUPDATE"]);
		return ctx.db.mutation.updateUser(
			{
				data: {
					permissions: {
						set: args.permissions,
					},
				},
				where: {
					id: args.userId,
				},
			},
			info
		);
	},
	async addToCart(parent, args, ctx, info) {
		if (!ctx.request.userId) {
			throw new Error("not logged in");
		}
		const [existinhCartItem] = await ctx.db.query.cartItems({
			where: {
				user: { id: ctx.request.userId },
				item: { id: args.id },
			},
		});
		if (existinhCartItem) {
			// console.log("alreaady in cart");
			return ctx.db.mutation.updateCartItem(
				{
					where: { id: existinhCartItem.id },
					data: {
						quantity: existinhCartItem.quantity + 1,
					},
				},
				info
			);
		}
		return ctx.db.mutation.createCartItem(
			{
				data: {
					user: { connect: { id: ctx.request.userId } },
					item: { connect: { id: args.id } },
				},
			},
			info
		);
	},
	async removeCartItem(parent, args, ctx, info) {
		const cartItem = await ctx.db.query.cartItem(
			{
				where: {
					id: args.id,
				},
			},
			"{id,user{id}}"
		);
		if (!cartItem) throw new Error("No cart item found!!");
		if (cartItem.user.id !== ctx.request.userId) throw new Error("you dont own the item.cant delete it");
		return ctx.db.mutation.deleteCartItem(
			{
				where: {
					id: args.id,
				},
			},
			info
		);
	},
	async createOrder(parent, args, ctx, info) {
		if (!ctx.request.userId) throw new Error("You must be signed in");
		const user = await ctx.db.query.user(
			{ where: { id: ctx.request.userId } },
			`
		{
			id
			name
			email
			cart{
				id
				quantity
				item { title price id description image largeImage}
			}
		}
		`
		);
		// user.cart.forEach(c => console.log(c.item));

		const amount = user.cart.reduce((tally, c) => {
			return tally + c.item.price * c.quantity;
		}, 0);
		// console.log("aaaaaaa", amount);
		const charge = await stripe.charges.create({
			amount,
			currency: "INR",
			source: args.token,
		});
		// console.log(charge);
		const orderItems = user.cart.map(c => {
			const orderItem = {
				...c.item,
				quantity: c.quantity,
				user: { connect: { id: ctx.request.userId } },
			};
			delete orderItem.id;
			return orderItem;
		});
		const order = await ctx.db.mutation.createOrder({
			data: {
				total: charge.amount,
				charge: charge.id,
				items: { create: orderItems },
				user: { connect: { id: ctx.request.userId } },
			},
		});
		const cartItemIds = user.cart.map(c => c.id);
		await ctx.db.mutation.deleteManyCartItems({
			where: {
				id_in: cartItemIds,
			},
		});
		return order;
	},
};

module.exports = Mutations;
