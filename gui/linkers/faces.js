var fs = require('fs');

function get_blink_info() {
    fs.readFile('gui/storage.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }
        try {
            // Parse the JSON data
            const data = JSON.parse(jsonString);
    
            // Use the data in your JavaScript code
            console.log('Received data:', data);
    
            // Access specific properties
            console.log(data.blinkcounter)
            localStorage.setItem("blink_counter", data.blinkcounter);
        } catch (err) {
            console.error('Error parsing JSON data:', err);
        }
    });
}

// const wss = new WebSocketServer({ port: 8080 });

// wss.on('connection', ws => {
//     ws.on('message', message => {
//         localStorage.setItem("blink_counter", message);
//     });
// });

// const socket = new WebSocket('ws://localhost:8080');

// socket.onopen = function() {
//     console.log('WebSocket connection established.');
// };

// socket.onmessage = function(event) {
//     localStorage.setItem("blink_counter", message);
//     console.log('Received:', receivedData);
// };

// socket.onclose = function() {
//     console.log('WebSocket connection closed.');
// };

function get_blink_info() {x

    // change: 120 -> 5
    if (localStorage.getItem("blink-counter") > 5) {
        (async () => {
            const displayNotification = () => {
                const notification = new Notification('Blink-notification', {
                    body: 'You have blinked enough! Good job!',
                    vibrate: true,
                })
            }

            setTimeout(() => {
                notification.close();
            }, 10000)

            const showError = () => {
                const error = document.querySelector('.error');
                error.style.display = 'block';
                error.textContent = 'Notifications are blocked'
            }

            let access_granted = false;

            if (Notification.permission === 'granted') {
                access_granted = true;
            } else {
                let permission = await Notification.requestPermission();
                access_granted = permission === 'granted' ? True : false;
            }

            access_granted ? displayNotification : showError();

        })

    } else {
        (async () => {
            const displayNotification = () => {
                const notification = new Notification('Blink-notification', {
                    body: 'You are not blinking enough! Take a blink break and look away from your computer for 20 seconds.',
                    vibrate: true,
                })
            }

            setTimeout(() => {
                notification.close();
            }, 5000)

            const showError = () => {
                const error = document.querySelector('.error');
                error.style.display = 'block';
                error.textContent = 'Notifications are blocked'
            }

            let access_granted = false;

            if (Notification.permission === 'granted') {
                access_granted = true;
            } else {
                let permission = await Notification.requestPermission();
                granted = permission === 'granted' ? True : false;
            }

            granted ? displayNotification : showError();

        })
    }

}


function get_blinks() {

    // var options = {
    //     scriptPath: path.join(__dirname, '../../engine/'),
    //     pythonPath: '/usr/bin/python3'
    // }

    // var face = new PythonShell("faces.py", options)
    // face.on('message', function(message) {
    //     localStorage.setItem("blink_counter", message);
    // })

    // change: 120 -> 5
    if (localStorage.getItem("blink-counter") > 5) {
        (async () => {
            const displayNotification = () => {
                const notification = new Notification('Blink-notification', {
                    body: 'You have blinked enough! Good job!',
                    vibrate: true,
                })
            }

            setTimeout(() => {
                notification.close();
            }, 10000)

            const showError = () => {
                const error = document.querySelector('.error');
                error.style.display = 'block';
                error.textContent = 'Notifications are blocked'
            }

            let access_granted = false;

            if (Notification.permission === 'granted') {
                access_granted = true;
            } else {
                let permission = await Notification.requestPermission();
                access_granted = permission === 'granted' ? True : false;
            }

            access_granted ? displayNotification : showError();

        })

    } else {
        (async () => {
            const displayNotification = () => {
                const notification = new Notification('Blink-notification', {
                    body: 'You are not blinking enough! Take a blink break and look away from your computer for 20 seconds.',
                    vibrate: true,
                })
            }

            setTimeout(() => {
                notification.close();
            }, 5000)

            const showError = () => {
                const error = document.querySelector('.error');
                error.style.display = 'block';
                error.textContent = 'Notifications are blocked'
            }

            let access_granted = false;

            if (Notification.permission === 'granted') {
                access_granted = true;
            } else {
                let permission = await Notification.requestPermission();
                granted = permission === 'granted' ? True : false;
            }

            granted ? displayNotification : showError();

        })
    }

}
