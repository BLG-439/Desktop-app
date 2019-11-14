const electron = require("electron");
const url = require("url");
const path = require("path");
const nativeImage=require('electron').nativeImage;

const {app, BrowserWindow, Tray, Menu, ipcMain} = electron;

//Set Env when publishing
//process.env.NODE_ENV="production";


let mainWindow; //-> Variable to represent our main window
let item1Window; //-> Another window variable
let tasksWindow; //-> Variable to represent the window of tasks
let addTaskWindow; //-> Variable for adding a new task window

const mainWindowWidth=850;
const mainWindowHeight=600;

let clockNums=["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]; //Clock numbers as reference for the correct time

//Firstly, in electron, we have to listen when the app is ready in order to run the functions
app.on('ready', function(){
    var image= nativeImage.createFromPath(__dirname + "/app_icon.ico");
    //Create new window
    mainWindow= new BrowserWindow(
        {
            width: mainWindowWidth,
            height: mainWindowHeight,
            webPreferences: {
                nodeIntegration: true //In order to use nodejs script on html file
            },
            frame: false,
            icon: image
        }
    );
    //Load the html file to the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    let tray= new Tray(image);
    const contextMenu=Menu.buildFromTemplate([
        { label: 'Show', click: function(){
            mainWindow.show();
        }},
        { 
            label: 'Quit', 
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', //darwin is the value of that variable if on Mac. TRY: node -> process.platform.  IN ORDER TO USE KEY SHORTCUT FOR THIS ITEM
            click(){
                app.quit();
            }
        }
    ])
    tray.setContextMenu(contextMenu);
    
    //Build menu from the template
    const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);



    //Quit app when window get closed (In order to close the other windows and processes as well)
    mainWindow.on('closed', function(){
        app.quit();
    });

    // //Build menu from the template
    // const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);
    // //Insert menu
    // Menu.setApplicationMenu(mainMenu);

});

ipcMain.on("minimizeMainWindow", function(event){
    mainWindow.hide();
})

ipcMain.on("closeApp", function(){
    app.quit();
})

ipcMain.on("moveMainWindow", function(e, x1, y1, x2, y2){
    let display = electron.screen.getPrimaryDisplay();
    let kot=mainWindow.getPosition();

    const { width, height } = display.bounds
    mainWindow.setBounds({
        x: kot[0]+x2-x1,
        y: kot[1]+y2-y1,
        width: mainWindowWidth,
        height: mainWindowHeight
    })
})



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
        addWindow=null;
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
    }
]; //The menu in electron is just an array of objects


//Catch assigned_event_name
ipcMain.on("event_kot", function(e, item){
    var fs = require("fs");
    var stream = fs.createWriteStream("temp.txt", {flags:'a'});
    stream.write(item+'\n');
    stream.close();
    console.log("Successfully Written to File.");
    mainWindow.webContents.send("event_kot", item); //In order to be caught by the html file and get inserted
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



//Handle show-tasks window
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

ipcMain.on("openTasksWindow", function(e, tasks, date){
    createTasksWindow();
    function showTasks(tasks){
        tasksWindow.webContents.send("showTasks", tasks, date);
    }
    setTimeout(showTasks, 500, tasks);
})

ipcMain.on("moveTasksWindow", function(e, x1, y1, x2, y2){
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

ipcMain.on("closeTasksWindow", function(){
    tasksWindow.close();
})


//Handle add-task window
function createAddTaskWindow(){
    //Create new window
    addTaskWindow= new BrowserWindow({
        //Options for the new window to be created
        width: 350,
        height: 400,
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
    addTaskWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'add_task.html'),
        protocol: 'file:',
        slashes: true
    })); //this function is basically passing file://dirname/index.html to mainWindow url

    addTaskWindow.on('close', function(){
        addWindow=null;
    });
}

ipcMain.on("addNewTask", function(e, date){
    createAddTaskWindow();
    function getTheDate(date){
        addTaskWindow.webContents.send("gettingDate", date);
    }
    setTimeout(getTheDate, 500, date);
});
ipcMain.on("moveAddTaskWindow", function(e, x1, y1, x2, y2){
    let display = electron.screen.getPrimaryDisplay();
    let position=addTaskWindow.getPosition();

    const { width, height } = display.bounds
    addTaskWindow.setBounds({
        x: position[0]+x2-x1,
        y: position[1]+y2-y1,
        width: 350,
        height: 400
    })
})
ipcMain.on("closeAddTask", function(){
    addTaskWindow.close();
})
ipcMain.on("saveTask", function(e, date, title, fromTime, toTime, reminders){//Saving the task to the log file
    var fs = require("fs");
    var stream = fs.createWriteStream("temp.txt", {flags:'a'});
    stream.write(date + "||" + title + "||" + fromTime + "||" + toTime + "||" + reminders +'\n');
    stream.close();
    addTaskWindow.close();
})


//Synchronization functions
ipcMain.on("synchToday", function(e, date){
    var fs = require("fs");
    var stream = fs.readFileSync("./temp.txt", 'utf8');
    var tasks=stream.split("\n");
    var hold=[];
    for(var i=0; i<tasks.length-1; i++){
        tasks[i]=tasks[i].split("||");
        if(tasks[i][0]==date){
            hold.push(tasks[i]);
        }
    }
    mainWindow.webContents.send("dailyTasks", hold);
});


ipcMain.on("click font color",function(e,link){
    console.log('red');
    mainWindow.webContents.send("click font color",link);
    //fontWindow.close();
    })

    ipcMain.on("click bg color",function(e,link){
        mainWindow.webContents.send("click bg color",link);
        //fontWindow.close();
    })

    ipcMain.on("click image",function(e,link){
        console.log('red');
        mainWindow.webContents.send("click image",link);
    })

    ipcMain.on("synchDate", function(e, date){
        var fs = require("fs");
        var stream = fs.readFileSync("./temp.txt", 'utf8');
        var tasks=stream.split("\n");
        var hold=[];
        for(var i=0; i<tasks.length-1; i++){
            tasks[i]=tasks[i].split("||");
            if(tasks[i][0]==date){
                hold.push(tasks[i]);
            }
        }

        createTasksWindow();
        function showTasks(tasks){
            tasksWindow.webContents.send("showTasks", hold);
        }
        setTimeout(showTasks, 500, tasks);
    })


ipcMain.on("fillCalendar", function(e, dates){
    var fs = require("fs");
    var stream = fs.readFileSync("./temp.txt", 'utf8');
    var tasks=stream.split("\n");
    var dict={}
    for(var i=0; i<tasks.length-1; i++){
        tasks[i]=tasks[i].split("||");
        for(var j=0; j<dates.length; j++){
            if(tasks[i][0]==dates[j]){
                if(dict[dates[j]]){
                    dict[dates[j]].push(tasks[i][1]);
                }
                else{
                    dict[dates[j]] = new Array();
                    dict[dates[j]].push(tasks[i][1]);
                }
            }
        }
    }
    mainWindow.webContents.send("dateTasks", dict);
})

