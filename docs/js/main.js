import Socket from "./socket.js"

const socket = new Socket()

const log = document.querySelector("#array")
const video = document.querySelector("#video")
const startBtn = document.querySelector("button")

// Fix for iOS Safari from https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295
video.setAttribute('autoplay', '')
video.setAttribute('muted', '')
video.setAttribute('playsinline', '')

// const width = 640
// const height = 480
const width = 1280
const height = 720
let canvas, ctx
let sentiment = "neutral"

let initialized = false

const detectionOptions = {
    withLandmarks: true,
    withDescriptors: true
}
// Initialize the magicFeature
const faceapi = ml5.faceApi(detectionOptions, modelLoaded)

// When the model is loaded
function modelLoaded() {
    console.log('Model Loaded!')
    console.log(faceapi)
    // Make some sparkles
    canvas = createCanvas(width, height)
    ctx = canvas.getContext("2d")
    // flip de context horizontally
    ctx.translate(width, 0)
    ctx.scale(-1, 1)

    initApplication()
}
//
// start de app - aangeroepen onderin dit document
//
function initApplication() {
    Notification.requestPermission()
    new Notification("Starting the app")

    startWebcam()
}

//
// function to read the webcam
//
function startWebcam() {
    if (!initialized) {
        // console.log(navigator.getUserMedia())
        // navigator.getUserMedia(
        //     {
        //         audio: false,
        //         video: { facingMode: 'user' }
        //     },
        //     stream => {
        //         initialized = true
        //         // video.srcObject = stream
        //         if ('srcObject' in video) {
        //             video.srcObject = stream
        //         } else {
        //             video.src = URL.createObjectURL(stream)
        //         }

        //         // flip video
        //         video.style.webkitTransform = "scaleX(-1)"
        //         video.style.transform = "scaleX(-1)"
        //         // video.play()
        //         requestAnimationFrame(loop)
        //     },
        //     err => console.error(err)
        // )
        // Prefer camera resolution nearest to 1280x720.
        const constraints = {
            audio: false,
            video: { width: width, height: height, facingMode: 'user' }
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then((mediaStream) => {
                initialized = true
                // const video = document.querySelector('video')
                if ('srcObject' in video) {
                    video.srcObject = mediaStream
                } else {
                    video.src = URL.createObjectURL(mediaStream)
                }
                video.onloadedmetadata = () => {
                    video.play()
                }
                requestAnimationFrame(loop)
            })
            .catch((err) => {
                // always check for errors at the end.
                console.error(`${err.name}: ${err.message}`)
            })
    }
}

function loop() {
    faceapi.detect(video, gotResults)
    requestAnimationFrame(loop)
}

function gotResults(err, result) {
    if (err) {
        console.log(err)
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
    for (let i = 0; i < detections.length; i += 1) {
        const mouth = detections[i].parts.mouth
        const nose = detections[i].parts.nose
        const leftEye = detections[i].parts.leftEye
        const rightEye = detections[i].parts.rightEye
        const rightEyeBrow = detections[i].parts.rightEyeBrow
        const leftEyeBrow = detections[i].parts.leftEyeBrow

        checkSentiment(mouth)
        drawPart(mouth, true, getSentimentColor(mouth))
        // drawPart(nose, false)
        // drawPart(leftEye, true)
        // drawPart(rightEye, true)
        // drawPart(leftEyeBrow, false)
        // drawPart(rightEyeBrow, false)
    }
}

function drawPart(feature, closed, color = blue) {
    ctx.beginPath()
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
    // console.log(canvas.toDataURL())
}

function getSentimentColor(facePart) {
    // facePart[0] = outside left corner
    // facePart[6] = outside right corner
    // facePart[12] = inside left corner
    // facePart[16] = insode right corner
    return (facePart[0]._y < facePart[12]._y || facePart[6]._y < facePart[16]._y) ? "green" : "red"
}
function checkSentiment(facePart) {
    let newSentiment = (facePart[0]._y < facePart[12]._y || facePart[6]._y < facePart[16]._y) ? "happy" : "sad"
    if (newSentiment !== sentiment) {
        sentiment = newSentiment
        document.querySelector("#sentiment").innerHTML = `Your mood is ${sentiment}`
        console.log(sentiment)
        socket.sendSentiment(sentiment)
    }
}

// Helper Functions
function createCanvas(w, h) {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    canvas.style.position = "absolute"

    document.querySelector(".video-wrapper").appendChild(canvas)
    // document.body.appendChild(canvas)
    return canvas
}