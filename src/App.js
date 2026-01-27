import { useState, useRef, useEffect } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // User Message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();

      const reply = data.reply || "⚠️ No response";
      typeResponse(reply);
    } catch (err) {
      console.error("Error talking to backend:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "ataraxia", text: "⚠️ Could not reach backend" },
      ]);
      setIsTyping(false);
    }
  };

  // Typing Animation
  const typeResponse = (text) => {
    let i = 0;
    let currentText = "";

    setMessages((prev) => [...prev, { sender: "ataraxia", text: "" }]);

    const interval = setInterval(() => {
      currentText += text[i];
      i++;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "ataraxia",
          text: currentText,
        };
        return updated;
      });

      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50); // typing speed
  };

  // Enter/Shft+Enter for new line
  const pressKey = (enter) => {
    if (enter.key === "Enter" && !enter.shiftKey) {
      enter.preventDefault();
      sendMessage();
    }
  }; 

return (
      <div className="p-4">
        <div id="chat-container" style={{ padding: "20px", maxWidth: "600px", margin: "auto"}}>
        <h2>🧘 Ataraxia - Emotional Support Chat</h2>

        <div id="chat-box"
          style={{
            border: "2px solid #ccc",
            padding: "10px",
            height: "400px",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                textAlign: msg.sender === "user" ? "right" : "left",
                margin: "5px 0",
              }}
            >
              <strong>{msg.sender === "user" ? "You" : "Ataraxia"}:</strong>{" "}
              {msg.text}
            </div>
          ))}

          {isTyping && (
            <div id="typing-indicator">
              <strong>Ataraxia:</strong> <em>typing...</em>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <input type="text" id="user-input" placeholder="Message"
          value={input}
          onChange={(enter) => setInput(enter.target.value)}
          onKeyDown={pressKey}
          style={{ width: "99.5%", height: "80px", marginBottom: "10px", borderRadius: "5px", fontSize: "16px", fontFamily: "Arial, sans-serif", padding: "10px", boxSizing: "border-box" }}
        />
        <br />
      </div>
    </div>
  );
}
export default App;
