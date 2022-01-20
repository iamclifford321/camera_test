const imageUpload = document.getElementById('imageUpload');
const MODEL_URL = '/face-api-testing/models'

const constraints = {
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440,
    },
  },
};

Promise.all([

    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    // faceapi.
    // faceapi.loadSsdMobilenetv1Model(MODEL_URL),
    // faceapi.loadFaceLandmarkModel(MODEL_URL),
    // faceapi.loadFaceRecognitionModel(MODEL_URL)

]).then(startVideo)

function loadLabeledImages(){
    const labels = ['Black Widow', 'Clifford Ursabia'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];

            for(let i = 1; i <= 2; i++){
                // const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
                const img = await faceapi.fetchImage(`/face-api-testing/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img)
                .withFaceLandmarks().withFaceDescriptor()

                descriptions.push(detections.descriptor);
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}


const video = document.getElementById('video')

// stop video stream
function stopVideoStream() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}

async function startVideo(){
    // navigator.getUserMedia(
    //     {video:{}},
    //     stream => video.srcObject = stream,
    //     err => console.log(err)
    // )

    // constraints.video.facingMode = useFrontCamera ? "user" : "environment";
    stopVideoStream();
    constraints.video.facingMode = "environment";

    try {
      videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = videoStream;
    } catch (err) {
      alert("Could not access the camera");
    }

}
video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas);
    const displaySize = {
        width: video.width,
        height: video.height
    }
    faceapi.matchDimensions(canvas, displaySize)
    const labeledDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

    setInterval(async () => {

        const detections = await faceapi.detectAllFaces(video,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()

        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections,displaySize);

        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))


        if(results.length == 1){
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, {label:result.toString()});
                drawBox.draw(canvas)
            })
            $('label').text('Exam continue');


        }else{
            $('label').text('Exam paused');
            console.log('exam paused');
        }



        // const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // faceapi.draw.drawDetections(canvas, resizedDetections)

    }, 1000)

})
