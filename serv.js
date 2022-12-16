const http = require("http");
const fs = require("fs");

const { db: data } = require("./db");

const port = 8000;
const hostname = "localhost";

function setHeader(res, status) {
  res.writeHead(status, { "Content-type": "application/json" });
}

function reqHandler(req, res) {
  const { url, method } = req;
  const urlSplited = url.split("/");

  const db = urlSplited[1];
  const selectedDb = data?.find((el) => Object.keys(el)[0] == db)?.[db] || [];

  const route = urlSplited[2];
  const selectedRoute =
    selectedDb?.find((el) => Object.keys(el)?.[0] == route)?.[route] || [];

  const id = urlSplited[3];
  const selectedProperty = selectedRoute?.find((el) => el.id == id);

  if (!db || db == "/" || !selectedDb) {
    setHeader(res, 404);
    res.end('{"message" : "no database selected"}');
  } else {
    if (!route || route == "/" || !selectedRoute) {
      setHeader(res, 404);
      res.end('{"message" : "no route selected"}');
    } else {
      if (method == "GET") {
        if (!id || id == "/" || !selectedProperty) {
          setHeader(res, 200);
          res.end(JSON.stringify(selectedRoute));
        } else {
          setHeader(res, 200);
          res.end(JSON.stringify(selectedProperty));
        }
      } else if (method == "POST") {
        setHeader(res, 200);
      } else if (method == "PUT") {
        setHeader(res, 200);
      } else if (method == "DELETE") {
        setHeader(res, 200);
      }
    }
  }
}

const server = http.createServer(reqHandler);
server.listen(port, hostname, (err) => {
  if (err) {
    console.log("ERROR ⛔ :" + err);
  }
  console.log("SERVER is running 🔥 at port : " + port);
});
