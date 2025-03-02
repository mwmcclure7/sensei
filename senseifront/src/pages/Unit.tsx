import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import '../styles/Unit.css';
import api from '../api';
import CourseSidebar from '../components/CourseSidebar';

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
            const courseResponse = await api.get(`/api/courses/${courseId}/`);
            console.log('Course response:', courseResponse.data);
            
            // Check if course data has the expected structure
            if (!courseResponse.data || !courseResponse.data.units || !Array.isArray(courseResponse.data.units)) {
                console.error('Course data is missing units array:', courseResponse.data);
                throw new Error('Course data is not in the expected format');
            }
            
            setCourse(courseResponse.data);
            
            // Fetch unit content
            const unitResponse = await api.get(`/api/units/${unitId}/content/`);
            console.log('Unit content response:', unitResponse.data);
            
            // Find the unit in the course data
            const foundUnit = courseResponse.data.units.find((u: Unit) => u.id === parseInt(unitId!));
            
            if (!foundUnit) {
                console.error(`Unit with ID ${unitId} not found in course units:`, courseResponse.data.units);
                throw new Error(`Unit with ID ${unitId} not found in course`);
            }
            
            setUnit({
                ...foundUnit,
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
            await api.post(`/api/units/${unitId}/complete/`, {
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
            <CourseSidebar 
                course={course}
                currentUnitId={unit.id}
                variant="unit"
            />
            
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
                
                <div className="unit-body">
                    <ReactMarkdown>{unit.content}</ReactMarkdown>
                </div>
            </main>
        </div>
    );
};

export default Unit;
