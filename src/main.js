const { app, BrowserWindow } = require("electron");
const path = require("path");
const electron = require("electron");
const ipcMain = electron.ipcMain;
const userHomedir = require("os").homedir();
const process = require("process");
const fse = require("fs-extra");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { dialog } = electron;

require("update-electron-app")({
  repo: "se11-gateweb/gateweb-vat-desktop",
  updateInterval: "1 hour",
  logger: require("electron-log")
});

let config = {
  rootFolder: path.join(userHomedir, "/.gwapp"),
  fileFolder: path.join(userHomedir, "/.gwapp"),
  yearAssignVersion: ""
};

function initFileStructure() {
  if (!fse.existsSync(config.rootFolder)) {
    fse.mkdirSync(config.rootFolder);
  }
  if (!fse.existsSync(config.fileFolder)) {
    fse.mkdirSync(config.fileFolder);
  }
  Object.keys(persistenceFolder).forEach((key) => {
    const folderPath = path.join(config.fileFolder, key);
    if (!fse.existsSync(folderPath)) {
      fse.mkdirSync(folderPath);
    }
  });
}


function loadConfig() {
  var configPath = path.join(config.rootFolder, "appSetting.conf");
  if (!fse.existsSync(configPath)) {
    fse.writeFileSync(configPath, JSON.stringify(config));
  }
  config = fse.readJSONSync(configPath);
}


const createWindow = () => {
  initFileStructure();
  loadConfig();
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nativeWindowOpen: false,
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });
  mainWindow.maximize();
  mainWindow.setFullScreen(false);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // mainWindow.webContents.openDevTools();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        webPreferences: {
          preload: SECOND_WINDOW_PRELOAD_WEBPACK_ENTRY,
          nodeIntegration: true,
          contextIsolation: false
        }
      }
    };
  });

  mainWindow.webContents.on("did-create-window", (childWindow) => {
    // childWindow.webContents.openDevTools()
    //todo
    childWindow.loadURL(SECOND_WINDOW_WEBPACK_ENTRY);
    childWindow.webContents.on("will-navigate", (e) => {
      e.preventDefault();
    });
  });
};

app.on("ready", createWindow);


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
if (require("electron-squirrel-startup")) {
  app.quit();
}

const persistenceFolder = {
  image: "image",
  db: "db",
  backup: "backup"
};

function openFile(directory) {
  let fileInfo = fse.readdirSync(directory);
  return fileInfo
    .filter((filename) => {
      return filename !== ".DS_Store";
    })
    .map((filename) => {
      return {
        filename: filename,
        fullPath: path.join(directory, filename)
      };
    });
}

function getFileContent(fullPath) {
  if (fullPath.toLowerCase().endsWith("jpg")) {
    return fse.readFileSync(fullPath);
  }
  if (fullPath.toLowerCase().endsWith("jpeg")) {
    return fse.readFileSync(fullPath);
  }
  if (fullPath.toLowerCase().endsWith("png")) {
    return fse.readFileSync(fullPath);
  }
  if (fullPath.toLowerCase().endsWith("pdf")) {
    return fse.readFileSync(fullPath);
  }
}

function getDbContext(businessEntityTaxId) {
  const filePath =
    config.fileFolder +
    "/" +
    persistenceFolder.db +
    "/" +
    businessEntityTaxId +
    ".json";
  const adapter = new FileSync(filePath);
  const db = low(adapter);
  db.defaults({ "01": {}, "02": {}, "03": {}, "04": {}, "05": {} }).write();
  return db;
}

ipcMain.handle("evidence:saveAssign", (event, payload, version) => {
  const targetFilePath = config.fileFolder + "/" + "assign.json";
  fse.writeJSONSync(targetFilePath, payload, { encoding: "utf8", flag: "w" });
  //todo
  console.log("ipcMain handle payload", payload);
  console.log("ipcMain handle version", version);
  config.yearAssignVersion = version;
  const configPath = path.join(config.rootFolder, "appSetting.conf");
  fse.writeFileSync(configPath, JSON.stringify(config));
});

ipcMain.handle("evidence:getImageFileContent", (event, fullPath) => {
  console.log(fullPath);
  return getFileContent(fullPath);
});

ipcMain.handle("evidence:getBusinessEntityList", (event, taxId) => {
  return getDbContext(taxId).read().value();
});

ipcMain.handle("evidence:updateData", (event, businessEntityTaxId, payload) => {
  const ticketId = payload["id"].result;
  const db = getDbContext(businessEntityTaxId);
  db.get("03")
    .assign({ [ticketId]: payload })
    .write();
  return db.read().value();
});
ipcMain.handle("evidence:deleteData", (event, businessEntityTaxId, step, id) => {
    const db = getDbContext(businessEntityTaxId);
    const data = db.get(step).value();
    delete data[id];
    db.get(step).assign(data).write();
    const targetFolderPath = path.join(
      config.fileFolder,
      persistenceFolder.image
    );
    const imageFileList = openFile(targetFolderPath);
    imageFileList
      .filter((obj) => {
        return obj.filename.split("_")[2].split(".")[0] === id;
      })
      .forEach((obj) => {
        fse.removeSync(obj.fullPath);
      });
    return db.read().value();
  }
);

