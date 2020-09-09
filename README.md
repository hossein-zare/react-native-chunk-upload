# React Native Chunk Upload
A package to bring **Chunked File Upload** into **React Native**.

## Dependencies
Make sure the following packages are installed.

* **`react-native-fs`** https://github.com/itinance/react-native-fs
* **`rn-fetch-blob`** https://github.com/joltup/rn-fetch-blob

## Installation
```bash
npm i react-native-chunk-upload
```

## Basic Usage
```javascript
import Axios from 'axios';
import ChunkUpload from 'react-native-chunk-upload';

const chunk = new ChunkUpload({
    path: '/storage/.../my-file.mp4', // path to the file
    size: 10095, // chunk size
    fileName: 'my-file.mp4', // original file name
    fileSize: 75462163, // original file size
});

chunk.digIn((data, files, unlink) => {
    this.upload(0, files, unlink);
});

const upload = (index, files, unlink) => {
    const file = files[index];
    const body = new FormData();

    body.append('video', file.blob);

    Axios.post('url', body, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Accept": 'application/json',

            // If you're using the wester-chunk-upload php library...
            ...file.headers

            // You can also make the headers compatible with your server-side
            "x-chunk-number": file.headers["x-chunk-number"],
            "x-chunk-total-number": file.headers["x-chunk-total-number"],
            "x-chunk-size": file.headers["x-chunk-size"],
            "x-file-name": file.headers["x-file-name"],
            "x-file-size": file.headers["x-file-name"],
            "x-file-identity": file.headers["x-file-identity"]
        }
    })
        .then(response => {
            // Delete the chunk
            unlink(file.path);

            switch (response.status) {
                // done
                case 200:
                    console.log(response.data);
                break;

                // still uploading...
                case 201:
                    console.log(`${response.data.progress}% uploaded...`);

                    if (typeof files[index + 1] !== 'undefined')
                        this.upload(index + 1, files, unlink);
                break;
            }
        })
        .catch(error => {
            if (error.response) {
                if (this.codes.includes(error.response.status)) {
                    console.danger(error.response.status, 'Failed to upload the chunk.')
                } else if (error.response.status === 422) {
                    console.warn('Validation Error', error.response.data);
                } else {
                    console.log('Re-uploading the chunk...');
                    this.upload(index, files, unlink);
                }
            } else {
                console.log('Re-uploading the chunk...');
                this.upload(index, files, unlink);
            }
        });
}
```
### Wester Chunk Upload PHP Library
Both of these PHP and React Native packages have been created to integrate with eachother.  
If you're going to use this library, you won't need much to do...
* https://github.com/hossein-zare/wester-chunk-upload