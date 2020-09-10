import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';

class ChunkUpload {
    constructor(props) {
        this.data = {
            path: String(props.path),
            size: parseInt(props.size),
            fileName: String(props.fileName),
            fileSize: parseInt(props.fileSize),
            fileIdentity: this.generateFileIdentity(),
            fileShortId: null,
            destinationPath: RNFS.TemporaryDirectoryPath,
            totalNumber: 0
        };

        this.data.fileShortId = this.data.fileIdentity.substr(0, 10);
        this.data.totalNumber = this.getTotalNumber();

        // Errors
        this.onFetchBlobError = props.onFetchBlobError;
        this.onWriteFileError = props.onWriteFileError;
    }

    digIn(onFinish = () => {}) {
        this.onFinish = onFinish;

        this.getBase64Chunks();
    }

    async getBase64Chunks() {
        let data = [];

        await RNFetchBlob.fs.readStream(
            'file://' + (this.data.path).replace('file://', ''),
            'base64',
            this.data.size
        )
            .then((ifstream) => {
                ifstream.open();

                ifstream.onData((chunk) => {
                    data.push(chunk);
                });

                ifstream.onError(e => this.onFetchBlobError(e));

                ifstream.onEnd(() => {
                    this.storeChunks(data);
                });
            });
    }

    async storeChunks(chunks) {
        let files = [];
        let error = false;

        for (let [index, chunk] of chunks.entries()) {
            index+= 1;
            const path = `${this.data.destinationPath}/chunk-${this.data.fileShortId}-${index}.tmp`;

            await RNFetchBlob.fs.writeFile(path, chunk, 'base64')
                .then(() => {
                    files.push({
                        number: index,
                        path,
                        headers: this.getHeaders(index),
                        blob: this.getBlobObject(path)
                    });
                })
                .catch(e => {
                    error = true;
                    this.onWriteFileError(e);
                });

            if (error) {
                for (let file of files) {
                    this.unlink(file.path);
                }

                break;
            }
        }
    
        this.onFinish(files, this.unlink);
    }

    unlink(path) {
        RNFS.unlink(path)
            .then(() => {
                //
            })
            .catch((err) => {
                //
            });
    }

    getBlobObject(path) {
        return {
            name: 'blob',
            type: 'application/octet-stream',
            uri: 'file://' + path,
        }
    }

    getHeaders(index) {
        return {
            "x-chunk-number" : index,
            "x-chunk-total-number" : this.data.totalNumber,
            "x-chunk-size" : this.data.size,
            "x-file-name" : this.data.fileName,
            "x-file-size" : this.data.fileSize,
            "x-file-identity" : this.data.fileIdentity
        }
    }

    generateFileIdentity(length = 32) {
        return [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('');
    }

    getTotalNumber() {
        const total = Math.ceil(this.data.fileSize / this.data.size);
        
        return total > 0 ? total : 1;
    }
}

ChunkUpload.defaultProps = {
    onFinish: () => {},
    onFetchBlobError: () => {},
    onWriteFileError: () => {},
};

export default ChunkUpload;