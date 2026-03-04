const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

app.setName("AEye Health");

const menuItems = [
	{
		label: app.name,
		submenu: [
			{
				label: "About",
			},
			{
				label: "Quit",
				click: () => app.quit(),
				accelerator: process.platform !== "darwin" ? "Ctrl+Q" : "Cmd+Q",
			},
		],
	},
	{
		label: "File",
		submenu: [
			{
				label: "Learn More",
				click: async () => {
					await shell.openExternal(
						"https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome?sso=y"
					);
				},
			},
			{
				type: "separator",
			},
		],
	},
	{
		label: "Developer",
		submenu: [
			{
				label: "Toggle Developer Tools",
				click: (menuItem, browserWindow) => {
					if (browserWindow) {
						browserWindow.webContents.toggleDevTools();
					}
				},
				accelerator: process.platform !== "darwin" ? "F12" : "Cmd+Option+I",
			},
		],
	},
];

function createWindow() {
	const win = new BrowserWindow({
		width: 1050,
		height: 750,
		title: "AEye Health",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	win.loadFile(path.join(__dirname, "index.html"));

	// Handle external links - open in default browser
	win.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: 'deny' };
	});

	// Handle new window requests (for target="_blank" links)
	win.webContents.on('new-window', (event, navigationUrl) => {
		event.preventDefault();
		shell.openExternal(navigationUrl);
	});

	const pythonProcess = spawn("python", ["engine/faces.py"]);

	pythonProcess.stdout.on("data", (data) => {
		console.log("Python script output:", data.toString());
	});

	pythonProcess.stderr.on("data", (data) => {
		console.error("Python script error:", data.toString());
	});

	pythonProcess.on("close", (code) => {
		console.log("Python script process exited with code", code);
	});

	// Developer tools are now disabled by default
	// To enable them for debugging, uncomment the line below:
	// win.webContents.openDevTools();

}

app.whenReady().then(() => {
	createWindow();

	const mainMenu = Menu.buildFromTemplate(menuItems);
	Menu.setApplicationMenu(mainMenu);

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length == 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
