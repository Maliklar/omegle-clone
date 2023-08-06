"use client";
import styles from "@/styles/pages/home/index.module.scss";
import RTC from "@/utils/rtc";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [dc, setDc] = useState<RTCDataChannel>();
  const [message, setMessage] = useState<string[]>([]);

  return (
    <main className={styles.main}>
      <Link href="/talk">Start</Link>
    </main>
  );
}
