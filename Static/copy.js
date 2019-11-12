const electron = require("electron");
const url = require("url");
const path = require("path");

const {app, BrowserWindow, Menu, ipcMain} = electron;

//Set Env when publishing
//process.env.NODE_ENV="production";


let mainWindow; //-> Variable to represent our main window
let item1Window; //-> Another window variable
let tasksWindow; //-> Variable to represent the window of tasks
let bgWindow;
//Firstly, in electron, we have to listen when the app is ready in order to run the functions
app.on('ready', function(){
    //Create new window
    mainWindow= new BrowserWindow(
        {webPreferences: {
            nodeIntegration: true //In order to use nodejs script on html file
        }}
    );
    //Load the html file to the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    //Quit app when window get closed (In order to close the other windows and processes as well)
    mainWindow.on('closed', function(){
        app.quit();
    });

    //Build menu from the template
    const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});


//Handle submenu item 1 (CREATE ANOTHER WINDOW)
function createItem1Window(){
    //Create new window
    item1Window= new BrowserWindow({
        //Options for the new window to be created
        width: 200,
        height: 300,
        title: "Bullshit",
        webPreferences: {
            nodeIntegration: true //This is needed in order to write node functions as script in the html file
        },
        frame: false
    });
    //Load the html file to the window
    item1Window.loadURL(url.format({
        pathname: path.join(__dirname, 'kot.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    item1Window.on('close', function(){
        item1Window=null;
    });
}
function createChangeWPWindow(){
    //Create new window
    bgWindow= new BrowserWindow({
        //Options for the new window to be created
        width: 600,
        height: 600,
        title: "Wallpaper",
        webPreferences: {
            nodeIntegration: true //This is needed in order to write node functions as script in the html file
        },
        frame: false
    });
    //Load the html file to the window
    bgWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'changeWallpaper.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    bgWindow.on('close', function(){
        bgWindow=null;
    });
}
function createChangeFontWindow(){
    //Create new window
    fontWindow= new BrowserWindow({
        //Options for the new window to be created
        width: 300,
        height: 300,
        title: "Font",
        webPreferences: {
            nodeIntegration: true //This is needed in order to write node functions as script in the html file
        },
        frame: false
    });
    //Load the html file to the window
    fontWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'changeFont.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    fontWindow.on('close', function(){
        fontWindow=null;
    });
}
//Create menu template
const mainMenuTemplate=[
    {
        label: 'File',
        submenu: [
            {
                label: 'submenu item 1(CREATE ANOTHER WINDOW)',
                click(){
                    createItem1Window();
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', //darwin is the value of that variable if on Mac. TRY: node -> process.platform.  IN ORDER TO USE KEY SHORTCUT FOR THIS ITEM
                click(){
                    //Whatever you want to happen when you click this item
                    app.quit();
                }
            }
        ]
    },

    {
        label: 'Design',
        submenu: 
        [
            {
                label: 'Change Wallpaper',
                click(){
                    createChangeWPWindow();
                }
            },

            {
                label: 'Change Font',
                click(){
                    createChangeFontWindow();
                }
            }
        ]
    }
]; //The menu in electron is just an array of objects


//Catch assigned_event_name
ipcMain.on("event_kot", function(e, item){
    console.log(item);
    var fs = require("fs");
    var stream = fs.createWriteStream("temp.txt", {flags:'a'});
    stream.write(item+'\n');
    stream.close();
    console.log("Successfully Written to File.");
    mainWindow.webContents.send("event_kot", item);
});


if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({}); //UNSHIFT function pushes the element at the beginng of the array
    //If on Mac this {} is needed since the first item shown on Mac is "Electron" if not inserted. If on windows this brings error.
}

//Add developer tools only if on production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: "Developer tools",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I', //darwin is the value of that variable if on Mac. TRY: node -> process.platform.  IN ORDER TO USE KEY SHORTCUT FOR THIS ITEM
                click(item, focusedWindow){//The reason for this is to show up on the window where it is being clicked
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}

//Handle tasks window
function createTasksWindow(){
    //Create new window
    tasksWindow= new BrowserWindow({
        //Options for the new window to be created
        width: 650,
        height: 550,
        title: "Tasks",
        webPreferences: {
            nodeIntegration: true //This is needed in order to write node functions as script in the html file
        },
        autoHideMenuBar: true,
        opacity:0.97,
        //type: "toolbar"//,
        frame: false
    });
    //Load the html file to the window
    tasksWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'tasks.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    tasksWindow.on('close', function(){
        addWindow=null;
    });
}

ipcMain.on("openTasksWindow", function(e, hour){
    console.log(hour);
    createTasksWindow();
})

ipcMain.on("moveWindow", function(e, x1, y1, x2, y2){
    let display = electron.screen.getPrimaryDisplay();
    let kot=tasksWindow.getPosition();

    const { width, height } = display.bounds
    tasksWindow.setBounds({
        x: kot[0]+x2-x1,
        y: kot[1]+y2-y1,
        width: 650,
        height: 550
    })
})
    
    

    ipcMain.on("click image",function(e,link){
    console.log('red');
    mainWindow.webContents.send("click image",link);
    bgWindow.close();
    })

    ipcMain.on("click font color",function(e,link){
        console.log('red');
        mainWindow.webContents.send("click font color",link);
        //fontWindow.close();
        })
    
    ipcMain.on("closeTasksWindow", function(){
    tasksWindow.close();
    })

    ipcMain.on('item:add',function(event,item){
            
        mainWindow.webContents.send("item:add",item);
       
      });