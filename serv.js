const http = require("http");
const fs = require("fs");

const { db: data } = require("./db");

const port = 8000;
const hostname = "localhost";

function setHeader(res, status) {
  res.writeHead(status, { "Content-type": "application/json" });
}

function sendEnum(res, name, value) {
  const keys = value?.map((el) => Object.keys(el)?.[0]);
  res.end(
    `{"message": "Please select one of the following ${name} : ${keys.map(
      (el) => "\n/" + el
    )}\n"}`
  );
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
    sendEnum(res, "DataBases", data);
  } else {
    if (!route || route == "/" || !selectedRoute) {
      setHeader(res, 200);
      sendEnum(res, "Routes", selectedDb);
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
        //creaate db
        //creaate table
        //create property
        setHeader(res, 200);
      } else if (method == "PUT") {
        //edit db
        //edit table
        //edit property
        setHeader(res, 200);
      } else if (method == "DELETE") {
        //delete db
        //delete table
        //delete property
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
