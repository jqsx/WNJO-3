export default class DataMessage {
    TYPE="";
    data={};
    constructor(type, data) {
        this.TYPE = type;
        this.data = data;
    }
}