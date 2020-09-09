export as namespace ChunkUploadLib;

export = ChunkUpload;

declare class ChunkUpload {
  constructor(props: ChunkUpload.Props);

  digIn(onFinish: ChunkUpload.onFinish): void
}

declare namespace ChunkUpload {
    export interface Props {
        path: string,
        size: number,
        fileName: string,
        fileSize: number
    }

    export interface onFinish {
        (
            files?: File[],
            unlink?: (path: string) => void
        ): void
    }

    export interface File {
        number: number,
        path: string,
        headers: Header,
        blob: Blob
    }

    export interface Header {
        "x-chunk-number": number,
        "x-chunk-total-number": number,
        "x-chunk-size": number,
        "x-file-name": string,
        "x-file-size": number,
        "x-file-identity": string
    }

    export interface Blob {
        name: string,
        type: string,
        uri: string
    }
}