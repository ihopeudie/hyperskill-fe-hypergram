"use strict";

let imageSelected = false;
let canvas;
let baseImageData;

function copyData(data) {
    return Uint8ClampedArray.from(data);
}

function updateImage() {
    if (!imageSelected) {
        return false;
    }
    const ctx = canvas.getContext('2d');
    const baseImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    baseImage.data.set(copyData(baseImageData));
    const pixels = baseImage.data;
    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);
    const transparency = parseFloat(document.getElementById('transparent').value);
    for (let i = 0; i <= pixels.length; i += 4) {
        const pixel = {
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
            t: pixels[i + 3],
        }
        const editedPixel = updatePixel(pixel, brightness, contrast, transparency)

        pixels[i] = editedPixel.r;
        pixels[i + 1] = editedPixel.g;
        pixels[i + 2] = editedPixel.b;
        pixels[i + 3] = editedPixel.t;
    }
    baseImage.data.set(copyData(pixels));
    ctx.putImageData(baseImage, 0, 0)
}

function readFromFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (ev) => {
        const image = new Image();
        image.src = ev.target.result;
        image.onload = (ev) => {
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            imageSelected = true;
            baseImageData = copyData(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
        }
    }
}

function saveImage() {
    const imageData = canvas.toDataURL();
    const tmpLink = document.createElement('a');
    tmpLink.download = 'result.png'; // set the name of the download file
    tmpLink.href = imageData;
    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
}

function initJs() {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (event) => {
        if (event.target.files) {
            const file = event.target.files[0]
            readFromFile(file);
        }
    });

    const inputs = document.getElementsByClassName('image-inputs');
    for (let input of inputs) {
        input.addEventListener('change', () => {
            return updateImage();
        });
    }

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', () => saveImage())
}

function updatePixel(pixel, brightness, contrast, transparency) {
    let newPixel = Object.assign({}, pixel)
    if (contrast !== 0) {
        newPixel = editContrast(newPixel, contrast);
    }
    newPixel = editBrightness(newPixel, brightness);
    newPixel = editTransparency(newPixel, transparency);
    return newPixel;
}

const editTransparency = (pixel, alpha) => {
    const newPixel = {}
    newPixel.r = pixel.r;
    newPixel.g = pixel.g;
    newPixel.b = pixel.b;
    newPixel.t = pixel.t * alpha;
    return newPixel;
}

const editContrast = (pixel, contrast) => {
    const newPixel = {}
    const factor = 259 * (255 + contrast) / (255 * (259 - contrast))
    newPixel.r = truncate(factor * (pixel.r - 128) + 128);
    newPixel.g = truncate(factor * (pixel.g - 128) + 128);
    newPixel.b = truncate(factor * (pixel.b - 128) + 128);
    newPixel.t = pixel.t;
    return newPixel;
}

const editBrightness = (pixel, brightness) => {
    const newPixel = {};
    newPixel.r = truncate(pixel.r + brightness);
    newPixel.g = truncate(pixel.g + brightness);
    newPixel.b = truncate(pixel.b + brightness);
    newPixel.t = pixel.t;
    return newPixel;
}

function truncate(value) {
    if (value < -255) {
        return -255;
    }
    if (value > 255) {
        return 255;
    }
    return value;
}

window.addEventListener('load', () => {
    canvas = document.getElementById('canvas');
    initJs();
})