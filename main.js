const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');

process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;
// create the main window
function createMainWindow(){
     mainWindow = new BrowserWindow({
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

    // Remove mainWindow from memory on close
    
    mainWindow.on('closed', () => (mainWindow = null));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
      })
});


// Respond to ipcRenderer resize

ipcMain.on('image:resize', (e, options)=>{
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options);
})

// Resize the image
async function resizeImage({imgPath, width, height, dest}){
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
        width: +width,
        height: +height
    });

    // Create filename
    const filename = path.basename(imgPath)

    // Create distination folder it doesn't exist
    if(!fs.existsSync(dest)){
        fs.mkdirSync(dest);
    }

    // Write file to destination
    fs.writeFileSync(path.join(dest, filename), newPath);

    // send success message to render
    mainWindow.webContents.send('image:done')

    // open destination folder
    shell.openPath(dest);
    try {
        
    } catch (error) {
        console.log(error)
    }
}

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })