// This code establishes a basic chat application using sockets.

(function () {

    // Selecting the main application container
    const app = document.querySelector(".app");

    // Establishing a socket connection
    const socket = io();

    // Variable to store the username of the current user
    let uname;

    // Event listener for joining the chat
    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        // Retrieving the username entered by the user
        let username = app.querySelector(".join-screen #username").value;

        // Checking if the username is not empty
        if (username.length == 0) {
            return;
        }

        // Emitting a signal to the server about a new user
        socket.emit("newuser", username);

        // Storing the username
        uname = username;

        // Switching from join screen to chat screen
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    })

    // Event listener for sending a message
    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        sendMessage();
    });

    // Event listener for sending a message when the Enter key is pressed
    app.querySelector(".chat-screen #message-input").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Function to send a message
    function sendMessage() {
        // Retrieving the message from the input field
        let message = app.querySelector(".chat-screen #message-input").value.trim();

        // Checking if the message is not empty
        if (message.length === 0) {
            return;
        }

        // Rendering the message in the chat window
        renderMessage("my", {
            username: uname,
            text: message
        });

        // Emitting the message to the server
        socket.emit("chat", {
            username: uname,
            text: message
        });

        // Clearing the input field after sending the message
        app.querySelector(".chat-screen #message-input").value = "";
    }

    // Event listener for exiting the chat
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        // Emitting a signal to the server about the user exiting
        socket.emit("exituser", uname);

        // Reloading the page to exit the chat
        window.location.href = window.location.href;
    });

    // Listening for updates from the server
    socket.on("update", function (update) {
        // Rendering the update in the chat window
        renderMessage("update", update)
    });

    // Listening for incoming chat messages from other users
    socket.on("chat", function (message) {
        // Rendering the incoming message in the chat window
        renderMessage("other", message)
    });

    // Function to render messages in the chat window
    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");

        // Rendering user messages
        if (type === "my" || type === "other") {
            let el = document.createElement("div");
            el.classList.add("message");

            // Rendering user's own message
            if (type === "my") {
                el.classList.add("my-message");
                el.innerHTML = `
                    <div>
                        <div class="name">You</div>
                        <div class="text">${message.text}</div>
                    </div>
                `;
            }
            // Rendering other users' messages
            else if (type === "other") {
                el.classList.add("other-message");
                el.innerHTML = `
                    <div>
                        <div class="name">${message.username}</div>
                        <div class="text">${message.text}</div>
                    </div>
                `;
            }
            // Appending the message element to the message container
            messageContainer.appendChild(el);
        }
        // Rendering system updates
        else if (type === "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerHTML = message;
            messageContainer.appendChild(el);
        }

        // Scrolling the message container to the bottom to show the latest messages
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();
