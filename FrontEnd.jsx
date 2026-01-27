import { useState } from "react";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/journal`;

  export const getEntries = async () => {
    const res = await axios.get(API_URL);
    return res.data;
  };

  export const addEntry = async (entry) => {
    const res = await axios.post(API_URL, entry);
    return res.data;
  };

  export const deleteEntry = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  };

  const saveEntry = async (token, title, content) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/journal/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
  };

export default function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ollama`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setResponse(data.reply);
  };

  
}
