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
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    var tempInput = "";
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault();

        try {
            tempInput = input;
            if (textareaRef.current) textareaRef.current.style.height = "auto";
            setInput("");
            const response = await api.post("/api/chat/", {
                message: tempInput,
            });
            setMessages([
                ...messages,
                { user: tempInput, bot: response.data.message },
            ]);
            console.log(response.data);
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>);
        }
    }

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
        <div className="chat-window">
            <div className="messages" style={{ marginBottom: `${(textareaRef.current?.clientHeight ?? 0) + 50}px` }}>
                {messages.map((msg, index) => (
                    <div key={index} className="message-container">
                        <p className="user-history">{msg.user}</p>
                        <p className="bot-history">{msg.bot}</p>
                    </div>
                ))}
                {loading && (
                    <div className="message-container">
                        <p className="user-history">{tempInput}</p>
                        <img src="" alt="" />
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
    );
}

export default Chat;
