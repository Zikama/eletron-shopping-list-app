const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, dialog, ipcMain } = electron;


let mainWindo;
let addWindow;

makeSingleInstance();

// Listen for the app to be ready
app.on('ready', _ => {

    // Create a new window
    mainWindo = new BrowserWindow({ 
        minHeight:500,
        minWidth:350,
        webPreferences: {
        nodeIntegration: true
      }});

    // Load the html file
    mainWindo.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: 'file:',
        slashes: true

    }));

    // Build the menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

    // Clean memory when closed
    mainWindo.on('close', ()=>{
        app.quit();
        // Gabage Handler
        mainWindo = null;
    });

});

// handle Create Add Window
function createCreateAddWindow (){
    addWindow = new BrowserWindow({
        width : 500,
        height: 300,
        maxWidth: 500,
        maxHeight: 300,
        minHeight:200,
        minWidth:400,
        maximizable: false,
        title: 'Add an item',
        parent: mainWindo,
        modal: true,
        webPreferences: {
            nodeIntegration: true
          },
        autoHideMenuBar: true
    });

    // Load the html file for the app renderer
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: 'file:',
        slashes: true
    }));

    // Gabage handler
    addWindow.on('closed', ()=>{
        addWindow = null;
    });
}

// Catch item:add channel
ipcMain.on('item:add', (e, item)=>{
    mainWindo.webContents.send('item:add', item);
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [{
    label: 'File',
    submenu : [
        {
            label: 'Add Item',
            click(){
                createCreateAddWindow()
            }
        },
        {
            label : 'Clear Items',
            click(){
                // Send clear command
                const options = {
                    type: 'info',
                    title: 'Confirm',
                    message: "Do you real want to delete all the items?",
                    buttons: ['Yes', 'No']
                  };

                  //   Display Information dialog box
                  dialog.showMessageBox(options, sendAfter).then(index=>sendAfter(index.response));

                  // Send command after dialog response and if is yes
                  function sendAfter(index){
                      if(!index) mainWindo.webContents.send('item:clear');
                  }
            }
        },
        {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Command+Q': 'Ctrl+Q',
            click(){
                app.quit()
            }
        }
    ]
}];

// IF mac add an empty object
if(process.platform === 'darwin') mainMenuTemplate.unshift({});

// Add dev tools item if not prod
if(process.env.NODE_ENV !== "production"){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu :[
            {
                label: "Toggle devtools",
                accelerator: process.platform === 'darwin' ? 'Command+I': 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()

                }
            },
            {
                role: 'reload'
            }
        ]
    })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
    if (process.mas) return
  
    app.requestSingleInstanceLock();
  
    app.on('second-instance', () => {
      if (mainWindo) {
        if (mainWindo.isMinimized()) mainWindo.restore();
        mainWindo.focus();
      }
    })
  }
