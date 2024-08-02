import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import "../styles/Chat.css";

interface Message {
    user: string;
    bot: string;
}

function adjustHeight() {
    const textarea = document.querySelector("textarea");
    if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
}

function Chat() {
    // Chats
    const [chats, setChats] = useState([]);
    const [title, setTitle] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        getChats();
    }, []);

    const getChats = () => {
        api.get("/api/chats/")
            .then((res) => res.data)
            .then((data) => setChats(data))
            .catch((err) => alert(err));
    };

    const disableChat = (id: any) => {
        api.post("/api/disable-chat/", { id }).catch((err) => alert(err));
        getChats();
    };

    const createChat = (e: any) => {
        e.preventDefault();
        if (!title) return;
        setCreateLoading(true);
        const tempTitle = title;
        setTitle("");
        api.post("/api/chats/", { title: tempTitle })
            .catch((err) => alert(err));
        getChats();
        setCreateLoading(false);
    };

    // Messages
    const [currentChat, setCurrentChat] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentInputDisplay, setCurrentInputDisplay] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!input) return;
            setCurrentInputDisplay(input);
            const currentInput = input;
            if (textareaRef.current) textareaRef.current.style.height = "auto";
            setInput("");
            const response = await api.post("/api/test/", {
                message: currentInput,
            });
            setMessages([
                ...messages,
                { user: currentInput, bot: response.data.message },
            ]);
            console.log(response.data);
        } catch (error) {
            if ((error as any).status === 401) window.location.reload(); // TODO: maybe this works?
            else alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(
                new Event(
                    "submit"
                ) as unknown as React.FormEvent<HTMLFormElement>
            );
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="chatbot-page">
            <div className="sidebar">
                <form className="create-chat-form" onSubmit={createChat}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter new chat title"
                    />
                    <button
                        className={
                            createLoading
                                ? "create-button-loading"
                                : "create-button"
                        }
                        onClick={createChat}
                        disabled={!title}
                    >
                        +
                    </button>
                </form>
                <hr />
                {chats.map((chat: any) => (
                    <div key={chat.id} className="chat-item">
                        <button
                            className="chat-label"
                            onClick={() => setCurrentChat(chat.id)}
                        >
                            {chat.title}
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => disableChat(chat.id)}
                        />
                    </div>
                ))}
            </div>
            <div className="chat-window">
                <div
                    className="messages"
                    style={{
                        marginBottom: `${
                            (textareaRef.current?.clientHeight ?? 0) + 50
                        }px`,
                    }}
                >
                    {messages.map((msg, index) => (
                        <div key={index} className="message-container">
                            <p className="user-history">{msg.user}</p>
                            <p className="bot-history">{msg.bot}</p>
                        </div>
                    ))}
                    {loading && (
                        <div className="message-container">
                            <p className="user-history">
                                {currentInputDisplay}
                            </p>
                            <p className="loading-response">Hmmm . . .</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-form" onSubmit={sendMessage}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onInput={adjustHeight}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className={loading ? "loading" : ""}
                        type="submit"
                        disabled={loading || !input}
                    />
                </form>
            </div>
        </div>
    );
}

export default Chat;
