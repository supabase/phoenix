declare namespace _default {
    let HEADER_LENGTH: number;
    let META_LENGTH: number;
    namespace KINDS {
        let push: number;
        let reply: number;
        let broadcast: number;
    }
    function encode(msg: any, callback: any): any;
    function decode(rawPayload: any, callback: any): any;
    function binaryEncode(message: any): any;
    function binaryDecode(buffer: any): {
        join_ref: any;
        ref: null;
        topic: any;
        event: any;
        payload: any;
    } | {
        join_ref: any;
        ref: any;
        topic: any;
        event: string;
        payload: {
            status: any;
            response: any;
        };
    } | undefined;
    function decodePush(buffer: any, view: any, decoder: any): {
        join_ref: any;
        ref: null;
        topic: any;
        event: any;
        payload: any;
    };
    function decodeReply(buffer: any, view: any, decoder: any): {
        join_ref: any;
        ref: any;
        topic: any;
        event: string;
        payload: {
            status: any;
            response: any;
        };
    };
    function decodeBroadcast(buffer: any, view: any, decoder: any): {
        join_ref: null;
        ref: null;
        topic: any;
        event: any;
        payload: any;
    };
}
export default _default;
//# sourceMappingURL=serializer.d.ts.map