ipcMain.handle("evidence:scanImages", (event, fullPath, username, declareProperties) => {
    console.log(fullPath, username, declareProperties);
    const sourceFileExt = getFileExt(fullPath);
    const targetFolderPath = path.join(
      config.fileFolder,
      persistenceFolder.image
    );
    const id = Date.now();
    const targetFilePath = path.join(
      targetFolderPath,
      username.username +
      "_" +
      declareProperties.clientTaxId +
      "_" +
      id +
      "." +
      sourceFileExt
    );
    console.log(targetFilePath);
    fse.copySync(fullPath, targetFilePath);
    const data = {
      [id]: {
        reportingPeriod: {
          result: declareProperties.reportingPeriod,
          score: [-1]
        },
        deductionType: { result: "1", score: [-1] },
        isDeclareBusinessTax: {
          result: declareProperties.isDeclareBusinessTax,
          score: [-1]
        },
        gwEvidenceType: { result: declareProperties.evidenceType, score: [-1] },
        fullPath: { result: targetFilePath, score: [-1] },
        createDate: { result: id, score: 1 }
      }
    };
    const db = getDbContext(declareProperties.clientTaxId);
    db.get("01").assign(data).write();
    return db.read().value();
  }
);

ipcMain.handle("evidence:identifyResultConfirmed", (event, businessEntityTaxId, payload) => {
    const db = getDbContext(businessEntityTaxId);
    for (let i = 0; i < payload.length; i++) {
      const data03List = db.get("03").value();
      const data = {
        [payload[i]]: data03List[payload[i]]
      };
      db.get("04").assign(data).write();
      delete data03List[payload[i]];
      db.get("03").assign(data03List).write();
    }
    return db.read().value();
  }
);

ipcMain.handle("evidence:getJsonFileData", (event, id, businessEntityTaxId) => {
    return getDbContext(businessEntityTaxId).get("03").get(id).value();
  }
);

ipcMain.handle("evidence:identifySent", (event, sentIdentifyResult) => {
  const username = sentIdentifyResult["user"];
  const identifyResult = sentIdentifyResult["result"];
  const businessEntityTaxId = identifyResult[0].businessEntityTaxId;
  const db = getDbContext(businessEntityTaxId);
  for (let i = 0; i < identifyResult.length; i++) {
    const data = identifyResult[i];
    if (data["result"]) {
      const fileExt = data["sourceFullPath"].split("_")[2].split(".")[1];
      const targetFileName =
        username +
        "_" +
        data["businessEntityTaxId"] +
        "_" +
        data["id"] +
        "." +
        fileExt;
      const targetFullName = path.join(
        config.fileFolder,
        persistenceFolder.image,
        targetFileName
      );
      fse.moveSync(data.sourceFullPath, targetFullName);
      const id = data["sourceFileName"].split("_")[1].split(".")[0];
      const data01List = db.get("01").value();
      data01List[id].fullPath.result = targetFullName;
      const data02 = {
        [data["id"]]: data01List[id]
      };
      db.get("02").assign(data02).write();
      delete data01List[id];
      db.get("01").assign(data01List).write();
    }
  }
  return db.read().value();
});
ipcMain.handle("evidence:identifyResultReceived", (event, businessEntityTaxId, identifyResult) => {
    const db = getDbContext(businessEntityTaxId);
    for (let i = 0; i < identifyResult.length; i++) {
      const data = identifyResult[i];
      const data02List = db.get("02").value();
      const data03 = {
        [data["id"].result]: data
      };
      db.get("03").assign(data03).write();
      delete data02List[data["id"].result];
      db.get("02").assign(data02List).write();
    }
    return db.read().value();
  }
);

ipcMain.handle("evidence:uploaded", (event, businessEntityTaxId, payload) => {
  console.log(payload);
  const db = getDbContext(businessEntityTaxId);
  payload.map((data) => {
    console.log(data);
    const id = data.id;
    if (data.status) {
      //move image
      const db04 = db.get("04").value();
      const data05 = {
        [id]: db04[data.id]
      };
      db.get("05").assign(data05).write();
      delete db04[id];
      db.get("04").assign(db04).write();
      //save data to 05
    } else {
      const db04 = db.get("04").value();
      db04[id]["errorMsg"].result = data["errorMsg"];
      db.get("04").assign(db04).write();
    }
  });
  return db.read().value();
});

const getFileExt = (fileName) => {
  if (fileName.toLowerCase().endsWith("jpg")) {
    return "jpg";
  }
  if (fileName.toLowerCase().endsWith("jpeg")) {
    return "jpg";
  }
  if (fileName.toLowerCase().endsWith("png")) {
    return "png";
  }
  if (fileName.toLowerCase().endsWith("pdf")) {
    return "pdf";
  }
  return "json";
};

ipcMain.handle("evidence:getYearAssignVersion", (event) => {
  return config.yearAssignVersion;
});

ipcMain.handle("evidence:getAssign", (event) => {
  //todo
  const targetFilePath = config.fileFolder + "/" + "assign.json";
  return fse.readJSONSync(targetFilePath);
});

ipcMain.handle("evidence:importFromImage", (event, type) => {
  console.log("handle import from image");
  let filter = [];
  if (type === "A5002") {
    filter = [
      { name: "Images", extensions: ["jpg", "png", "gif"] }
    ];
  } else {
    filter = [
      { name: "Images", extensions: ["jpg", "png", "gif"] },
      { name: "PDF", extensions: ["pdf"] }
    ];
  }

  return dialog
    .showOpenDialog({
      filters: filter,
      properties: ["openFile", "multiSelections"]
    })
    .then((result) => {
      console.log(result.canceled);
      console.log("filePaths=", result.filePaths);
      // result.filePaths.forEach(filePath => {
      //     return filepathList.push(filePath)
      // })
      return result.filePaths;
    })
    .catch((err) => {
      console.log(err);
    });
});

let image = "";

ipcMain.handle("evidence:openImage", (event, payload) => {
  image = payload;
});
ipcMain.handle("evidence:getOpenImage", (event) => {
  return image;
});