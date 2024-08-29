import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import "../styles/Chat.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    // Syntax Highlighting
    const renderers = {
        code({
            node,
            inline,
            className,
            children,
            ...props
        }: {
            node: any;
            inline: boolean;
            className: string;
            children: React.ReactNode;
            props: any;
        }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <SyntaxHighlighter
                    style={coldarkDark}
                    language={match[1]}
                    PreTag="div"
                    className="custom-code-block"
                    {...props}
                >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };

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

    const disableChat = async (id: any) => {
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
        api.post("/api/chats/", { title: tempTitle })
            .catch((err) => alert(err))
            .then((res) => {
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
    const [messagesLoading, setMessagesLoading] = useState(false);

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!input || !currentChat || loading) return;
        setLoading(true);
        e.preventDefault();

        setCurrentInputDisplay(input);
        const currentInput = input;
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setInput("");
        api.post("/api/messages/", {
            chat_id: currentChat,
            message: currentInput,
        })
            .then((res) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        user_message: currentInput,
                        bot_message: res.data.message,
                    },
                ]);
                setLoading(false);
            })
            .catch((err) => {
                if (err.response.status === 401) {
                    window.dispatchEvent(new CustomEvent("auth"));
                    setTimeout(() => {
                        api.post("/api/messages/", {
                            chat_id: currentChat,
                            message: currentInput,
                        })
                            .then(() => {
                                getMessages();
                                setLoading(false);
                            })
                            .catch((err) => {
                                alert(
                                    "An error occurred. Please try refreshing your page.\n\nIf the problem persists, contact support@softwaresensei.ai.\n\nError details: " +
                                        err
                                );
                                setLoading(false);
                            });
                    }, 1000);
                } else {
                    alert(
                        "An error occurred. Please try refreshing your page.\n\nIf the problem persists, contact support@softwaresensei.ai.\n\nError details: " +
                            err
                    );
                    setLoading(false);
                }
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
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const getMessages = async () => {
        setMessagesLoading(true);
        if (!currentChat) return;
        try {
            const res = await api.get("/api/messages/", {
                params: { chat_id: currentChat },
            });
            const updatedMessages = await Promise.all(
                res.data.map(async (msg: any) => {
                    return {
                        user_message: msg.user_content,
                        bot_message: msg.bot_content,
                    };
                })
            );
            setMessages(updatedMessages);
        } catch (err) {
            if ((err as any).status !== 404) alert(err);
        } finally {
            setMessagesLoading(false);
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
                    {messagesLoading ? (
                        <div className="spinner">
                            <div>
                                <div />
                            </div>
                        </div>
                    ) : (
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
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        // @ts-ignore: everything is probably fine...
                                        components={renderers}
                                        className="bot-history"
                                    >
                                        {msg.bot_message}
                                    </ReactMarkdown>
                                </div>
                            ))}
                            {loading && (
                                <div className="message-container">
                                    <p className="user-history">
                                        {currentInputDisplay}
                                    </p>
                                    <div className="small-spinner">
                                        <div>
                                            <div />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                    <form className="chat-form" onSubmit={sendMessage}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            placeholder="Type a message..."
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
