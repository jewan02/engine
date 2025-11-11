"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges } from "@react-three/drei";
import { useState } from "react";

type ResizeCommand = {
  action: "resize";
  axis: "x" | "y" | "z";
  value: number;
};

type ColorCommand = {
  action: "color";
  value: string;
};

type InterpretCommand = ResizeCommand | ColorCommand;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isValidCommand = (payload: unknown): payload is InterpretCommand => {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("action" in payload) ||
    typeof (payload as { action: unknown }).action !== "string"
  ) {
    return false;
  }

  const action = (payload as { action: string }).action;

  if (action === "resize") {
    const axis = (payload as { axis?: unknown }).axis;
    const value = (payload as { value?: unknown }).value;

    if (typeof axis !== "string" || !isNumber(value)) return false;

    const normalizedAxis = axis.toLowerCase();
    return ["x", "y", "z"].includes(normalizedAxis);
  }

  if (action === "color") {
    const value = (payload as { value?: unknown }).value;
    return typeof value === "string" && value.length > 0;
  }

  return false;
};

export default function Home() {
  const [height, setHeight] = useState(1); // Height of the zoning mass in meters
  const [color, setColor] = useState("#74b9ff"); // Fill color for the zoning mass
  const [input, setInput] = useState(""); // User-entered instruction text

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        console.error("Interpretation failed", await response.text());
        return;
      }

      const command = await response.json();

      if (!isValidCommand(command)) {
        console.warn("Unsupported command", command);
        return;
      }

      if (
        command.action === "resize" &&
        command.axis.toLowerCase() === "y"
      ) {
        setHeight(command.value);
      }

      if (command.action === "color") {
        setColor(command.value);
      }
    } catch (error) {
      console.error("Interpretation error", error);
    } finally {
      setInput("");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5]">
      <div className="w-full h-[80vh]">
        <Canvas camera={{ position: [3, 3, 3] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxGeometry args={[1, height, 1]} />
            <meshStandardMaterial color={color} transparent opacity={0.4} />
            <Edges color="black" />
          </mesh>
          <OrbitControls />
        </Canvas>
      </div>

      <form
        onSubmit={handleSubmit}
        className="absolute bottom-8 w-full flex justify-center"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try: "height 10m" or "color red"'
          className="w-1/2 px-4 py-2 rounded-lg shadow-lg text-lg bg-white border border-gray-300 focus:outline-none"
        />
      </form>
    </main>
  );
}
