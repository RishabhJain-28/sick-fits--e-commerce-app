require("dotenv").config({ path: "variables.env" });
const cookieParsser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const createServer = require("./createServer");
const db = require("./db");
// const db = require("./db");
const server = createServer();
server.express.use(cookieParsser());

server.express.use((req, res, next) => {
	const { token } = req.cookies;
	if (token) {
		const { userId } = jwt.verify(token, process.env.APP_SECRET);
		req.userId = userId;
	}

	next();
});
server.express.use(async (req, res, next) => {
	if (!req.userId) return next();

	const user = await db.query.user({ where: { id: req.userId } }, "{id, permissions, name, email}");
	// console.log(user);
	// if()
	req.user = user;
	next();
});

server.start(
	{
		cors: {
			credentials: true,
			origin: process.env,
		},
	},
	details => {
		console.log(`server is now running on port http:/localhost:${details.port}`);
	}
);
