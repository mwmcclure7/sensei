import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api';
import '../styles/CourseCreation.css';

interface Message {
    content: string;
    is_user: boolean;
}

const CourseCreation: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([{
        content: "Hi! I'm your AI course designer. Tell me what you'd like to learn, and if you have any specific projects in mind. I'll help create a personalized learning path for you!",
        is_user: false
    }]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [
            ...messages,
            { content: input, is_user: true }
        ];
        setMessages(newMessages);
        setInput('');

        try {
            setIsGenerating(true);
            // Convert messages to the format expected by the backend
            const messageHistory = messages.map(msg => ({
                content: msg.content,
                is_user: msg.is_user
            }));

            const response = await api.post('/api/courses/', {
                user_content: input,
                messages: messageHistory,
                action: 'generate'
            });
            
            // Navigate to the new course page
            navigate(`/courses/${response.data.id}`);
        } catch (error) {
            console.error('Error generating course:', error);
            setMessages([
                ...newMessages,
                {
                    content: 'Sorry, there was an error generating your course. Please try again.',
                    is_user: false
                }
            ]);
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="course-creation-container">
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.is_user ? 'user-message' : 'bot-message'}`}
                    >
                        <div className="message-content">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="input-container">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tell me what you'd like to learn..."
                    disabled={isGenerating}
                />
                <button
                    onClick={handleSend}
                    disabled={isGenerating || !input.trim()}
                    className={isGenerating ? 'loading' : ''}
                >
                    {isGenerating ? 'Generating...' : 'Create Course'}
                </button>
            </div>
        </div>
    );
};

export default CourseCreation;
