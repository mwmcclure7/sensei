import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api';
import '../styles/CourseCreation.css';

interface Message {
    content: string;
    is_user: boolean;
    timestamp?: Date;
}

// Define conversation stages to track progress
type ConversationStage = 
    | 'initial'           // Initial greeting
    | 'gathering_info'    // Gathering basic information
    | 'refining'          // Refining course details
    | 'finalizing'        // Finalizing before generation
    | 'generating'        // Course is being generated
    | 'complete';         // Course has been created

const CourseCreation: React.FC = () => {
    // Basic state
    const [messages, setMessages] = useState<Message[]>([{
        content: "Hi! I'm your AI course designer. Tell me what you'd like to learn, and if you have any specific projects in mind. I'll help create a personalized learning path for you!",
        is_user: false,
        timestamp: new Date()
    }]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Advanced state for better UX
    const [conversationStage, setConversationStage] = useState<ConversationStage>('initial');
    const [isThinking, setIsThinking] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [courseGenerationProgress, setCourseGenerationProgress] = useState(0);
    
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Code syntax highlighting configuration
    const markdownComponents = {
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

    // Auto-adjust textarea height
    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    // Scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Determine conversation stage based on message content and count
    useEffect(() => {
        if (messages.length <= 2) {
            setConversationStage('initial');
        } else if (messages.length <= 5) {
            setConversationStage('gathering_info');
        } else if (messages.length <= 8) {
            setConversationStage('refining');
        } else {
            setConversationStage('finalizing');
        }
    }, [messages]);

    // Simulate progress when generating a course
    useEffect(() => {
        if (conversationStage === 'generating' && courseGenerationProgress < 100) {
            const timer = setTimeout(() => {
                setCourseGenerationProgress(prev => Math.min(prev + 5, 95));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [conversationStage, courseGenerationProgress]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!input.trim() || isGenerating) return;

        const userMessage = input;
        const newMessages = [
            ...messages,
            { content: userMessage, is_user: true, timestamp: new Date() }
        ];
        setMessages(newMessages);
        setInput('');
        setErrorMessage(null);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            setIsGenerating(true);
            setIsThinking(true);
            
            // Convert messages to the format expected by the backend
            const messageHistory = newMessages.map(msg => ({
                content: msg.content,
                is_user: msg.is_user
            }));

            // Send the message to the conversation endpoint
            const response = await api.post('/api/courses/', {
                user_content: userMessage,
                messages: messageHistory.slice(0, -1), // Exclude the latest user message as it's sent separately
                action: 'conversation'
            });
            
            console.log('API response:', response.data);
            
            // Add the AI response to the messages
            const updatedMessages = [
                ...newMessages,
                { 
                    content: response.data.response, 
                    is_user: false,
                    timestamp: new Date()
                }
            ];
            setMessages(updatedMessages);
            
            // If the AI decides it's time to generate a course
            if (response.data.should_generate && response.data.course) {
                setConversationStage('generating');
                setCourseGenerationProgress(30); // Start progress at 30%
                
                // Simulate completion and navigate
                setTimeout(() => {
                    setCourseGenerationProgress(100);
                    setTimeout(() => {
                        navigate(`/courses/${response.data.course.id}`);
                    }, 1000);
                }, 3000);
            }
            
            setIsGenerating(false);
        } catch (error) {
            console.error('Error in conversation:', error);
            
            // More detailed error handling
            let errorMsg = 'Sorry, there was an error processing your request. Please try again.';
            if (error instanceof Error) {
                if ('response' in (error as any) && (error as any).response?.data?.error) {
                    errorMsg = `Error: ${(error as any).response.data.error}`;
                } else {
                    errorMsg = `Error: ${error.message}`;
                }
            }
            
            setErrorMessage(errorMsg);
            setMessages([
                ...newMessages,
                {
                    content: errorMsg,
                    is_user: false,
                    timestamp: new Date()
                }
            ]);
            setIsGenerating(false);
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Allow user to retry after an error
    const handleRetry = () => {
        if (messages.length >= 2) {
            // Remove the error message and the last user message
            setMessages(messages.slice(0, -2));
            setErrorMessage(null);
        }
    };

    return (
        <div className="course-creation-container">
            {/* Progress indicator */}
            <div className="conversation-progress">
                <div className="progress-stages">
                    <div className={`progress-stage ${
                        conversationStage === 'initial' ? 'active' : 
                        (conversationStage === 'gathering_info' || 
                         conversationStage === 'refining' || 
                         conversationStage === 'finalizing' || 
                         conversationStage === 'generating' || 
                         conversationStage === 'complete') ? 'completed' : ''
                    }`}>
                        <div className="stage-dot"></div>
                        <span>Start</span>
                    </div>
                    <div className={`progress-stage ${
                        conversationStage === 'gathering_info' ? 'active' : 
                        (conversationStage === 'refining' || 
                         conversationStage === 'finalizing' || 
                         conversationStage === 'generating' || 
                         conversationStage === 'complete') ? 'completed' : ''
                    }`}>
                        <div className="stage-dot"></div>
                        <span>Information</span>
                    </div>
                    <div className={`progress-stage ${
                        conversationStage === 'refining' ? 'active' : 
                        (conversationStage === 'finalizing' || 
                         conversationStage === 'generating' || 
                         conversationStage === 'complete') ? 'completed' : ''
                    }`}>
                        <div className="stage-dot"></div>
                        <span>Refining</span>
                    </div>
                    <div className={`progress-stage ${
                        conversationStage === 'finalizing' ? 'active' : 
                        (conversationStage === 'generating' || 
                         conversationStage === 'complete') ? 'completed' : ''
                    }`}>
                        <div className="stage-dot"></div>
                        <span>Finalizing</span>
                    </div>
                    <div className={`progress-stage ${
                        conversationStage === 'generating' || conversationStage === 'complete' ? 'active' : ''
                    }`}>
                        <div className="stage-dot"></div>
                        <span>Course Creation</span>
                    </div>
                </div>
                <div className="progress-line">
                    <div className="progress-line-filled" style={{
                        width: conversationStage === 'initial' ? '10%' :
                               conversationStage === 'gathering_info' ? '30%' :
                               conversationStage === 'refining' ? '50%' :
                               conversationStage === 'finalizing' ? '70%' :
                               conversationStage === 'generating' ? `${70 + (courseGenerationProgress * 0.3)}%` : '100%'
                    }}></div>
                </div>
            </div>

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.is_user ? 'user-message' : 'bot-message'}`}
                    >
                        <div className="message-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                // @ts-ignore
                                components={markdownComponents}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        {message.timestamp && (
                            <div className="message-timestamp">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                ))}
                {isThinking && (
                    <div className="message bot-message">
                        <div className="message-content typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                {conversationStage === 'generating' && (
                    <div className="message bot-message">
                        <div className="message-content">
                            <p>Creating your personalized course...</p>
                            <div className="generation-progress-container">
                                <div 
                                    className="generation-progress-bar" 
                                    style={{ width: `${courseGenerationProgress}%` }}
                                ></div>
                            </div>
                            <p className="generation-progress-text">{courseGenerationProgress}% complete</p>
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <div className="error-actions">
                        <button onClick={handleRetry} className="retry-button">
                            Try Again
                        </button>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="input-container">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={adjustHeight}
                    placeholder={conversationStage === 'initial' ? "Tell me what you'd like to learn..." : 
                                 conversationStage === 'gathering_info' ? "Share more details about your goals..." :
                                 conversationStage === 'refining' ? "Any specific preferences or requirements?" :
                                 "Any final details before I create your course?"}
                    disabled={isGenerating || conversationStage === 'generating'}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={isGenerating || !input.trim() || conversationStage === 'generating'}
                    className={isGenerating ? 'loading' : ''}
                >
                    {isGenerating ? 'Thinking...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default CourseCreation;
