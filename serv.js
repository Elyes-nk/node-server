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
  const isGetMethod = method === "GET";
  const isPostMethod = method === "POST";
  const isPutMethod = method === "PUT";
  const isDeleteMethod = method === "DELETE";

  const urlSplited = url.split("/");

  const db = urlSplited[1];
  const selectedDb = data?.find((el) => Object.keys(el)[0] == db)?.[db] || [];

  const route = urlSplited[2];
  const selectedRoute =
    selectedDb?.find((el) => Object.keys(el)?.[0] == route)?.[route] || [];

  const id = urlSplited[3];
  const selectedProperty = selectedRoute?.find((el) => el.id == id);

  if (!db || db == "/" || selectedDb.length == 0) {
    if (isGetMethod) {
      setHeader(res, 404);
      sendEnum(res, "DataBases", data);
    } else if (isPostMethod) {
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
    } else if (isPutMethod) {
      //edit db
      let body = [];
      req.on("data", function (data) {
        body.push(data);
      });
      req.on("end", function () {
        let content;
        body = JSON.parse(Buffer.concat(body).toString());
        if (isDefined(body.id) && isDefined(body.name)) {
          // delete table with id = id
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
      setHeader(res, 200);
    } else if (isDeleteMethod) {
      //delete db
      setHeader(res, 200);
    }
  } else {
    if (!route || route == "/" || !selectedRoute) {
      if (isGetMethod) {
        setHeader(res, 200);
        sendEnum(res, "Routes", selectedDb);
      } else if (isPostMethod) {
        // create table
      } else if (isPutMethod) {
        //edit table
        setHeader(res, 200);
      } else if (isDeleteMethod) {
        //delete table
        setHeader(res, 200);
      }
    } else {
      if (isGetMethod) {
        if (!id || id == "/" || !selectedProperty) {
          setHeader(res, 200);
          res.end(JSON.stringify(selectedRoute));
        } else {
          setHeader(res, 200);
          res.end(JSON.stringify(selectedProperty));
        }
      } else if (isPostMethod) {
        //create property
        setHeader(res, 200);
      } else if (isPutMethod) {
        //edit property
        setHeader(res, 200);
      } else if (isDeleteMethod) {
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
