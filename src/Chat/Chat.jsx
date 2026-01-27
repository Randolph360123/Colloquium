  import { useState, useRef, useEffect } from "react";
  import "./Chat.css";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import Swal from 'sweetalert2';
  import { v4 as uuidv4 } from "uuid";
  function Chat() {  /*FUNCTION FOR AI*/
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const controllerRef = useRef(null); // ✅ For canceling AI request
    const [sessionId, setSessionId] = useState(uuidv4()); // ✅ For safety check
    const [isWaiting, setIsWaiting] = useState(false);
    const [isHandleSettings, setHandleSettings] = useState(false);
    const [showAdjustments, setShowAdjustments] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [notifTime, setNotifTime] = useState("10:00");
    const [showContactUs, setShowContactUs] = useState(false);
    const [showJournal, setShowJournal] = useState(false);
    const [journalEntries, setJournalEntries] = useState([]);
    const [newEntryTitle, setNewEntryTitle] = useState("");
    const [newEntryText, setNewEntryText] = useState("");
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showAddEntry, setShowAddEntry] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [chatSessions, setChatSessions] = useState([]); // All chats
    const [currentChatId, setCurrentChatId] = useState(null); // The one user is currently in
    const [showHistory, setShowHistory] = useState(false); // Dropdown toggle
    const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);    //PROFILE PICTURE
    const [profilePicture, setProfilePicture] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [hasSavedOnce, setHasSavedOnce] = useState(false);

