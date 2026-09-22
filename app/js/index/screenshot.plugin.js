function screenshot() {
	const pixelBound = calculator.graphpaperBounds.pixelCoordinates;
	// const width = window.innerWidth;
	// const height = window.innerHeight;

	const width = pixelBound.width;
	const height = pixelBound.height;

    var base64data = calculator.screenshot({
        width: width,
        height: height,
        targetPixelRatio: 2
    });

    var imgContainerNode = document.createElement('div');
    var imgNode = document.createElement('img');

    imgContainerNode.classList.add("screenshot-container");
    imgNode.classList.add("screenshot");

	var blob = b64toBlob(base64data.split(',')[1], 'image/png');
    var blobUrl = URL.createObjectURL(blob);

	imgNode.width = width;
	imgNode.height = height;
	
	imgNode.src = blobUrl;
	imgNode.draggable = true;

	imgContainerNode.appendChild(imgNode);
	document.body.appendChild(imgContainerNode);

	setInterval(function(){
		imgContainerNode.classList.add("minimize")
	}, 1000);
	setInterval(function(){
		imgContainerNode.classList.add("delete");
		setInterval(function(){
			imgContainerNode.remove();
		}, 1000);
	}, 5000);
}

function copy(e){
	copyImage2Clipboard(e);
	const selectedText = window.getSelection().toString();
	window.electron.copyText(selectedText);
}

function copyImage2Clipboard(e){
	const screenshotImgs = document.querySelectorAll(".screenshot");
	if(screenshotImgs.length>0){
		const last = screenshotImgs.length - 1;
		screenshotImgs[last].classList.add("copied");

		var blobUrl = screenshotImgs[last].src;
		blobToDataURL(blobUrl, (dataURL)=>{
			window.electron.copyImage(dataURL);
		})
	}
}

function blobToDataURL(blobUrl, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', blobUrl);
    xhr.responseType = 'blob';
    xhr.send();
}


function b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
}

// screenshot();