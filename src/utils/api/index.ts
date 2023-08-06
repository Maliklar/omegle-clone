import axios from "axios";
export default class Request {
  request;
  constructor() {
    this.request = axios.create({
      baseURL: "/api",
    });
  }

  findOffer = async () => {
    try {
      const { data, status } = await this.request.get("/findOffer");
      if (status !== 200) return null;
      return {
        ...data,
        offer: JSON.parse(data.offer),
      } as OfferResponse;
    } catch (error) {
      return null;
    }
  };

  sendAnswer = async (answer: RTCSessionDescription, id: number | string) => {
    try {
      const body = {
        id,
        answer,
      };
      const { status } = await this.request.post("/sendAnswer", { body });
      if (status === 200) return true;
    } catch {
      return null;
    }
  };

  createOffer = async (offer: RTCSessionDescription) => {
    const body = {
      offer: JSON.stringify(offer),
    };
    try {
      const { status, data } = await this.request.post("/createOffer", {
        body: body,
      });
      if (status !== 200) return null;
      return {
        ...data,
        offer: JSON.parse(data.offer),
        answer: JSON.parse(data.answer),
      } as OfferResponse;
    } catch {
      return null;
    }
  };
}

export type OfferResponse = {
  id: number;
  offer: RTCSessionDescriptionInit;
  answer: RTCSessionDescriptionInit;
};
