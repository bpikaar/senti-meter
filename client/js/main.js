import Socket from "./socket.js";
import {
    DrawingUtils,
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

const socket = new Socket();

const video = document.querySelector("#video");
const videoWrapper = document.querySelector("#video-wrapper");
const userEmoji = document.querySelector("#useremoji");
const userName = document.querySelector("#username");
const loginView = document.querySelector("#login");
const userView = document.querySelector("#user");
const students = document.querySelector("students");
const sendbutton = document.querySelector("sendbutton");
const emoji = ["😦", "😐", "😯", "🙂", "😀", "😆", "😉"];

let runningMode = "VIDEO";


let faceLandmarker = undefined;

// Fix for iOS Safari from https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.setAttribute('playsinline', '');

const width = 320;
const height = 240;
// const width = 1280
// const height = 720
let canSend = false;
let canvas, ctx, drawingUtils;
let currentSentiment = "😐";
let initialized = false;

document.querySelector("form").addEventListener("submit", (e) => addClientToServer(e));
document.addEventListener("updateClients", (event) => updateClientList(event.clients));
document.addEventListener('click', (event) => canSend = true);
document.addEventListener('click', (event) => canSend = true);

async function startFaceAPI() {
    // const detectionOptions = {
    //     withLandmarks: true,
    //     // withDescriptors: true,
    //     // withExpressions: true, deprecated https://github.com/ml5js/ml5-library/issues/597
    // };
    //
    // faceapi = ml5.faceApi(detectionOptions, modelLoaded);
    const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    console.log(vision);
    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
    });

    modelLoaded();
}


/**
 * start de app - aangeroepen onderin dit document
 */
function modelLoaded() {
    console.log('Model Loaded!');
    // console.log(faceapi);
    // Make some sparkles
    canvas = createCanvas(width, height);
    ctx = canvas.getContext("2d");
    drawingUtils = new DrawingUtils(ctx);
    // flip de context horizontally
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    startWebcam();
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
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then((mediaStream) => {
                initialized = true;
                if ('srcObject' in video) {
                    video.srcObject = mediaStream;
                } else {
                    video.src = URL.createObjectURL(mediaStream);
                }
                video.onloadedmetadata = () => {
                    video.play();
                    requestAnimationFrame(loop);
                };
            })
            .catch((err) => {
                // always check for errors at the end.
                console.error(`${err.name}: ${err.message}`);
            });
    }
}

function loop(timestamp) {
    // faceapi.detect(video, gotResults);

    let results = faceLandmarker.detectForVideo(video, timestamp);

    if (results.faceLandmarks) {
        gotResults(null, results);

        for (const landmarks of results.faceLandmarks) {

            // drawingUtils.drawConnectors(
            //     landmarks,
            //     FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            //     {color: "#C0C0C070", lineWidth: 1}
            // );
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                {color: "#E0E0E0"}
            );
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                {color: "#E0E0E0"}
            );
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                {color: "#E0E0E0"}
            );
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                {color: "#E0E0E0"}
            );
            drawingUtils.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                {color: "#E0E0E0"}
            );
            // drawingUtils.drawConnectors(
            //     landmarks,
            //     FaceLandmarker.FACE_LANDMARKS_LIPS,
            //     {color: "#E0E0E0"}
            // );
            // drawingUtils.drawConnectors(
            //     landmarks,
            //     FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            //     {color: "#FF3030"}
            // );
            // drawingUtils.drawConnectors(
            //     landmarks,
            //     FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            //     {color: "#30FF30"}
            // );
        }
    }
    requestAnimationFrame(loop); // todo 120fps too fast?
}

function gotResults(err, result) {
    if (err) {
        console.error(err);
        return;
    }

    let detections = result;

    // Clear part of the canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(video, 0, 0, width, height);

    if (detections) {
        if (detections.faceBlendshapes.length > 0) {
            drawBox(detections);
            detectSentiment(detections);
        }
    }
}

function drawBox(detections) {
    for (let i = 0; i < detections.length; i += 1) {
        const alignedRect = detections[i].alignedRect;

        const x = alignedRect._box._x;
        const y = alignedRect._box._y;
        const boxWidth = alignedRect._box._width;
        const boxHeight = alignedRect._box._height;

        ctx.beginPath();
        ctx.rect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = "#a15ffb";
        ctx.stroke();
        ctx.closePath();
    }
}

