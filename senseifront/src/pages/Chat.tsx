import React, { useEffect, useState, useRef } from "react";
import api, { streamRequest } from "../api";
import toast from "react-hot-toast";
import "../styles/Chat.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Spinner from "../components/Spinner";

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
    const [currentChat, setCurrentChat] = useState(0);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        getChats();
    }, []);

    const getChats = () => {
        setChatLoading(true);
        api.get("/api/chats/")
            .then((res) => res.data)
            .then((data) => setChats(data))
            .then(() => setChatLoading(false))
            .catch((err) => console.log(err));
    };

    const disableChat = async (id: any) => {
        setChatLoading(true);
        if (id === currentChat) setCurrentChat(0);
        await api
            .post("/api/disable-chat/", { id })
            .catch((err) => console.log(err));
        getChats();
        setChatLoading(false);
    };

    // Messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentInputDisplay, setCurrentInputDisplay] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [forceUpdate] = useState(0);

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!input || loading) return;
        e.preventDefault();
        setLoading(true);
        var currentTempChat = currentChat;

        // Add user message immediately
        const userMessage = input;
        setCurrentInputDisplay(userMessage);
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            // Add temporary message for streaming
            const messageIndex = messages.length;
            setMessages((prev) => [...prev, { user_message: userMessage, bot_message: "" }]);

            const response = await streamRequest("/api/messages/", {
                message: userMessage,
                chat_id: currentTempChat,
                fun_mode: funMode,
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No reader available");
            }

            let accumulatedResponse = "";
            let chatIdFromStream = null;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const content = line.slice(6);
                        if (content === "[DONE]") {
                            continue;
                        }
                        
                        // Check if this is a chat_id response
                        if (content.includes("chat_id")) {
                            try {
                                const chatData = JSON.parse(content);
                                if (chatData.chat_id) {
                                    chatIdFromStream = chatData.chat_id;
                                    if (currentTempChat === 0) {
                                        setCurrentChat(chatIdFromStream);
                                        getChats();
                                    }
                                }
                            } catch (e) {
                                // Not valid JSON, treat as regular content
                                accumulatedResponse += content;
                                // Update the message at the specific index
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    if (messageIndex < newMessages.length) {
                                        newMessages[messageIndex].bot_message = accumulatedResponse;
                                    }
                                    return newMessages;
                                });
                            }
                        } else {
                            accumulatedResponse += content;
                            // Update the message at the specific index
                            setMessages((prev) => {
                                const newMessages = [...prev];
                                if (messageIndex < newMessages.length) {
                                    newMessages[messageIndex].bot_message = accumulatedResponse;
                                }
                                return newMessages;
                            });
                        }
                    }
                }
            }

            // Only fetch messages if we have a valid chat ID
            const finalChatId = chatIdFromStream || currentTempChat;
            if (finalChatId && finalChatId !== 0) {
                try {
                    const finalMessageResponse = await api.get("/api/messages/", {
                        params: { chat_id: finalChatId },
                    });

                    const finalMessages = finalMessageResponse.data.map((msg: any) => ({
                        user_message: msg.user_content,
                        bot_message: msg.bot_content,
                    }));

                    // Update only the last message
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        if (messageIndex < finalMessages.length) {
                            newMessages[messageIndex] = finalMessages[messageIndex];
                        }
                        return newMessages;
                    });
                } catch (err) {
                    console.log("Error fetching final messages:", err);
                    // Keep the streamed message if we can't fetch the final one
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setLoading(false);
            setCurrentInputDisplay("");
        }
    };

    const getMessages = async () => {
        if (!currentChat) {
            setMessages([]);
            return;
        }
        setMessagesLoading(true);
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
            console.log("Error fetching messages:", err);
            setMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    useEffect(() => {
        getMessages();
    }, [currentChat]);

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

    // Fun Mode
    const [funMode, setFunMode] = useState(false);

    function toggleFunMode() {
        if (!funMode) {
            setFunMode(true);
            toast("Fun mode on!", {
                icon: "🎉",
                style: { background: "purple", color: "white" },
                duration: 2000,
            });
        } else {
            setFunMode(false);
            toast("Fun mode off", { duration: 2000 });
        }
    }

    // Sidebar Collapse
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="chatbot-page">
            <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
                <button
                    className={`sidebar-toggle ${
                        isSidebarCollapsed ? "collapsed" : ""
                    }`}
                    onClick={toggleSidebar}
                >
                    ⇥
                </button>
                <div className="fun-mode-switch">
                    <p>Fun Mode</p>
                    <input
                        type="checkbox"
                        id="funModeSwitch"
                        checked={funMode}
                        onChange={toggleFunMode}
                    />
                    <label htmlFor="funModeSwitch"></label>
                </div>
                <button
                    className={`create-chat${!currentChat ? "-active" : ""}`}
                    onClick={() => setCurrentChat(0)}
                >
                    New Chat
                </button>
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
                {chatLoading && (
                    <Spinner />
                )}
            </div>
            <div
                className={`chat-container${
                    isSidebarCollapsed ? " collapsed" : ""
                }`}
            >
                <div className="chat-window">
                    {messagesLoading ? (
                        <Spinner />
                    ) : (
                        <div
                            className="messages"
                            style={{
                                marginBottom: `${
                                    (textareaRef.current?.clientHeight ?? 0) +
                                    50
                                }px`,
                            }}
                        >
                            {messages.map((msg, index) => (
                                <div key={`${index}-${forceUpdate}`} className="message-container">
                                    <p
                                        className={
                                            funMode
                                                ? "fun-user-history"
                                                : "user-history"
                                        }
                                    >
                                        {msg.user_message}
                                    </p>
                                    <ReactMarkdown
                                        key={`${index}-${forceUpdate}`}
                                        remarkPlugins={[remarkGfm]}
                                        // @ts-ignore mostly harmless
                                        components={renderers}
                                        className="bot-history"
                                    >
                                        {msg.bot_message}
                                    </ReactMarkdown>
                                </div>
                            ))}
                            {loading && !messages.find(msg => msg.user_message === currentInputDisplay) && (
                                <div className="message-container">
                                    <p
                                        className={
                                            funMode
                                                ? "fun-user-history"
                                                : "user-history"
                                        }
                                    >
                                        {currentInputDisplay}
                                    </p>
                                    <Spinner />
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
            </div>
        </div>
    );
}

export default Chat;
