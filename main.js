const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = require('electron');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== "development";

// create the main window
function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev? 1000: 600,
        height: 400,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
          }

    });

    // open devtools if in dev env
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow(){
    const aboutWindow = new BrowserWindow({
        title: "Image Resizer",
        width: 300,
        height: 300,
        

    });


    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// Menu template
const menu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit(),
                accelerator: 'CmdorCtrl+w',
            }
        ]
    },

    {
        label: 'Help',
        submenu:[
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }
]

// when app is ready
app.whenReady().then(() => {
    createMainWindow();

    // implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
      })
});


// Respond to ipcRenderer resize

ipcMain.on('image:resize', (e, options)=>{
    console.log(options)
})


app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })