const { WebSocketServer } = require("ws")
const uuidv4 = require("uuid").v4
const url = require("url")

const connect = async (server) => {
    console.log("Configuring websockets");
    const wsServer = new WebSocketServer({ server })

    const connections = {}
    const users = {}

    const handleMessage = (bytes, uuid) => {
        const message = JSON.parse(bytes.toString())
        const user = users[uuid]
        const connection = connections[uuid]
        switch (message.type) {
            case "initialBoard":
                console.log(message);
                sendError(connection, "initialBoard Not implemented yet")
                break;
            case "fire":
                sendError(connection, "fire Not implemented yet")
                break;
            default:
                break;
        }
    }

    const handleClose = (uuid) => {
        console.log(`${users[uuid].username} disconnected`)
        delete connections[uuid]
        delete users[uuid]
        broadcast()
    }

    const broadcast = () => {
        Object.keys(connections).forEach((uuid) => {
            const connection = connections[uuid]
            const message = JSON.stringify(users)
            connection.send(message)
        })
    }

    wsServer.on("connection", (connection, request) => {
        const { username, lobbyId } = url.parse(request.url, true).query
        console.log(`${username} connected`)
        const uuid = uuidv4()
        connections[uuid] = connection
        users[uuid] = {
            username,
            lobbyId,
            state: {},
        }
        connection.on("message", (message) => handleMessage(message, uuid))
        connection.on("close", () => handleClose(uuid))
    })

    const sendError = (connection, message) => {
        connection.send(
            JSON.stringify({
                type: "error",
                message,
            }),
        )
    }
};
module.exports = { connect };
