# React Native Chunk Upload
A package to bring **Chunked File Upload** into **React Native**.

## Dependencies
⚠ Make sure the following packages are installed.

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
    size: 10095, // chunk size  (Note: chunk size must be multiples of 3)
    fileName: 'my-file.mp4', // original file name
    fileSize: 75462163, // original file size

    // Errors
    onFetchBlobError: (e) => console.log(e),
    onWriteFileError: (e) => console.log(e),
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

            // 💥 Choose one of the following methods:

            // 1️⃣ If you're using the wester-chunk-upload php library...
            ...file.headers

            // 2️⃣ Customize the headers
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
                // ✅ done
                case 200:
                    console.log(response.data);
                break;

                // 🕗 still uploading...
                case 201:
                    console.log(`${response.data.progress}% uploaded...`);

                    if (typeof files[index + 1] !== 'undefined')
                        this.upload(index + 1, files, unlink);
                break;
            }
        })
        .catch(error => {
            // ❌ waddafuk? 😟
            if (error.response) {
                if ([400, 404, 415, 500, 501].includes(error.response.status)) {
                    unlink(file.path);

                    console.danger(error.response.status, 'Failed to upload the chunk.')
                } else if (error.response.status === 422) {
                    unlink(file.path);

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
If you're going to use this library, you won't need much to do...  
```javascript
// easy peasy, right? 😁
headers: {
    "Content-Type": "multipart/form-data",
    "Accept": 'application/json',

    ...file.headers
}
```
* https://github.com/hossein-zare/wester-chunk-upload

## Methods
```javascript
chunk.digIn(
    (
        data: {
            path: string,
            size: number,
            fileName: string,
            fileSize: number,
            fileIdentity: string,
            fileShortId: string,
            destinationPath: string,
            totalNumber: number
        },
        files: {
            number: number,
            path: string,
            headers: {
                "x-chunk-number": number,
                "x-chunk-total-number": number,
                "x-chunk-size": number,
                "x-file-name": string,
                "x-file-size": number,
                "x-file-identity": string
            },
            blob: {
                name: string,
                type: string,
                uri: string
            }
        }[],
        unlink: (path: string) => void
    ): void
): void;
```

## Support Us
Just star the repository, that's it! 😉