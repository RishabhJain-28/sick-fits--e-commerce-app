const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
	// 	async items(parent, args, ctx, info) {
	// 		const items = await ctx.db.query.items();
	// 		return items;
	// 	},
	items: forwardTo("db"),
	item: forwardTo("db"),
	itemsConnection: forwardTo("db"),

	me(parent, args, ctx, info) {
		if (!ctx.request.userId) {
			return null;
		}
		return ctx.db.query.user(
			{
				where: { id: ctx.request.userId },
			},
			info
		);
	},
	async users(parent, args, ctx, info) {
		if (!ctx.request.userId) {
			throw new Error("not logged in");
		}
		hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
		return ctx.db.query.users({}, info);
	},
	async order(parent, args, ctx, info) {
		if (!ctx.request.userId) throw new Error("Not logged in");
		const order = await ctx.db.query.order({ where: { id: args.id } }, info);

		const ownsOrder = order.user.id === ctx.request.userId;
		console.log(ctx.request.user.permissions);
		const hasPermissionToSeeOrder = ctx.request.user.permissions.includes("ADMIN");

		console.log(hasPermissionToSeeOrder);
		if (!ownsOrder && !hasPermissionToSeeOrder) throw new Error("you cant see order");

		return order;
	},
};
module.exports = Query;
