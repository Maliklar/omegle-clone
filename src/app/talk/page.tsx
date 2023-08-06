"use client";
import styles from "@/styles/pages/talk/index.module.scss";
import RTC from "@/utils/rtc";
import {
  ChangeEvent,
  KeyboardEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export default function Talk() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    {
      local: boolean;
      message: string;
    }[]
  >([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel>();
  const [stream, setStream] = useState<MediaStream>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };
  const sendMessageHandler = () => {
    if (!dataChannel || !chatInput.trim()) return;
    dataChannel.send(chatInput);
    messages.push({
      local: true,
      message: chatInput,
    });
    setMessages([...messages]);
    setChatInput("");
  };

  const inputKeyDownHandler: KeyboardEventHandler = (e) => {
    if (!dataChannel || !chatInput.trim()) return;
    if (e.key === "Enter") {
      dataChannel.send(chatInput);
      messages.push({
        local: true,
        message: chatInput,
      });
      setMessages([...messages]);
      setChatInput("");
    }
  };

  const connectHandler = async () => {
    if (!localVideoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();

      const rtc = new RTC(stream);
      rtc.pc.ontrack = (e) => {
        if (!remoteVideoRef.current) return;
        const stream = new MediaStream();
        stream.addTrack(e.track);
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play();
      };

      await rtc.start();

      rtc.onReady((dc) => {
        setDataChannel(dc);
        dc.onmessage = (e) => {
          messages.push({
            local: false,
            message: e.data,
          });
          setMessages([...messages]);
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  const chatContainer = useRef<HTMLDivElement>(null);
  const bottomDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bottomDiv.current) return;
    bottomDiv.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <main className={styles.main}>
      <aside>
        <video ref={remoteVideoRef} autoPlay></video>
        <video ref={localVideoRef} autoPlay></video>
      </aside>
      <div className={styles.chatContainer} ref={chatContainer}>
        <div className={styles.messagesContainer}>
          {messages.map((message, i) => {
            return (
              <div
                className={styles.chatMessage}
                key={i + message.message}
                data-local={message.local}
              >
                <span>{message.local ? "You" : "Stranger"}</span>{" "}
                {message.message}
              </div>
            );
          })}
          <div ref={bottomDiv} />
        </div>
      </div>
      <div className={styles.inputContainer}>
        <button onClick={connectHandler}>Connect</button>

        <div className={styles.input}>
          <input
            type="text"
            placeholder="Write something..."
            value={chatInput}
            onChange={inputChangeHandler}
            onKeyDown={inputKeyDownHandler}
            autoFocus
          />
          <button onClick={sendMessageHandler}>Send</button>
        </div>
      </div>
    </main>
  );
}
