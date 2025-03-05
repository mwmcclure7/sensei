import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [isLoadingUnitContent, setIsLoadingUnitContent] = useState(true);
    const [isCompletingUnit, setIsCompletingUnit] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [courseId, unitId]);

    const fetchData = async () => {
        try {
            setIsLoadingCourse(true);
            setIsLoadingUnitContent(true);
            
            // Fetch course data to get all units
            const courseResponse = await api.get(`/api/courses/${courseId}/`);
            console.log('Course response:', courseResponse.data);
            
            // Check if course data has the expected structure
            if (!courseResponse.data || !courseResponse.data.units || !Array.isArray(courseResponse.data.units)) {
                console.error('Course data is missing units array:', courseResponse.data);
                throw new Error('Course data is not in the expected format');
            }
            
            setCourse(courseResponse.data);
            setIsLoadingCourse(false);
            
            // Find the unit in the course data
            const foundUnit = courseResponse.data.units.find((u: Unit) => u.id === parseInt(unitId!));
            
            if (!foundUnit) {
                console.error(`Unit with ID ${unitId} not found in course units:`, courseResponse.data.units);
                throw new Error(`Unit with ID ${unitId} not found in course`);
            }
            
            // Set the unit with basic info before content loads
            setUnit(foundUnit);
            
            // Fetch unit content
            const unitResponse = await api.get(`/api/units/${unitId}/content/`);
            console.log('Unit content response:', unitResponse.data);
            
            setUnit({
                ...foundUnit,
                content: unitResponse.data.content
            });
            
            setIsLoadingUnitContent(false);
        } catch (error) {
            console.error('Error fetching unit:', error);
            setIsLoadingCourse(false);
            setIsLoadingUnitContent(false);
        }
    };

    const handleCompleteAndContinue = async () => {
        if (!course || !unit) return;
        
        try {
            setIsCompletingUnit(true);
            
            // Only mark as complete if not already completed
            if (!unit.is_completed) {
                await api.post(`/api/units/${unitId}/complete/`, {
                    unit_order: unit.order
                });
                
                // Update local state to reflect completion
                setUnit({
                    ...unit,
                    is_completed: true
                });
            }
            
            // Find the next unit
            const currentIndex = course.units.findIndex(u => u.id === unit.id);
            if (currentIndex < course.units.length - 1) {
                // Navigate to next unit
                navigate(`/courses/${courseId}/units/${course.units[currentIndex + 1].id}`);
            } else {
                // Show completion screen or navigate back to course overview
                navigate(`/courses/${courseId}`);
            }
        } catch (error) {
            console.error('Error completing unit:', error);
        } finally {
            setIsCompletingUnit(false);
        }
    };

    // Show loading state only when we don't have course data yet
    if (isLoadingCourse || !course) {
        return (
            <div className="unit-loading">
                <div className="loading-spinner" />
                <p>Loading course information...</p>
            </div>
        );
    }

    // If we have course data but no unit, show error
    if (!unit) {
        return (
            <div className="unit-error">
                <p>Unit not found</p>
                <button onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</button>
            </div>
        );
    }

    const currentIndex = course.units.findIndex(u => u.id === unit.id);
    const previousUnit = currentIndex > 0 ? course.units[currentIndex - 1] : null;
    const nextUnit = currentIndex < course.units.length - 1 ? course.units[currentIndex + 1] : null;
    const isLastUnit = currentIndex === course.units.length - 1;

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
                        {previousUnit ? (
                            <button 
                                className="nav-button previous"
                                onClick={() => navigate(`/courses/${courseId}/units/${previousUnit.id}`)}
                            >
                                ← Previous Unit
                            </button>
                        ) : (
                            <button 
                                className="nav-button previous"
                                onClick={() => navigate(`/courses/${courseId}`)}
                            >
                                ← Back to Course
                            </button>
                        )}
                        <button 
                            className="complete-button"
                            onClick={handleCompleteAndContinue}
                            disabled={isCompletingUnit}
                        >
                            {isCompletingUnit ? 'Processing...' : 
                                isLastUnit ? 'Complete & Finish Course' : 
                                unit.is_completed ? 'Continue to Next Unit' : 'Complete & Continue'}
                        </button>
                    </div>
                </div>
                
                <div className="unit-body">
                    {isLoadingUnitContent ? (
                        <div className="content-loading">
                            <div className="loading-spinner" />
                            <p>Generating unit content...</p>
                        </div>
                    ) : (
                        <ReactMarkdown>{unit.content}</ReactMarkdown>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Unit;
