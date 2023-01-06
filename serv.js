const http = require("http");
const fs = require("fs");
const data = require("./db.json");

const port = 8000;
const hostname = "localhost";

function setHeader(res, status) {
  res.writeHead(status, { "Content-type": "application/json" });
}

// Helper used to send a message with a map of values
function sendEnum(res, name, value) {
  const keys = value?.map((el) => Object.keys(el)?.[0]);
  res.end(
    `{"message": "Please select one of the following ${name} : ${keys.map(
      (el) => "\n/" + el
    )}\n"}`
  );
}

function writeFile(content) {
  fs.writeFile("./db.json", JSON.stringify(content), (err) => {
    if (err) {
      console.error(err);
    }
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

  /**
   * Sequence of conditions
   * No dataBase => GET all databases, POST create DB, PUT edit DB, DELETE delete DB (if DB name provided)
   * database => check for table
   *
   * No table => GET all tables, POST create table, PUT edit table, DELETE delete tables (if table name provided)
   * table => check for property
   *
   * No property id => GET all properties, POST create property, PUT edit property, DELETE delete property (if property id provided)
   * property => send property infos
   */
  if (!db || db == "/" || selectedDb.length == 0) {
    if (isGetMethod) {
      setHeader(res, 404);
      sendEnum(res, "DataBases", data);
    } else if (isPostMethod) {
      createDataBase(req, res);
      setHeader(res, 200);
      res.end('{ "message": "Database created successfully"}');
    } else if (isPutMethod) {
      updateDataBase(data, req, res);
      setHeader(res, 200);
      res.end('{ "message": "Database edited successfully"}');
    } else if (isDeleteMethod) {
      deleteDataBase(data, req, res);
      setHeader(res, 200);
      res.end('{ "message": "Database deleted successfully"}');
    }
  } else {
    if (!route || route == "/" || selectedRoute.length == 0) {
      if (isGetMethod) {
        setHeader(res, 200);
        sendEnum(res, "Routes", selectedDb);
      } else if (isPostMethod) {
        createTable(db, req, res);
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

function createDataBase(req, res) {
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
      writeFile(data);
    } else {
      setHeader(res, 404);
      res.end('{ "message": "Must provide a database name"}');
    }
  });
}

function deleteDataBase(dataBase, req, res) {
  let body = [];
  req.on("data", function (data) {
    body.push(data);
  });
  req.on("end", function () {
    body = JSON.parse(Buffer.concat(body).toString());
    if (isDefined(body.name)) {
      const filtredDataBase = dataBase.filter(
        (el) => Object.keys(el)[0] !== body.name
      );
      writeFile(filtredDataBase);
    } else {
      setHeader(res, 404);
      res.end('{ "message": "Must provide a database name"}');
    }
  });
}

function updateDataBase(dataBase, req, res) {
  deleteDataBase(dataBase, req, res);
  createDataBase(req, res);
}

function createTable(dataBaseName, req, res) {
  let body = [];
  req.on("data", function (data) {
    body.push(data);
  });
  req.on("end", function () {
    let content;
    body = JSON.parse(Buffer.concat(body).toString());
    if (isDefined(body.name)) {
      content = {
        [body.name]: isDefined(body.properties) ? body.properties : [],
      };
      for (let i = 0; i < data.length; i++) {
        if (Object.keys(data[i])[0] === dataBaseName) {
          data[i][dataBaseName].push(content);
        }
      }
      writeFile(data);
    } else {
      setHeader(res, 404);
      res.end('{ "message": "Must provide a database name"}');
    }
  });
}
function deleteTable(dataBase, req, res) {
  let body = [];
  req.on("data", function (data) {
    body.push(data);
  });
  req.on("end", function () {
    body = JSON.parse(Buffer.concat(body).toString());
    if (isDefined(body.name)) {
      const filtredDataBase = dataBase.filter(
        (el) => Object.keys(el)[0] !== body.name
      );
      writeFile(filtredDataBase);
    } else {
      setHeader(res, 404);
      res.end('{ "message": "Must provide a database name"}');
    }
  });
}
