export default class DataMessage {
    type="";
    data={};
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}