/*DARK MODE*/
const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem("darkMode");
  return saved ? JSON.parse(saved) : false;
});
useEffect(() => {
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
}, [darkMode]);
const handleDarkModeToggle = async () => {
  const newMode = !darkMode;
  setDarkMode(newMode);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  if (user.isGuest) {
    // 🔵 Guest mode: save in localStorage only
    localStorage.setItem("darkMode", newMode);
    console.log("Dark mode saved locally for guest:", newMode);
  } else if (user._id) {
    // 🟢 Logged-in user: save to server
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/dark-mode`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          userId: user._id,
          darkMode: newMode,
        }),
      });
      const data = await res.json();
      console.log("Dark mode updated on server:", data);
    } catch (err) {
      console.error("Error updating dark mode:", err);
    }
  }
};
useEffect(() => {
  document.body.classList.toggle("dark", darkMode);
}, [darkMode]);
    /*PERMISSION TO HAVE NOTIFICATIONS */
    const sendTestNotification = () => {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Test Notification ✅", {
            body: "This is a test reminder from Ataraxia!",
            icon: "/LogoLay.png",
          });
        } else {
        Swal.fire({
          icon: "warning",
          title: "Permission Required",
          text: "Please allow notifications so reminders can work.",
          });
        }
      });
    };
  /*DAILY NOTIFICATIONS*/
    useEffect(() => {
      if (!notifications || !notifTime) return;
      const now = new Date();
      const [hour, minute] = notifTime.split(":").map(Number);
      const scheduled = new Date();
      scheduled.setHours(hour, minute, 0, 0);
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);}
      const delay = scheduled.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        new Notification("Time to check in ❤️", {
          body: "Come back to Ataraxia and reflect on your emotions today.",
          icon: "/LogoLay.png",});
        const intervalId = setInterval(() => {
          new Notification("Time to check in ❤️", {
            body: "How are you feeling today?",
            icon: "/LogoLay.png",}); }, 24 * 60 * 60 * 1000);
        // Cleanup interval when notifications turned OFF
        return () => clearInterval(intervalId); }, delay);
      // Cleanup timeout when toggled or unmounted
      return () => clearTimeout(timeoutId); }, [notifications, notifTime]);
    /* NOTIFICATION TOGGLE HANDLER */
  useEffect(() => {
    if (notifications) {      // Ask for permission immediately
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("🔔 Notifications Enabled!", {
            body: "You’ll now receive daily reminders from Ataraxia ❤️",
            icon: "/LogoLay.png", });
        } else {
          Swal.fire("Please allow notifications in your browser to enable this feature.");
          setNotifications(false); // Reset the toggle if denied
        }
      });
    }
  }, [notifications]);
useEffect(() => { /*AI CHAT*/
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
const handleSend = async () => {
  if (!input.trim()) return;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userMessage = { sender: "user", text: input };

  setMessages(prev => [...prev, userMessage]);
  setInput("");

  try {
    setIsTyping(true);
    setMessages(prev => [...prev, { sender: "ataraxia", text: "Ataraxia is typing..." }]);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ollama`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        prompt: input,
        userId: user._id || "guest",
        sessionId,
      }),
    });
    const data = await res.json();
    const reply = data.reply || "⚠️ No response";
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "ataraxia", text: reply.slice(0, i) };
        return updated;
      });
      if (i >= reply.length) {
        clearInterval(interval);
      setIsTyping(false);
      saveChatToDatabase({
        user,
        sessionId,
        messages: [
          ...messages,
          userMessage,
          { sender: "ataraxia", text: reply },
        ]});
      }
    }, 35);
  } catch (err) {
    console.error(err);
  } finally {
    setIsTyping(false);
  }
};
const handleSelectChat = (chat) => {
  setCurrentChatId(chat._id);
  setSessionId(chat.sessionId);
  setMessages(
    (chat.messages || []).map(m => ({
      sender: m.role === "assistant" ? "ataraxia" : "user",
      text: m.content,
    }))
  );
};
const handleNewChat = () => {
  if (controllerRef.current) controllerRef.current.abort();
  const newSessionId = uuidv4();
  // Set active chat
  setSessionId(newSessionId);
  setCurrentChatId(newSessionId);
  setInput("");
  setIsTyping(true);
  // Add placeholder chat only if it doesn't already exist
  setChatSessions(prev => {
    if (prev.some(c => c.sessionId === newSessionId)) return prev;
    return [
      {
        _id: newSessionId,
        sessionId: newSessionId,
        messages: [],
        title: "New Chat",
        date: new Date().toISOString(),
      },
      ...prev
    ];
  });
  // Initialize first AI message
  setMessages([{ sender: "ataraxia", text: "" }]);
  // Show welcome message character by character
  const welcomeMessage =
    "Hello! I'm Ataraxia, your AI companion. I'm here to help you understand and express your emotions. Note that I won't be able to give you medical reasonings, only just about your mental health and what I think about it. So, how are you feeling today?";
  let i = 0;
  const interval = setInterval(() => {
    i++;
    setMessages(prev => {
      const updated = prev.length ? [...prev] : [{ sender: "ataraxia", text: "" }];
      updated[0] = { sender: "ataraxia", text: welcomeMessage.slice(0, i) };
      return updated;
    });
    if (i >= welcomeMessage.length) {
      clearInterval(interval);
      setIsTyping(false);
    }
  }, 35);
  console.log("⚠️ New chat created (placeholder only)");
};
const saveChatToDatabase = async ({ user, sessionId, messages }) => {
  if (!Array.isArray(messages) || messages.length === 0) return;
  try {
    const firstUserMessage = messages.find(m => m.sender === "user");
    const chatData = {
      userId: user?._id || "guest",
      sessionId,
      messages: messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      title: firstUserMessage
        ? firstUserMessage.text.slice(0, 30)
        : "New Chat",
      date: new Date().toISOString(),
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(chatData),
    });

    if (!res.ok) throw new Error("Failed to save chat");

    const saved = await res.json();
    const realId = saved.chat?._id || saved._id;

    setChatSessions(prev => {
      const idx = prev.findIndex(
        c => c.sessionId === sessionId || c._id === realId
      );

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...chatData, _id: realId };
        return updated;
      }

      return [{ ...chatData, _id: realId }, ...prev];
    });

    setCurrentChatId(realId);
  } catch (err) {
    console.error("❌ Save chat error:", err);
  }
};

  useEffect(() => { setIsTyping(true);   /*WELCOME MESSAGE AFTER LOGIN*/ 
    const welcome = 
    "Hello! I'm Ataraxia, your AI companion. I’m here to help you understand and express your emotions. Note that I won't be able to give you medical reasonings, only just about your mental health and what I think about it. So, how are you feeling today?";   
    let i = 0; 
    let currentText = ""; 
    setMessages([]);
    const interval = setInterval(() => {
      currentText += welcome[i]; i++; 
      setMessages((prev) => { const updated = [...prev]; updated[0] = { sender: "ataraxia", text: currentText }; return updated; }); 
      if (i >= welcome.length) {
        clearInterval(interval); 
        setIsTyping(false); 
        } 
      }, 
      35); 
      return () => clearInterval(interval); 
    }, []);
    const loadChatHistory = async (userId) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat?userId=${userId}`);
  const chats = await res.json();
  setChatSessions(chats);
};
const loadChat = async (chat) => {
  try {
    let msgs = [];

    if (chat._id) {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/single/${chat._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const text = await res.text();

      if (!res.headers.get("content-type")?.includes("application/json")) {
        console.error("❌ NON-JSON RESPONSE:", text);
        throw new Error("Server did not return JSON");
      }

      const data = JSON.parse(text);
      msgs = data.messages;
    } else {
      const key = `chats_${JSON.parse(localStorage.getItem("user"))?._id || "guest"}`;
      const stored = JSON.parse(localStorage.getItem(key)) || [];
      const found = stored.find(c => c.sessionId === chat.sessionId);
      msgs = found?.messages || [];
    }

    setMessages(
      msgs.map(m => ({
        sender: m.role === "user" ? "user" : "ataraxia",
        text: m.content || m.text,
      }))
    );

    setCurrentChatId(chat._id || chat.sessionId);
    setSessionId(chat.sessionId);
    setShowHistory(false);
  } catch (err) {
    console.error("❌ Load chat error:", err);
  }
};

    const handleSettings = () => {   /*SETTINGS*/
      setHandleSettings(true);
    };
    const closeSettings = () => {
      setHandleSettings(false);
    };
    const openHelp = () => {   /*HELP SETTINGS*/
      setShowAdjustments(false);
      setShowHelp(true);
    };
    const [showProfile, setShowProfile] = useState(false);   /*USER PROFILE BAR*/
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);   /*TAB SIDEBAR*/
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
const getJournalStorageKey = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.isGuest) return "journalEntries_guest";
  return `journalEntries_${user._id}`;
};
useEffect(() => { // ✅ Save to localStorage whenever journals change
  const storageKey = getJournalStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(journalEntries));
}, [journalEntries]);
useEffect(() => { // ✅ Load journals on mount
  const loadAndSyncJournals = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const storageKey = getJournalStorageKey();
    const localNotes = JSON.parse(localStorage.getItem(storageKey)) || [];
    const token = localStorage.getItem("token");
    if (user && !user.isGuest && localNotes.length > 0) {     // ✅ If logged in, sync local notes to backend
      for (const entry of localNotes) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/journal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`, // 👈 send token
            },
            body: JSON.stringify({
              title: entry.title,
              content: entry.content,
              userId: user._id,
            }),
          });
        } catch (err) {
          console.error("❌ Failed to sync note:", err);
        }
      }
      localStorage.removeItem(storageKey);      // Clear synced local notes to avoid duplicates
    }
    if (user && !user.isGuest) {     // ✅ Fetch journals from backend if logged in
      fetchJournals(user, storageKey, token);
    } else {
      setJournalEntries(localNotes);       // Guest mode: load from localStorage
    }
  };
  loadAndSyncJournals();
}, []);
const fetchJournals = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const storageKey = getJournalStorageKey();
  // Guest fallback
  if (!user || user.isGuest || !token) {
    const localNotes = JSON.parse(localStorage.getItem(storageKey)) || [];
    setJournalEntries(localNotes);
    return;
  }
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/journal`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });
    // 🔥 AUTH FAILURE — handle first
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please log in again to view your journals.",
      });
      setJournalEntries([]);
      return;
    }
    if (!res.ok) {
      throw new Error("Failed to load journals");
    }
    const data = await res.json();
    const sorted = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setJournalEntries(sorted);
    localStorage.setItem(storageKey, JSON.stringify(sorted));
    console.log("✅ Journals loaded:", sorted);
  } catch (err) {
    console.error("❌ Error fetching journals:", err);
  }
};
  const handleSaveJournal = async () => {   /*DROP DOWN HISTORY*/ // ✅ FIXED SAVE JOURNAL ENTRY
    if (!newEntryTitle.trim() || !newEntryText.trim())
      return Swal.fire("Please enter both title and content.");
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const token = localStorage.getItem("token");
    const storageKey = getJournalStorageKey();
    try {
      let updatedEntries = [...journalEntries];
      let savedEntry = null;
      if (user && !user.isGuest && token) {
        if (editIndex !== null) {           // ✅ EDIT EXISTING JOURNAL (PUT)
          const entryToEdit = journalEntries[editIndex];
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/journal/${entryToEdit._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              title: newEntryTitle,
              content: newEntryText,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            savedEntry = data;
            updatedEntries[editIndex] = savedEntry;
            Swal.fire("✅ Journal updated successfully!");
          } else {
            console.error("❌ Failed to update journal:", data.message);
            Swal.fire(data.message || "Failed to update journal.");
          }
        } else {           // ✅ ADD NEW JOURNAL (POST)
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/journal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              title: newEntryTitle,
              content: newEntryText,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            savedEntry = data;
            updatedEntries = [savedEntry, ...updatedEntries];
            Swal.fire("✅ Note saved and synced with server!");
          } else {
            console.error("❌ Failed to save journal:", data.message);
            Swal.fire(data.message || "Failed to save journal.");
          }
        }
      } else {         // ✅ LOCAL SAVE (guest)
        const newEntry = {
          title: newEntryTitle,
          content: newEntryText,
          date: new Date().toISOString(),
        };
        updatedEntries =
          editIndex !== null
            ? journalEntries.map((entry, i) => (i === editIndex ? newEntry : entry))
            : [newEntry, ...journalEntries];
        Swal.fire("✅ Note saved locally!");
      } 
      setJournalEntries(updatedEntries);       // ✅ Update local state and storage
      localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
      setNewEntryTitle("");       // ✅ Reset form
      setNewEntryText("");
      setEditIndex(null);
      setShowAddEntry(false);
    } catch (err) {
      console.error("❌ Error saving journal:", err);
      Swal.fire("Something went wrong while saving your note.");
    }
  };
  //FAVORITES IN JOURNAL ENTRIES
  const toggleFavorite = async (id) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const storageKey = `journalEntries_${user._id || user.email}`;
  // Load current entries
  let entries = JSON.parse(localStorage.getItem(storageKey)) || [];
  // Flip the favorite value
  entries = entries.map((entry) =>
    entry._id === id ? { ...entry, favorite: !entry.favorite } : entry
  );
  // Save locally
  localStorage.setItem(storageKey, JSON.stringify(entries));
  // Re-sort: favorites first, then newest
  entries.sort((a, b) => {
    if (a.favorite === b.favorite) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return b.favorite - a.favorite;
  });
  setJournalEntries(entries);
  // Update backend if logged in
  if (!user.isGuest) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/journal/${id}/favorite`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          favorite: entries.find((e) => e._id === id).favorite,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to update favorite:", err);
    }
  }
};
const fetchChats = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userId = user._id || "guest";

    if (!user.isGuest) {
      // 🟢 Safe fetch
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${userId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const text = await res.text();

      // Check if server returned HTML (starts with <!DOCTYPE or <html)
      if (text.trim().startsWith("<")) {
        console.error("❌ Server returned HTML instead of JSON:", text);
        throw new Error("Server returned non-JSON response. Check console for details.");
      }

      // Parse JSON safely
      const data = JSON.parse(text);

      setChatSessions(
        data.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } else {
      const key = `chats_${userId}`;
      const stored = JSON.parse(localStorage.getItem(key)) || [];
      setChatSessions(
        stored.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    }
  } catch (err) {
    console.error("❌ Failed to fetch chats:", err);
  }
};

  useEffect(() => {   // 🟢 2. Load chats on mount
    fetchChats();
  }, []);
  const startFreshChatWithWelcome = () => {   // 🗑️ 4. Delete chat safely (no cross-deletion)
  const newSession = uuidv4();
  setSessionId(newSession);
  setMessages([]);
  setIsTyping(true);
  const welcomeMessage =
    "Hello! I'm Ataraxia, your AI companion. I’m here to help you understand and express your emotions. Note that I won't be able to give you medical reasonings, only just about your mental health and what I think about it. So, how are you feeling today?";
  let i = 0;
  let currentText = "";
  const interval = setInterval(() => {
    currentText += welcomeMessage[i];
    i++;
    setMessages([{ sender: "ataraxia", text: currentText }]);
    if (i >= welcomeMessage.length) {
      clearInterval(interval);
      setIsTyping(false);
    }
  }, 35);
};

const handleDelete = async (chat) => {
  const mongoId =
  typeof chat._id === "string"
    ? chat._id
    : chat._id?.$oid || null;
  if (!chat) return;
  const confirmDelete = await Swal.fire({  // SweetAlert2 confirmation popup
    title: "Delete this chat?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel"
  });
  if (!confirmDelete.isConfirmed) return;
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const key = `chats_${user._id || "guest"}`;
  const chatIdentifier = chat._id || chat.sessionId; 
  if (sessionId === chat.sessionId) { // Reset UI if deleting the open chat
    startFreshChatWithWelcome();
    setCurrentChatId(null);
  }// 🔥 Remove from STATE
  setChatSessions(prev =>
    prev.filter(c => {
      const cIdentifier = c._id || c.sessionId;
      return cIdentifier !== chatIdentifier;
    })
  );
  const stored = JSON.parse(localStorage.getItem(key)) || []; // 🔥 Remove from localStorage
  const updatedLocal = stored.filter(c => {
    const cIdentifier = c._id || c.sessionId;
    return cIdentifier !== chatIdentifier;
  });
  localStorage.setItem(key, JSON.stringify(updatedLocal)); 
  if (!user.isGuest && mongoId) {// 🔥 If logged in → remove from DB
    try {
      console.log("Deleting MongoDB chat ID:", mongoId);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${mongoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete chat from DB");
      }
      console.log("🗑️ Deleted from MongoDB!");
    } catch (err) {
      console.error("❌ Failed DB delete:", err);
      return Swal.fire({
        icon: "warning",
        title: "Partially Deleted",
        text: "Chat removed locally but failed to delete from server."
      });
    }
  }// 🎉 Success alert (everything deleted)
  Swal.fire({
    icon: "success",
    title: "Deleted!",
    text: "Chat deleted successfully."
  });
}; //PROFILE PICTURE FUNCTION // LOAD PROFILE PICTURE ON MOUNT
useEffect(() => {
  const loadProfilePicture = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.isGuest) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${user._id}`, {
      headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
    });

    const data = await res.json();
    if (data.profilePicture) {
      setProfilePicture(data.profilePicture);
    }
  };

  loadProfilePicture();
}, []);

  const handleFileUpload = (e) => {  // HANDLE FILE UPLOAD
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result;
        setProfilePicture(imageData);
        saveProfilePicture(imageData);
        setShowPhotoModal(false);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Please upload a valid image file (PNG, JPG, JPEG)");
    }
  };
    const startCamera = async () => {
      try {
          // Show camera UI immediately
          setShowProfile(false);
          setShowPhotoModal(true);
          setShowCamera(true);
          setCapturedImage(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          console.log("STATE:", {
            showPhotoModal,
            showCamera,
            capturedImage
          });

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        Swal.fire("Camera permission denied. Please allow camera access.");
      }
    };
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;
    if (!video.videoWidth) return; // Prevents blank capture

    const MAX_WIDTH = 600;
    const scaleFactor = MAX_WIDTH / video.videoWidth;
    canvas.width = MAX_WIDTH;
    canvas.height = video.videoHeight * scaleFactor;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    setCapturedImage(dataUrl);

    stopCamera();
    setShowCamera(false);
    setShowPhotoModal(true);  // <-- missing before
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      saveProfilePicture(capturedImage);
      setCapturedImage(null);
      setShowPhotoModal(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPhotoModal(true);
    startCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    videoRef.current.srcObject = null;
    setShowCamera(false);
  };
  const saveProfilePicture = async (imageData) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    // ✅ Update UI immediately (RAM only)
    setProfilePicture(imageData);

    // ✅ NEVER store Base64 in localStorage
    const safeUser = { ...user };
    delete safeUser.profilePicture;
    localStorage.setItem("user", JSON.stringify(safeUser));

    // 🔐 Save to backend (logged-in users only)
    if (user && !user.isGuest) {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile-picture`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          userId: user._id,
          profilePicture: imageData, // Base64 ONLY goes to backend
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Profile picture saved to server");

        // ✅ Store ONLY a small reference (or nothing at all)
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...safeUser,
            profilePicture: "REMOTE", // or omit completely
          })
        );
      }
    }
  } catch (err) {
    console.error("❌ Error saving profile picture:", err);
  }
};
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.isGuest) {
        const savedMode = localStorage.getItem("darkMode");
        setDarkMode(savedMode === "true"); // string in localStorage
      } else {
        // For logged-in users, fetch from server
        const loadUserData = async () => {
          const token = localStorage.getItem("token");
          if (!token) return;
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${user._id}`, {
              headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true"},
            });
            if (res.ok) {
              const freshUserData = await res.json();
              // ✅ Extract large fields BEFORE saving
              const { profilePicture, ...safeUser } = freshUserData;
              // UI uses Base64
              if (profilePicture) {
                setProfilePicture(profilePicture);
              }
              // Small data only → localStorage
              setDarkMode(safeUser.darkMode);
              localStorage.setItem("user", JSON.stringify(safeUser));
            } else {
              setDarkMode(user.darkMode || false);
            }
          } catch (err) {
            console.error(err);
            setDarkMode(user.darkMode || false);
          }
        };
        loadUserData();
      }
    }, []);
    useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
    return (
      <div className={`chat-container ${isSidebarOpen ? "" : "collapsed"} ${darkMode ? "dark" : ""}`}>
        <i className={`fa-solid fa-columns sidebar-toggle-btn ${isSidebarOpen ? "open" : "closed"}`} onClick={toggleSidebar} />
          {isSidebarOpen && (
            <aside className="sidebar-ui">
              {!isHandleSettings ? ( <> <img src="/LogoLay.png" alt="Ataraxia" className="sidebar-logo" />
                  <div className="menu-buttons">
                    <button className="sidebar-btn" id="newChat" onClick={handleNewChat}> New Chat <i className="fa-solid fa-plus"></i></button>
                    <button className="sidebar-btn" id="history" onClick={() => setShowHistory(!showHistory)}> History <i className="fa-solid fa-chevron-down"></i></button>
                    {showNewChatDropdown && (
                      <div className="newchat-dropdown">
                        <h3>Active Chats</h3>
                        {newChats.length === 0 ? (
                          <p>No active chats yet.</p> 
                        ) : (
                          newChats.map((chat) => (
                          <div key={chat.id} className={`newchat-item ${sessionId === chat.id ? "active" : ""}`} onClick={() => 
                            {setSessionId(chat.id);
                            setMessages([{ sender: "ataraxia", text: "New conversation started!" }]);
                            setShowNewChatDropdown(false);
                            }} >
                            {chat.label}
                          </div>
                        ))
                      )}
                  </div>
                )}
                  {showHistory && (
                    <div className="history-dropdown">
                      <h3>Chat History</h3>
                      {chatSessions.length === 0 ? (
                        <p>No chats yet.</p>
                      ) : (
                          chatSessions.map(chat => (
                            <div
                              key={chat._id || chat.sessionId}
                              className={`chat-history-item ${
                                currentChatId === (chat._id || chat.sessionId) ? "active-chat" : ""
                              }`}
                              onClick={() => loadChat(chat)}
                            >
                              <strong>{chat.title || "New Chat"}</strong>
                              <p>{new Date(chat.date).toLocaleString()}</p>

                              <button
                                className="delete-chat-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(chat);
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <button className="sidebar-btn" id="settings" onClick={handleSettings}> Settings <i className="fa-solid fa-gear"></i></button>
                  </div></>
              ) : (<> {/* Settings Page */}
                  {isHandleSettings && !showHelp && (<>
                      <img src="/LogoLay.png" alt="Ataraxia" className="sidebar-logo" />
                      <i className="fa-solid fa-gear settings_icon"></i>
                      <h3 className="settings_title">Settings</h3>
                      <button className="settings-btn dropdown-btn" onClick={() => setShowAdjustments(!showAdjustments)}> Adjustments <i className={`fa-solid ${showAdjustments ? "fa-chevron-up" : "fa-chevron-down"}`}></i></button>
                      {showAdjustments && (
                        <ul className="settings-options dropdown-menu">
                          <li className="settings-row">
                            <span>Dark Mode</span>
                            <label className="switch">
                              <input type="checkbox" checked={darkMode} onChange={handleDarkModeToggle}/>
                              <span className="slider"></span>
                            </label>
                          </li>
                          <li className="settings-row">
                            <span>Notifications</span>
                            <label className="switch">
                              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)}/>
                              <span className="slider"></span>
                            </label>
                          </li>
                        </ul>
                      )}
                      <button className="settings-btn" onClick={() => setShowHelp(true)}>Help<i className="fa-solid fa-question settingsHelp"></i></button>
                      <i className="fa-solid fa-arrow-left back-btn" onClick={closeSettings}></i></>
                  )} {/* Full Help Screen */}
                  {isHandleSettings && showHelp && (
                    <div className="help-overlay" onClick={() => setShowHelp(false)}>
                      <div className="sidebar-help help-popup" onClick={(e) => e.stopPropagation()}>
                        <i className="fa-solid fa-xmark help-close" onClick={() => setShowHelp(false)}></i>
                        <img src="/LogoLay.png" alt="Ataraxia" className="sidebar-logo" />
                        <i className="fa-solid fa-question help-icon"></i>
                        <h3 className="settings_help_title">Help</h3>
                        <p className="help-text">
                          Ataraxia is a supportive space for expressing emotions. Use the system respectfully and honestly to better understand yourself, and take breaks when needed to maintain emotional balance.
                        </p>
                        <p className="help-text">
                          <strong>Note:</strong> No personal information is shared or transmitted online. For technical concerns, please contact the system administrator through the email provided.
                        </p>
                      </div>
                    </div>
                  )}</>
                )}
              </aside>
            )}
            <section className={`chat-ui ${showProfile ? "overlay-active" : ""}`}>{/* User Icon */}
              <div className={`user-icon ${darkMode ? "dark" : ""} ${showProfile ? "active" : ""}`} onClick={() => setShowProfile(!showProfile)}>
                <i className="fa-solid fa-user sidebar-toggle-btn"></i>
              </div> {/* Dim background overlay */}
              {showProfile && (
                <div className="overlay" onClick={() => setShowProfile(false)}></div>
              )} {/* Slide-in Profile Sidebar */}
              <div className={`profile-sidebar ${showProfile ? "open" : ""}`}>
                <div className="profile-header-bg">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="profile-img"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}/>
                      ) : (
                        <i className="fa-solid fa-user"></i>
                      )}
                      <i className="fa-solid fa-camera camera-icon" onClick={() => setShowPhotoModal(true)} style={{ cursor: "pointer" }}></i>
                    </div>  {/* ✅ Dynamically show username & email */}
                    {(() => {
                      const user = JSON.parse(localStorage.getItem("user")) || {};
                      const displayName = user.username || user.name || "Guest User";
                      const displayEmail = user.email || "guest@example.com";
                      return (
                        <>
                          <h3 className="username">{displayName}</h3>
                          <p className="user-email">{displayEmail}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="profile-btn" onClick={async () => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (!user || user.isGuest) {
                      Swal.fire("Only logged in users can use this.");
                      return;
                    }
                    const storageKey = `journalEntries_${user._id || user.email}`;
                    let entries = JSON.parse(localStorage.getItem(storageKey)) || [];
                    if (!user.isGuest) {
                      try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/journal`, {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "ngrok-skip-browser-warning": "true",
                          },
                        });
                      const data = await res.json();
                      if (res.ok && Array.isArray(data)) {// ADD favorite property (if missing), then sort favorites first
                        const entries = data
                          .map(e => ({ ...e, favorite: e.favorite ?? false })) // default value
                          .sort((a, b) => {
                            if (a.favorite === b.favorite) {
                              return new Date(b.createdAt) - new Date(a.createdAt); // newest first
                            }
                            return b.favorite - a.favorite; // favorites first
                          });
                        localStorage.setItem(storageKey, JSON.stringify(entries));
                        setJournalEntries(entries);
                      } else {
                        console.error("❌ Unexpected response:", data);
                      }
                      } catch (err) {
                        console.error("❌ Failed to fetch journals:", err);
                      }
                    } else {// For guest users, load from localStorage only
                      const saved = JSON.parse(localStorage.getItem(storageKey)) || [];
                      setJournalEntries(saved);
                    }
                      setShowJournal(true);
                  }}
                  >Journal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <i className="fa-solid fa-book-open"></i></button>
                  <button className="profile-btn" onClick={() => setShowContactUs(!showContactUs)}> Contact Us{" "}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    <i className={`fa-solid ${showContactUs ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                  </button>
                  {showContactUs && (
                    <ul className="contact-dropdown">
                      <li><p><strong>Email:</strong> user_01@gmail.com</p></li>
                      <li><p><strong>Facebook:</strong> user_01gmail.com</p></li>
                    </ul>
                  )}
                  <button className="logout-btn" onClick={() => setShowLogoutModal(true)}> Log Out <i className="fa-solid fa-right-from-bracket"></i></button>
                </div>
              </div> {/* ✅ CLOSE the sidebar properly */}
              {showLogoutModal && (
                <div className="logout-modal-overlay">
                  <div className="logout-modal">
                    <p>Are you sure you want to log out?</p>
                    <div className="logout-buttons">{/* ✅ YES — Logout */}
                      <button className="logout-yes" onClick={() => {localStorage.removeItem("token"); localStorage.removeItem("user"); setShowLogoutModal(false); window.location.href = "/login"; // ✅ Redirect to login page
                        Swal.fire("Log out successfully!");
                        }}> Yes </button> {/* ❌ NO — Cancel */}
                      <button className="logout-no" onClick={() => setShowLogoutModal(false)}>No</button>
                    </div>
                  </div>
                </div>
              )}{/* JOURNAL TAB */}
              {showJournal && (
                <div className="journal-overlay">
                  <div className="journal-modal">
                    <div className="journal-header">
                      <h2>My Journal</h2>
                      <span className="journal-date">{new Date().toLocaleDateString()}</span>
                      <button className="close-btn" onClick={() => setShowJournal(false)}><i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                    {showDeleteModal && (
                    <div className="modal-overlay">
                      <div className="modal-box">
                        <h3>Are you sure?</h3>
                        <p>This entry will be permanently deleted.</p>
                        <div className="modal-actions">
                          <button className="confirm-btn" onClick={() => {
                              const updated = journalEntries.filter((_, i) => i !== confirmDeleteIndex);
                              const user = JSON.parse(localStorage.getItem("user"));
                              const storageKey = user ? `journalEntries_${user._id || user.email}` : "journalEntries_guest";
                              localStorage.setItem(storageKey, JSON.stringify(updated));
                              setJournalEntries(updated);
                              setShowDeleteModal(false);
                              setSelectedEntry(null);
                              setConfirmDeleteIndex(null);
                            }}> Confirm </button>
                          <button className="cancel-btn" onClick={() => {setShowDeleteModal(false); setConfirmDeleteIndex(null);}}> Cancel </button>
                        </div>
                      </div>
                    </div>
                  )}{/* ✅ IF VIEWING SINGLE ENTRY */}
                    {selectedEntry !== null ? (
                      <div className="entry-view">
                        <h3>{journalEntries[selectedEntry].title}</h3>
                          <p className="entry-date">
                            <strong>Created on:</strong>{" "}
                            {new Date(
                              journalEntries[selectedEntry].createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",})}</p>
                        <hr />
                        <p>{journalEntries[selectedEntry].content}</p>
                        <div className="entry-actions">{/* ✏️ EDIT BUTTON */}
                        <button className="edit-btn" onClick={() => {
                            setEditIndex(selectedEntry);
                            setNewEntryTitle(journalEntries[selectedEntry].title);
                            setNewEntryText(journalEntries[selectedEntry].content);
                            setSelectedEntry(null);
                            setShowAddEntry(true);
                          }}> Edit </button> {/* 🗑️ DELETE BUTTON */}
                        <button className="delete-btn" onClick={async () => {
                            const confirmDelete = await Swal.fire({
                            title: "Delete this entry?",
                            text: "You won't be able to recover it!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#3085d6",
                            confirmButtonText: "Yes, delete it",
                          });
                          if (!confirmDelete.isConfirmed) return;
                            const entryToDelete = journalEntries[selectedEntry];
                            const token = localStorage.getItem("token");
                            const user = JSON.parse(localStorage.getItem("user"));
                            const storageKey = `journal_${user._id}`;
                            try {// ✅ DELETE request to backend
                              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/journal/${entryToDelete._id}`, {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  "ngrok-skip-browser-warning": "true",
                                },
                              });
                              const data = await res.json();
                              if (res.ok) {// ✅ Update frontend
                                const updatedEntries = journalEntries.filter((_, i) => i !== selectedEntry);
                                setJournalEntries(updatedEntries);
                                localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
                                setSelectedEntry(null);
                                  Swal.fire({
                                    icon: "success",
                                    title: "Deleted!",
                                    text: "Journal deleted successfully!",
                                  });
                                } else {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Failed",
                                    text: data.message || "Failed to delete journal.",
                                  });
                                }
                              } catch (err) {
                                console.error("❌ Error deleting journal:", err);
                                Swal.fire({
                                  icon: "error",
                                  title: "Error",
                                  text: "Something went wrong while deleting.",
                                });
                              }
                            }}> Delete </button>
                          <button className="back-btn" onClick={() => setSelectedEntry(null)}> <i className="fa-solid fa-arrow-left"></i></button>
                        </div>
                      </div>
                    ) : showAddEntry ? (// ✅ ADDING / EDITING ENTRY
                      <div className="add-entry">
                        <input
                          className="entry-title-input"
                          placeholder="Enter title..."
                          value={newEntryTitle}
                          onChange={(e) => setNewEntryTitle(e.target.value)}
                        />
                        <textarea
                          className="entry-textarea"
                          placeholder="What do you feel..."
                          value={newEntryText}
                          onChange={(e) => setNewEntryText(e.target.value)}
                        />
                        <div className="entry-actions">
                          <button className="save-btn" onClick={handleSaveJournal}> Save </button>
                          <button className="cancel-btn" onClick={() => {
                              setShowAddEntry(false);
                              setSelectedEntry(null);
                              setEditIndex(null);
                            }}> Cancel </button>
                        </div>
                      </div>
                    ) : (// ✅ ENTRY LIST
                      <div className="journal-content">
                        <div className="journal-grid">
                          {journalEntries.map((entry, idx) => (
                            <div key={idx} className="journal-card" onClick={() => {
                                setSelectedEntry(idx);
                              }}>
                            {/* ⭐ Favorite button */}
                            <button className="favorite-btn" onClick={(e) => {
                                e.stopPropagation(); // prevent opening the entry
                                toggleFavorite(entry._id);
                              }}
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                background: "none",
                                border: "none",
                                fontSize: "16px",
                                cursor: "pointer",
                                color: entry.favorite ? "gold" : "#ccc"
                              }}>
                              {entry.favorite ? "★" : "☆"}
                            </button>
                              <h3>{entry.title}</h3>
                              <hr />
                              <p>{entry.content.slice(0, 100)}...</p>
                              <p className="entry-date">
                                <strong>Created On:</strong> {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric", month: "long", day: "numeric", hour: "2-digit",minute: "2-digit",
                                    }): "Unknown"}
                              </p>
                              <p className="entry-date">
                                <strong>Updated On:</strong> {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString("en-US", {
                                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                                    }): "Unknown"}
                              </p>
                            </div>
                          ))}
                        </div>
                        <button className="add-entry-btn" onClick={() => {
                            setNewEntryTitle("");
                            setNewEntryText("");
                            setSelectedEntry(null);
                            setShowAddEntry(true);
                          }}>
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
          <div className="chat-scroll">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isWaiting && !isTyping && (
              <div className="chat-bubble ataraxia typing">Typing...</div>
            )}
            <div ref={chatEndRef}></div>
          </div>
          <div className="chat-input">
            <input
              className="input-field"
              placeholder="Write a text..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}> Send </button>
          </div>
                          {showPhotoModal && (
                        <div className="logout-modal-overlay">
                          <div className="logout-modal" style={{ width: showCamera || capturedImage ? "500px" : "auto" }}>
                            {/* Step 1: Menu */}
                            {!showCamera && !capturedImage ? (<>
                                <h3>Change Profile Picture</h3>
                                <div className="photo-options" style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                                  <button className="logout-yes" onClick={startCamera} style={{ padding: "12px 24px" }}>
                                    <i className="fa-solid fa-camera"></i> Take Photo
                                  </button>
                                  <button 
                                    className="logout-yes" 
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ padding: "12px 24px" }}
                                  >
                                    <i className="fa-solid fa-image"></i> Choose from Files
                                  </button>
                                  <button 
                                    className="logout-no" 
                                    onClick={() => setShowPhotoModal(false)}
                                    style={{ padding: "12px 24px" }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg"
                                  style={{ display: "none" }}
                                  onChange={handleFileUpload}
                                />
                              </>
                            ) : showCamera && !capturedImage ? (
                              /* Step 2: Camera View */
                              <>
                                <h3>Take a Photo</h3>
                                <div style={{ position: "relative", marginTop: "20px" }}>
                                  <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline
                                    style={{ 
                                      width: "100%", 
                                      maxWidth: "450px", 
                                      borderRadius: "8px",
                                      transform: "scaleX(-1)"
                                    }}
                                  />
                                  <canvas ref={canvasRef} style={{ display: "none" }} />
                                </div>
                                <div className="logout-buttons" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                  <button 
                                    className="logout-yes" 
                                    onClick={capturePhoto}
                                    style={{ padding: "12px 24px", flex: 1 }}
                                  >
                                    <i className="fa-solid fa-camera"></i> Capture
                                  </button>
                                  <button 
                                    className="logout-no" 
                                    onClick={() => {
                                      stopCamera();
                                      setShowPhotoModal(false);
                                    }}
                                    style={{ padding: "12px 24px", flex: 1 }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              /* Step 3: Review */
                              <>
                                <h3>Review Photo</h3>
                                <div style={{ position: "relative", marginTop: "20px" }}>
                                  <img 
                                    src={capturedImage}
                                    alt="Captured"
                                    style={{ 
                                      width: "100%", 
                                      maxWidth: "450px", 
                                      borderRadius: "8px"
                                    }}
                                  />
                                </div>
                                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                  <button 
                                    className="logout-no" 
                                    onClick={retakePhoto}
                                    style={{ padding: "12px 24px", flex: 1 }}
                                  >
                                    <i className="fa-solid fa-rotate-left"></i> Retake
                                  </button>
                                  <button 
                                    className="logout-yes" 
                                    onClick={confirmPhoto}
                                    style={{ padding: "12px 24px", flex: 1 }}
                                  >
                                    <i className="fa-solid fa-check"></i> Use This Photo
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
        </section>
      </div>
    );
  }
export default Chat;