const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const photoPreview = document.getElementById('photo-preview');
const btnCapture = document.getElementById('capture');
const btnUpload = document.getElementById('upload');
const context = canvas.getContext('2d');
let videoStream;

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        videoStream = stream;
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing camera: ", err);
        showToast("Error accessing camera. Please ensure camera permissions are granted.");
    });

btnCapture.addEventListener('click', function () {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    photo.src = canvas.toDataURL('image/png');
    photoPreview.style.display = 'flex';
});

btnUpload.addEventListener('click', function () {
    if (videoStream) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('image', blob, 'photo.jpg');
            const serviceUrl = 'upload';
            fetch(serviceUrl, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then(data => {
                    showToast("Upload successful!");
                    console.log('Upload successful:', data);
                })
                .catch(error => {
                    showToast("Upload failed: " + error.message);
                    console.error('Upload error:', error);
                });
        }, 'image/jpeg');
    } else {
        showToast("No video stream available.");
    }
});

window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

function showToast(message) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    void toast.offsetWidth;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}