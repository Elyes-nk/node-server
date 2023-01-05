const http = require("http");
const fs = require("fs");
const data = require("./db.json");

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

function writeFile(res, content) {
  fs.writeFile("./db.js", content, (err) => {
    if (err) {
      console.error(err);
    }
    setHeader(res, 200);
  });
}

function isDefined(variable) {
  return variable != undefined;
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

  if (!db || db == "/" || selectedDb.length == 0) {
    if (method == "GET") {
      setHeader(res, 404);
      sendEnum(res, "DataBases", data);
    }
    if (method == "POST") {
      let body = [];
      req.on("data", function (data) {
        body.push(data);
      });
      req.on("end", function () {
        let content;
        body = JSON.parse(Buffer.concat(body).toString());
        if (isDefined(body.name)) {
          content = {
            [body.name]: isDefined(body.tables) ? body.tables : [],
          };
          data.push(content);
          writeFile(res, JSON.stringify(data));
        } else {
          setHeader(res, 404);
          res.end('{ "message": "Must provide a database name"}');
        }
      });
    }
  } else {
    if (!route || route == "/" || !selectedRoute) {
      if (method == "GET") {
        setHeader(res, 200);
        sendEnum(res, "Routes", selectedDb);
      }
      if (method == "POST") {
        // create table
      }
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