function detectSentiment(detections) {
    // console.log(detections.faceBlendshapes[0].categories);
    const categories = detections.faceBlendshapes[0].categories;

    const mouthSmileLeft    = categories.find(obj => obj.categoryName === "mouthSmileLeft");
    const mouthSmileRight   = categories.find(obj => obj.categoryName === "mouthSmileRight");
    const jawOpen           = categories.find(obj => obj.categoryName === "jawOpen");
    const mouthShrugLower   = categories.find(obj => obj.categoryName === "mouthShrugLower");
    const mouthPucker       = categories.find(obj => obj.categoryName === "mouthPucker");
    const eyeBlinkRight     = categories.find(obj => obj.categoryName === "eyeBlinkRight");
    const eyeBlinkLeft      = categories.find(obj => obj.categoryName === "eyeBlinkLeft");
    const browInnerUp       = categories.find(obj => obj.categoryName === "browInnerUp");
    // console.log(jawOpen.score);
    let sentiment = "😐"; //'neutral';
    if (mouthShrugLower.score > 0.25 ||
        mouthPucker > 0.25) {
        sentiment = "😦"; //'smile';
    }
    if (mouthSmileLeft.score > 0.5 &&
        mouthSmileRight.score > 0.5) {
        sentiment = "🙂"; //'smile';
    }
    if (mouthSmileLeft.score > 0.85 &&
        mouthSmileRight.score > 0.85) {
        sentiment = "😀";//'big';
    }
    if (mouthSmileLeft.score > 0.8 &&
        mouthSmileRight.score > 0.8 &&
        jawOpen.score > 0.2) {
        sentiment = "😆";//'big smile with teeth';
    }
    if (eyeBlinkRight.score > 0.5 ||
        eyeBlinkLeft.score > 0.5) {
        sentiment = "😉";//'big smile with teeth';
    }
    if (browInnerUp.score > 0.5 &&
        jawOpen.score > 0.4 ) {
        sentiment = "😯";//'surprised';
    }

    userEmoji.innerText = sentiment;
    if (canSend) sendNewSentiment(sentiment);
    drawMouth(detections, sentiment);
}

function drawMouth(detections, sentiment) {
    const landmarks = detections.faceLandmarks[0]
    let color = "#E0E0E0";
    if (emoji.indexOf(sentiment) < 1) color = "#c71c1c";
    if (emoji.indexOf(sentiment) === 2) color = "#e87c0b";
    if (emoji.indexOf(sentiment) === 3) color = "#c6de15";
    if (emoji.indexOf(sentiment) === 4) color = "#7ac24f";
    if (emoji.indexOf(sentiment) > 4) color = "#55ee01";

    drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        {color: color}
    );
}

function drawPart(feature, closed, color = "blue") {
    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let i = 0; i < feature.length; i += 1) {
        const x = feature[i]._x;
        const y = feature[i]._y;

        // show number of point
        // ctx.fillText(i, feature[i]._x, feature[i]._y)

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    if (closed === true) {
        ctx.closePath();
    }
    ctx.strokeStyle = color;
    ctx.stroke();
}

// function isHappy(detection) {
//     // facePart[0] = outside left corner
//     // facePart[6] = outside right corner
//     // facePart[12] = inside left corner
//     // facePart[16] = insode right corner
//     return (mouth[0]._y < mouth[12]._y || mouth[6]._y < mouth[16]._y);
//     // return detection.score > 0.5;
// }
//
// function getSentimentColor(detections) {
//     return isHappy(detections) ? "green" : "red";
// }
function sendNewSentiment(sentiment) {
    if (currentSentiment !== sentiment) {
        // console.log(sentiment)
        socket.sendSentiment(sentiment);
        currentSentiment = sentiment;
    }
    canSend = false;
}

// Helper Functions
function createCanvas(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.id = "drawingcanvas";
    videoWrapper.appendChild(canvas);
    // document.body.appendChild(canvas)
    return canvas;
}

// login button
function addClientToServer(e) {
    e.preventDefault();
    let name = document.querySelector("#login-name").value;
    if (name === "") {
        name = "Anonymous";
    }

    loginView.style.display = "none";
    userView.style.display = "flex";
    userName.innerText = name;

    // add client to server
    socket.addClient(name)
        .then(() => {
            console.log("client added");
        });


}

function updateClientList(clients) {
    students.innerHTML = "";
    clients.forEach(client => {
        addStudent(client.name, client.sentiment);
    });
}

/**
 * Clone template and add to DOM
 * @param {string} name
 * @param {*} emo
 */
function addStudent(name, emo) {
    console.log("emo ", emo);
    const temp = document.querySelector("template");
    const student = temp.content.cloneNode(true);
    student.querySelector(".name").innerText = name;
    student.querySelector(".emoji").innerText = emo;
    students.appendChild(student);

}
startFaceAPI();

