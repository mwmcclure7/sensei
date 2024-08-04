import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import "../styles/Chat.css";
import { marked } from "marked";

interface Message {
    user_message: string;
    bot_message: string;
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
    const [currentChat, setCurrentChat] = useState(0);

    useEffect(() => {
        getChats();
    }, []);

    const getChats = () => {
        api.get("/api/chats/")
            .then((res) => res.data)
            .then((data) => setChats(data))
            .catch((err) => alert(err));
    };

    const disableChat = async(id: any) => {
        if (id === currentChat) setCurrentChat(0);
        await api.post("/api/disable-chat/", { id }).catch((err) => alert(err));
        getChats();
        getMessages();
    };

    const createChat = (e: any) => {
        e.preventDefault();
        if (!title) return;
        setCreateLoading(true);
        const tempTitle = title;
        setTitle("");
        api.post("/api/chats/", { title: tempTitle }).catch((err) =>
            alert(err)
        ).then((res) => {
            if (res && res.data) {
                setCurrentChat(res.data.id);
            }
        })
        .catch((err) => {
            alert(err);
        });
        getChats();
        setCreateLoading(false);
    };

    // Messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentInputDisplay, setCurrentInputDisplay] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault();

        if (!input || currentChat === 0) return;
        setCurrentInputDisplay(input);
        const currentInput = input;
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setInput("");
        api.post("/api/messages/", {
            chat_id: currentChat,
            message: currentInput,
        })
            .then(() => {
                getMessages();
                setLoading(false);
            })
            .catch((err) => {
                alert("An error occurred. Please try refreshing your page.\n\nIf the problem persists, contact support@softwaresensei.ai.\n\nError details: " + err);
                setLoading(false);
            });
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

    const getMessages = async () => {
        if (!currentChat) return;
            try {
                const res = await api.get("/api/messages/", { params: { chat_id: currentChat } });
                const updatedMessages = await Promise.all(res.data.map(async (msg: any) => {
                    const botMessage = await marked(msg.bot_content);
                    return {
                        user_message: msg.user_content,
                        bot_message: botMessage.trim(),
                    };
                }));
                setMessages(updatedMessages);
            } catch (err) {
                if ((err as any).status !== 404) alert(err);
            }
        };

    useEffect(() => {
        getMessages();
    }, [currentChat]);

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
                    <div
                        key={chat.id}
                        className={`chat-item${
                            chat.id === currentChat ? "-active" : ""
                        }`}
                    >
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
            {!currentChat ? (
                <div className="no-chat-selected">
                    <p>Select a chat or create a new one.</p>
                </div>
            ) : (
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
                                <p className="user-history">
                                    {msg.user_message}
                                </p>
                                <p className="bot-history" dangerouslySetInnerHTML={{__html: msg.bot_message}} />
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
            )}
        </div>
    );
}

export default Chat;
