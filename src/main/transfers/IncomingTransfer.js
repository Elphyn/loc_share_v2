import Transfer from "./Transfer.js";

export default class IncomingTransfer extends Transfer {
  constructor(channel, meta, transferID) {
    super(meta.from, transferID, meta.files, channel);

    this.setup();
  }

  foo() {}

  async receive() {
    this.notifyTransferStart();

    this.notifyTransferFinished();
  }

  setup() {
    try {
      this.receive();
    } catch (err) {
      this.notifyTransferFailed();
    }
  }

  static create(channel, meta) {
    const transferID = crypto.randomUUID();

    const instance = new IncomingTransfer(channel, meta, transferID);

    return { transferID, transfer: instance };
  }
}
