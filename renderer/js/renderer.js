
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e){
    const file = e.target.files[0];

    if(!isFileImage(file)){
        alertError("Please select an image");
        return;
    }

    // Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function(){
        heightInput.value = this.height;
        widthInput.value = this.width;
        outputPath.innerText = path.join(os.homedir(), 'imageresizer')
    }

    form.style.display = "block";
    filename.innerText = file.name;
}

function sendImage(e){
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;


    if(!img.files[0]){
        alertError("Please upload an image");
        return;
    }

    if(width === '' || height === ''){
        alertError('Please fill in the height and width');
        return;
    }

    // Send to main using ipcRenderer

    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height
    })


}

// catch the image:done event
ipcRenderer.on('image:done', ()=>{
    alertSuccess(`Image resized to ${widthInput.value} and ${heightInput.value}`);
})

// Make sure file is image
function isFileImage(file){
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
    return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message){
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center'
        }
    })
}


function alertSuccess(message){
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center'
        }
    })
}

img.addEventListener('change', loadImage);

form.addEventListener('submit', sendImage);