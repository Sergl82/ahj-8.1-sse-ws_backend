const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
const cors = require("@koa/cors");
const router = require("koa-router");

const WS = require("ws");

const { v4: uuidv4 } = require("uuid");
const { UserConstructor } = require("./src/UserConstructor");

const ctrl = new UserConstructor();
const { User, UserAcc } = require("./src/User");

const user = new User(111, "John Doe", "active");
const post = {
  id: uuidv4(),
  author: user.name,
  content: "Hello!",
  created: "20.01.2022, 15:30:22",
};

//const user = new User(data.id, data.name,data.status)
ctrl.usersArr.push(user);
ctrl.postsList.push(post);

const app = new Koa();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app.callback());

app.use(cors());

app.use(koaBody({ text: true, urlencoded: true, json: true, multipart: true }));

app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    return await next();
  }

  const headers = { "Access-Control-Allow-Origin": "*" }; //сервер может быть вызван из любого источника
  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }
  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    });
    if (ctx.request.get("Access-Control-Request-Headers")) {
      ctx.response.set(
        "Access-Control-Allow-Headers",
        ctx.request.get("Access-Control-Allow-Request-Headers")
      );
    }
    ctx.response.status = 204; // No content
  }
});

app.use(async (ctx) => {
  const { method, id, name } = ctx.request.query;
  console.log(ctx.request.query);
  switch (method) {
    case "getStartedList":
      try {
        const startList = ctx.request.body;
        const result = ctrl.getActiveUsers();
        ctx.response.body = result;
        console.log(ctrl.postsList, "posts");
        console.log(result, "result");
        return result;
      } catch (err) {
        console.error(err);
      }
    case "getUserByName":
      try {
        console.log(ctrl, "ctrl");
        const username = ctx.request.body;
        
        const result = ctrl.getUserByName(username);
        ctx.response.body = result;
        console.log(result, "result");

        return result;
      } catch (err) {
        console.error(err);
      }

      return;
    case "createNewUser":
      try {
        const object = ctx.request.body;

        const result = ctrl.createUser(object);
        ctx.response.body = result;
      } catch (err) {
        console.error(err);
      }
      return;

    case "deleteAll": 
      try {
        const username = ctx.request.body;
        const result = ctrl.deleteAllUsers();
        console.log(ctrl.usersArr, "arr");
        ctx.response.body = result;
        console.log(result, "result");
      } catch (err) {
        console.error(err);
      }
      return;
    default:
      ctx.response.body = `Method "${method}" is not known.`;
      ctx.response.status = 404;
      return;
  }
});

//WebSockets

const wsServer = new WS.Server({ server });

wsServer.on("connection", (ws, req) => {
  console.log("connection");

  const clients = ctrl.getActiveUsers();
  console.log(clients, 'CLIENTS!!!!!');


  [...wsServer.clients]
    .filter((o) => {
      return o.readyState === WS.OPEN;
    })
    .forEach((o) => o.send(JSON.stringify({type: "connect", user: clients[clients.length-1]})));

  ws.on("message", (msg) => {

    const post = JSON.parse(msg);

    if (post.type === "message")
      [...wsServer.clients]
        .filter((o) => {
          return o.readyState === WS.OPEN;
        })
        .forEach((o) => o.send(JSON.stringify(post)));

    if (post.type === "add") {
  console.log(post, 'addpost');
      [...wsServer.clients]
        .filter((o) => {
          return o.readyState === WS.OPEN;
        })
        .forEach((o) => o.send(JSON.stringify(post)));
    }
    if (post.type === "exit") {
      console.log(post, 'postDELETE!!!!!');
      
      
      const userDel = clients.findIndex(elem => elem.id === post.id);
      clients.splice(userDel, 1);
      
      const userInactive = ctrl.getIndexId(ctrl.usersArr, post.id);
      ctrl.usersArr[userInactive].status = "inactive";
      console.log(ctrl.usersArr[userInactive], 'usersArr!!!!!')
      console.log(userDel, 'userDel!!!!');
      [...wsServer.clients]
        .filter((o) => {
          return o.readyState === WS.OPEN;
        })
        .forEach((o) => o.send(JSON.stringify({ type: "exit", id: post.id, arr:clients })));
    }
  });
  ws.on("close", (msg) => {
    console.log("close");
  
    console.log(clients, 'clientsExit');
    const userID = JSON.parse(msg);
    [...wsServer.clients]
      .filter((o) => {
        return o.readyState === WS.OPEN;
      })
      .forEach((o) => o.send(JSON.stringify(clients)));
   ws.close(1000,"disconnect");


  });
});
server.listen(PORT, () =>
  console.log(`Koa server has been started on port ${PORT} ...`)
);
