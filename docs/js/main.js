import Socket from "./socket.js"

const socket = new Socket()

const video = document.querySelector("#video")
const videoWrapper = document.querySelector("#video-wrapper")
const userEmoji = document.querySelector("#useremoji")
const userName = document.querySelector("#username")
const loginView = document.querySelector("#login")
const userView = document.querySelector("#user")
const students = document.querySelector("students")
const emoji = ["😃", "😡"]

// Fix for iOS Safari from https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295
video.setAttribute('autoplay', '')
video.setAttribute('muted', '')
video.setAttribute('playsinline', '')

const width = 320
const height = 240
// const width = 1280
// const height = 720
let canvas, ctx, faceapi
let sentiment = "neutral"
let initialized = false

document.querySelector("form").addEventListener("submit", (e) => addClientToServer(e))
document.addEventListener("updateClients", (event) => updateClientList(event.clients))

function startFaceAPI() {
    const detectionOptions = {
        withLandmarks: true,
        // withDescriptors: true,
        // withExpressions: true, deprecated https://github.com/ml5js/ml5-library/issues/597
    }

    faceapi = ml5.faceApi(detectionOptions, modelLoaded)
}


/**
 * start de app - aangeroepen onderin dit document
 */
function modelLoaded() {
    console.log('Model Loaded!')
    console.log(faceapi)
    // Make some sparkles
    canvas = createCanvas(width, height)
    ctx = canvas.getContext("2d")
    // flip de context horizontally
    ctx.translate(width, 0)
    ctx.scale(-1, 1)

    startWebcam()
}

/**
 * function to read the webcam
 */
function startWebcam() {
    if (!initialized) {
        // Prefer camera resolution nearest to 1280x720.
        const constraints = {
            audio: false,
            video: { width: width, height: height, facingMode: 'user' }
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then((mediaStream) => {
                initialized = true
                if ('srcObject' in video) {
                    video.srcObject = mediaStream
                } else {
                    video.src = URL.createObjectURL(mediaStream)
                }
                video.onloadedmetadata = () => {
                    video.play()
                    requestAnimationFrame(loop)
                }
            })
            .catch((err) => {
                // always check for errors at the end.
                console.error(`${err.name}: ${err.message}`)
            })
    }
}

function loop(timestamp) {
    faceapi.detect(video, gotResults)
    requestAnimationFrame(loop) // todo 120fps too fast?
}

function gotResults(err, result) {
    if (err) {
        console.error(err)
        return
    }

    // console.log(result)
    let detections = result

    // Clear part of the canvas
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, width, height)

    ctx.drawImage(video, 0, 0, width, height)

    if (detections) {
        if (detections.length > 0) {
            drawBox(detections)
            drawLandmarks(detections)
        }
    }
}

function drawBox(detections) {
    for (let i = 0; i < detections.length; i += 1) {
        const alignedRect = detections[i].alignedRect

        const x = alignedRect._box._x
        const y = alignedRect._box._y
        const boxWidth = alignedRect._box._width
        const boxHeight = alignedRect._box._height

        ctx.beginPath()
        ctx.rect(x, y, boxWidth, boxHeight)
        ctx.strokeStyle = "#a15ffb"
        ctx.stroke()
        ctx.closePath()
    }
}

function drawLandmarks(detections) {
    console.log(detections)
    for (let i = 0; i < detections.length; i += 1) {
        const mouth = detections[i].parts.mouth
        const nose = detections[i].parts.nose
        const leftEye = detections[i].parts.leftEye
        const rightEye = detections[i].parts.rightEye
        const rightEyeBrow = detections[i].parts.rightEyeBrow
        const leftEyeBrow = detections[i].parts.leftEyeBrow

        sendNewSentiment(mouth)
        drawPart(mouth, true, getSentimentColor(mouth))
        // drawPart(nose, false)
        // drawPart(leftEye, true)
        // drawPart(rightEye, true)
        // drawPart(leftEyeBrow, false)
        // drawPart(rightEyeBrow, false)
    }
}

function drawPart(feature, closed, color = "blue") {
    ctx.beginPath()
    ctx.lineWidth = 2
    for (let i = 0; i < feature.length; i += 1) {
        const x = feature[i]._x
        const y = feature[i]._y

        // show number of point
        // ctx.fillText(i, feature[i]._x, feature[i]._y)

        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
    }

    if (closed === true) {
        ctx.closePath()
    }
    ctx.strokeStyle = color
    ctx.stroke()
}

function isHappy(mouth) {
    // facePart[0] = outside left corner
    // facePart[6] = outside right corner
    // facePart[12] = inside left corner
    // facePart[16] = insode right corner
    return (mouth[0]._y < mouth[12]._y || mouth[6]._y < mouth[16]._y)
}

function getSentimentColor(mouth) {
    return isHappy(mouth) ? "green" : "red"
}
function sendNewSentiment(mouth) {
    let newSentiment = isHappy(mouth) ? "happy" : "sad"
    if (newSentiment !== sentiment) {
        sentiment = newSentiment

        userEmoji.innerText = (sentiment === "happy") ? emoji[0] : emoji[1]
        // console.log(sentiment)
        socket.sendSentiment(sentiment)
    }
}

// Helper Functions
function createCanvas(w, h) {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    canvas.id = "drawingcanvas"
    videoWrapper.appendChild(canvas)
    // document.body.appendChild(canvas)
    return canvas
}

// login button
function addClientToServer(e) {
    e.preventDefault()
    let name = document.querySelector("#login-name").value
    if (name === "") {
        name = "Anonymous"
    }

    loginView.style.display = "none"
    userView.style.display = "flex"
    userName.innerText = name

    // add client to server
    socket.addClient(name)
        .then(() => {
            console.log("client added")
        })


}

function updateClientList(clients) {
    students.innerHTML = ""
    clients.forEach(client => {
        addStudent(client.name, client.sentiment)
    })
}

/**
 * Clone template and add to DOM
 * @param {string} name 
 * @param {*} emo 
 */
function addStudent(name, emo) {
    console.log("emo ", emo)
    emo = (emo === "happy") ? emoji[0] : emoji[1]
    const temp = document.querySelector("template")
    const student = temp.content.cloneNode(true)
    student.querySelector(".name").innerText = name
    student.querySelector(".emoji").innerText = emo
    students.appendChild(student)

}

startFaceAPI()