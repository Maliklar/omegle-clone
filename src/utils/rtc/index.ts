import axios from "axios";
import { peerConnectionConfig } from "./constants";
import Request, { OfferResponse } from "../api";

export default class RTC {
  pc: RTCPeerConnection;
  dc?: RTCDataChannel;
  findCall: boolean = false;
  offerReceived?: RTCSessionDescriptionInit;
  id?: number;
  request;
  stream;

  constructor(stream: MediaStream) {
    this.pc = new RTCPeerConnection(peerConnectionConfig);
    this.stream = stream;
    const tracks = this.stream.getTracks();
    tracks.forEach((track) => this.pc.addTrack(track));
    this.request = new Request();
    // Wait for answer or offer
    this.wait();
  }

  async start() {
    const offerData = await this.request.findOffer();
    if (!offerData) return await this.createOfferWaitAnswer();
    return await this.setOfferCreateAnswer(offerData);
  }

  private async setOfferCreateAnswer({ id, offer }: OfferResponse) {
    this.findCall = true;
    this.offerReceived = offer;
    this.id = id;
    await this.pc.setRemoteDescription(offer);
    const localDescription = await this.pc.createAnswer();
    this.pc.setLocalDescription(localDescription);
  }

  private async createOfferWaitAnswer() {
    this.dc = this.pc.createDataChannel("CHANNEL");
    const localDescription = await this.pc.createOffer();
    this.pc.setLocalDescription(localDescription);
  }

  async sendOffer(localDescription: RTCSessionDescription) {
    const answer = await this.request.createOffer(localDescription);
    if (!answer) throw Error("Offer sent but no answer were received");
    this.id = answer.id;
    this.pc.setRemoteDescription(answer.answer);
  }

  private async wait() {
    let candidateFound = false;
    this.pc.onicecandidate = ({ candidate }) =>
      candidate && (candidateFound = true);

    this.pc.ondatachannel = (e) => (this.dc = e.channel);
    const interval = setInterval(async () => {
      if (!candidateFound) return;
      clearInterval(interval);
      setTimeout(() => {
        if (!this.pc.localDescription)
          throw Error("Ice candidate found but there wasn't local description");
        if (this.offerReceived && this.id) {
          this.request.sendAnswer(this.pc.localDescription, this.id);
        } else {
          this.sendOffer(this.pc.localDescription);
        }
      }, 1000);
    });
  }

  onReady(callback: (dc: RTCDataChannel) => void) {
    const i = setInterval(async () => {
      if (this.dc) {
        callback(this.dc);
        clearInterval(i);
      }
    });
  }
}
