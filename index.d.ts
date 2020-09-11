export as namespace ChunkUploadLib;

export = ChunkUpload;

declare class ChunkUpload {
  constructor(props: ChunkUpload.Props);

  digIn(Event: ChunkUpload.Event): void
}

declare namespace ChunkUpload {
    export interface Props {
        path: string,
        size: number,
        fileName: string,
        fileSize: number
    }

    export interface Event {
        (
            file: File,
            unlink: (path: string) => void,
            next: () => void,
            retry: () => void
        ): void
    }

    export interface File {
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