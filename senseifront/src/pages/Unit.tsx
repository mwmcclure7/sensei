import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import '../styles/Unit.css';

interface Unit {
    id: number;
    title: string;
    description: string;
    content: string;
    order: number;
    is_completed: boolean;
}

interface Course {
    id: number;
    title: string;
    units: Unit[];
}

const Unit: React.FC = () => {
    const { courseId, unitId } = useParams<{ courseId: string; unitId: string }>();
    const [unit, setUnit] = useState<Unit | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [courseId, unitId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch course data to get all units
            const courseResponse = await axios.get(`/api/courses/${courseId}/`);
            setCourse(courseResponse.data);
            
            // Fetch unit content
            const unitResponse = await axios.get(`/api/units/${unitId}/content/`);
            setUnit({
                ...courseResponse.data.units.find((u: Unit) => u.id === parseInt(unitId!)),
                content: unitResponse.data.content
            });
            
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching unit:', error);
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        try {
            await axios.post(`/api/courses/${courseId}/complete_unit/`, {
                unit_order: unit?.order
            });
            
            // Find the next unit
            if (course && unit) {
                const currentIndex = course.units.findIndex(u => u.id === unit.id);
                if (currentIndex < course.units.length - 1) {
                    // Navigate to next unit
                    navigate(`/courses/${courseId}/units/${course.units[currentIndex + 1].id}`);
                } else {
                    // Show completion screen
                    navigate(`/courses/${courseId}/complete`);
                }
            }
        } catch (error) {
            console.error('Error completing unit:', error);
        }
    };

    if (isLoading || !unit || !course) {
        return (
            <div className="unit-loading">
                <div className="loading-spinner" />
                <p>Loading unit content...</p>
            </div>
        );
    }

    const currentIndex = course.units.findIndex(u => u.id === unit.id);
    const previousUnit = currentIndex > 0 ? course.units[currentIndex - 1] : null;
    const nextUnit = currentIndex < course.units.length - 1 ? course.units[currentIndex + 1] : null;

    return (
        <div className="unit-container">
            <aside className="unit-sidebar">
                <h3>Course Progress</h3>
                <div className="progress-indicator">
                    {course.units.map((u, index) => (
                        <div 
                            key={u.id}
                            className={`progress-dot ${u.is_completed ? 'completed' : ''} ${u.id === unit.id ? 'current' : ''}`}
                            onClick={() => navigate(`/courses/${courseId}/units/${u.id}`)}
                        >
                            <span className="dot-number">{index + 1}</span>
                            <span className="dot-title">{u.title}</span>
                        </div>
                    ))}
                </div>
            </aside>
            
            <main className="unit-content">
                <div className="unit-header">
                    <h1>{unit.title}</h1>
                    <div className="unit-navigation">
                        {previousUnit && (
                            <button 
                                className="nav-button previous"
                                onClick={() => navigate(`/courses/${courseId}/units/${previousUnit.id}`)}
                            >
                                ← Previous Unit
                            </button>
                        )}
                        <button 
                            className="complete-button"
                            onClick={handleComplete}
                            disabled={unit.is_completed}
                        >
                            {unit.is_completed ? 'Completed' : 'Complete & Continue'}
                        </button>
                        {nextUnit && (
                            <button 
                                className="nav-button next"
                                onClick={() => navigate(`/courses/${courseId}/units/${nextUnit.id}`)}
                            >
                                Next Unit →
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="unit-description">
                    <p>{unit.description}</p>
                </div>
                
                <div className="unit-lesson">
                    <ReactMarkdown>{unit.content}</ReactMarkdown>
                </div>
            </main>
        </div>
    );
};

export default Unit;
