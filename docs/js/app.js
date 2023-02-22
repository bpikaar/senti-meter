const video = document.getElementById("webcam");
const label = document.getElementById("label");

const addImageBtn = document.querySelector("#addImage");
const trainbtn = document.querySelector("#train");

const canvas = document.querySelector("canvas")
const context = canvas.getContext('2d')


// Extract the already learned features from MobileNet
const featureExtractor = ml5.featureExtractor("MobileNet", { numLabels: 5 }, modelLoaded)

addImageBtn.addEventListener("click", (event) => loadImage(event))
trainbtn.addEventListener("click", () => train());

// When the model is loaded
function modelLoaded() {
    console.log('Model Loaded!');

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((err) => {
                console.log("Something went wrong!");
            });
    }

    label.innerText = "Ready when you are!";
}

// Create a new classifier using those features and with a video element
const classifier = featureExtractor.classification(video, videoReady);

// Triggers when the video is ready
function videoReady() {
    console.log('The video is ready!');
}



function loadImage(event) {
    console.log("load image");
    
    let tag = document.querySelector("#tag").value
    console.log(tag)
    // Add a new image with a label
    classifier.addImage(video, tag)

    label.innerText = `Image with tag ${tag} added!`
    setTimeout(() => label.innerText = '', 1000)
}

function train() {
    console.log("start training")
    classifier.train((lossValue) => {
        label.innerText = `Loss ${lossValue}`
        // console.log("loss " + lossValue)
        if (lossValue == null) {
            label.innerText = "Finished training! I understand everything"
            setTimeout(() => label.innerText = '', 1000)
            startClassifying()
        }
    });
}

function startClassifying() {
    setInterval(() => {
        classifier.classify(video, (error, result) => {
            if (error) console.log("oh noooo 😡")
            // console.log(result)
            label.innerText = `I think this is ${result[0].label} confidence: ${result[0].confidence}`
        });
    }, 1000)
}