import {
  showErrorMessage,
  showSuccessMessage,
} from "@/src/components/toastMessage";
import { useAuth } from "@/src/context/AuthContext";
import api from "@/src/services/apiClient";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Text, TextInput, View } from "react-native";
export default function ScannerScreen() {
  const [dots, setDots] = useState("");
  const [isPausedUI, setIsPausedUI] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [editable, setEditable] = useState(true); // <- NEW

  const { user } = useAuth();
  // animations
  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // scanner refs
  const inputRef = useRef<TextInput>(null);
  const remainderRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  const END_GAP_MS = 150;
  const PAUSE_MS = 5000;

  useEffect(() => {
    const id = setInterval(() => {
      setDots((p) => (p.length >= 3 ? "" : p + "."));
    }, 450);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (countdownIntRef.current) clearInterval(countdownIntRef.current);
    };
  }, []);

  const startPause = () => {
    isPausedRef.current = true;
    setIsPausedUI(true);
    setEditable(false); // <- hard-disable native edits
    setCountdown(PAUSE_MS / 1000);

    if (timerRef.current) clearTimeout(timerRef.current);

    remainderRef.current = "";
    // Clear & blur so HID keystrokes have nowhere to go
    inputRef.current?.clear?.();
    inputRef.current?.setNativeProps?.({ text: "" });
    inputRef.current?.blur?.(); // <- critical to avoid HID typing into it

    if (countdownIntRef.current) clearInterval(countdownIntRef.current);
    countdownIntRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownIntRef.current) clearInterval(countdownIntRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
      setIsPausedUI(false);
      setEditable(true); // <- re-enable input
      // slight delay helps avoid stray queued events on some devices
      setTimeout(() => inputRef.current?.focus?.(), 0);
    }, PAUSE_MS);
  };

  const handleScan = (raw: string) => {
    const id = raw.replace(/[\r\n]/g, "").trim();
    if (!id) return;
    console.log("Scanned RFID value:", id);
    validateTransaction(id);
    startPause();
  };

  const validateTransaction = async (rfid: string) => {
    const data = {
      cardUid: rfid,
      amount: 1,
      operatorId: user?.accountCode || "unknown",
    };

    try {
      const response = await api.post("transaction/enter", data);
      console.log("API response:", response.data);

      if (response.data.status === 0) {
        showErrorMessage("Scan Error", response.data.message);
      }

      if (response.data.status === 1) {
        showSuccessMessage(
          "Scan Success",
          `${response.data.message} 
          balance: ${response.data.responseData.balance}
        `
        );
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const flushIdle = () => {
    console.log("Flushing idle");
    console.log({ isPaused: isPausedRef.current });
    if (isPausedRef.current) return;
    const id = remainderRef.current.trim();
    if (id) handleScan(id);
    remainderRef.current = "";
    inputRef.current?.clear?.();
    inputRef.current?.setNativeProps?.({ text: "" });
    inputRef.current?.focus?.();
  };

  const scheduleIdleFlush = () => {
    console.log("Scheduling idle flush");
    console.log({ isPaused: isPausedRef.current });
    if (isPausedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushIdle, END_GAP_MS);
  };

  return (
    <LinearGradient
      colors={["#ff9a9e", "#8e44ad", "#fbc531"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-center items-center p-8">
        <Image
          source={require("@/assets/images/gfl-logo.png")}
          style={{ width: 200, height: 180, marginBottom: 40 }}
          resizeMode="contain"
        />

        <Animated.View style={{ opacity: fade, transform: [{ scale: pulse }] }}>
          <Text className="text-white text-2xl font-semibold tracking-wider">
            {isPausedUI ? `Processing… ${countdown || ""}` : `Scanning${dots}`}
          </Text>
        </Animated.View>

        <TextInput
          ref={inputRef}
          editable={editable} // <- NEW
          onFocus={() => {
            // If something tried to focus while paused, immediately blur
            if (isPausedRef.current) inputRef.current?.blur?.();
          }}
          onChangeText={(t) => {
            // If paused or non-editable, nuke anything that slipped in
            if (isPausedRef.current || !editable) {
              inputRef.current?.setNativeProps?.({ text: "" });
              remainderRef.current = "";
              return;
            }

            const normalized = t.replace(/\r/g, "");
            const parts = normalized.split("\n");

            for (let i = 0; i < parts.length - 1; i++) {
              const segment = parts[i].trim();
              if (segment) handleScan(segment);
              if (isPausedRef.current) break; // scan triggered pause
            }

            if (!isPausedRef.current) {
              const remainder = parts[parts.length - 1] ?? "";
              remainderRef.current = remainder;
              inputRef.current?.setNativeProps?.({ text: remainder });
              scheduleIdleFlush();
            } else {
              inputRef.current?.setNativeProps?.({ text: "" });
              remainderRef.current = "";
            }
          }}
          onSubmitEditing={() => {
            console.log({ isPaused: isPausedRef.current });
            if (isPausedRef.current || !editable) return;
            if (timerRef.current) clearTimeout(timerRef.current);
            flushIdle();
          }}
          blurOnSubmit={false}
          autoFocus
          showSoftInputOnFocus={false}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
          caretHidden
          importantForAutofill="no"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="visible-password"
          multiline={false}
        />
      </View>
    </LinearGradient>
  );
}
