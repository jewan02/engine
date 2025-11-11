"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

export default function Home() {
  const [height, setHeight] = useState(1);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple parsing: "height 10" or "height 5m"
    const match = input.match(/height\s*(\d+(\.\d+)?)/i);
    if (match) setHeight(parseFloat(match[1]));
    setInput("");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5]">
      <div className="w-full h-[80vh]">
        <Canvas camera={{ position: [3, 3, 3] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxGeometry args={[1, height, 1]} />
            <meshStandardMaterial color="#050505" wireframe/>
          </mesh>
          <OrbitControls />
        </Canvas>
      </div>

      <form
        onSubmit={handleSubmit}
        className="absolute bottom-8 w-full flex justify-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type: height 5m"
          className="w-1/2 px-4 py-2 rounded-lg shadow-lg text-lg bg-white border border-gray-300 focus:outline-none"
        />
      </form>
    </main>
  );
}