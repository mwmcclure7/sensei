import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api';
import '../styles/CourseOverview.css';
import CourseSidebar from '../components/CourseSidebar';

interface Unit {
    id: number;
    title: string;
    description: string;
    order: number;
    is_completed: boolean;
}

interface Course {
    id: number;
    title: string;
    description: string;
    summary: string;
    units: Unit[];
}

const CourseOverview: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'overview' | number>('overview');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/courses/${courseId}/`);
            console.log('Course data:', response.data);
            if (!response.data || !Array.isArray(response.data.units)) {
                console.error('Invalid course data:', response.data);
                throw new Error('Invalid course data received');
            }
            setCourse(response.data);
        } catch (error: any) {
            console.error('Error fetching course:', error);
            if (error.response?.status === 401) {
                setError('Please log in to view this course.');
                navigate('/login');
            } else {
                setError(error.response?.data?.error || 'Failed to load course. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUnitClick = (unitId: number) => {
        navigate(`/courses/${courseId}/units/${unitId}`);
    };

    if (loading) {
        return (
            <div className="course-loading">
                <div className="loading-spinner" />
                <p>Loading course...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-error">
                <p>{error}</p>
                <button onClick={fetchCourse}>Try Again</button>
            </div>
        );
    }

    if (!course || !course.units) {
        return (
            <div className="course-error">
                <p>Course not found</p>
                <button onClick={() => navigate('/courses')}>Back to Courses</button>
            </div>
        );
    }

    return (
        <div className="course-overview-container">
            <CourseSidebar 
                course={course}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                variant="course"
            />
            
            <main className="course-content">
                <h1 className="course-title">{course.title}</h1>
                <p className="course-description">{course.description}</p>
                
                <div className="course-progress-bar">
                    <div 
                        className="progress-fill"
                        style={{
                            width: `${(course.units.filter(u => u.is_completed).length / course.units.length) * 100}%`
                        }}
                    />
                </div>
                
                <section className="course-summary">
                    <h2>Course Summary</h2>
                    <ReactMarkdown>{course.summary}</ReactMarkdown>
                </section>
                
                {course.units.length > 0 && (
                    <button 
                        className="start-course-btn"
                        onClick={() => handleUnitClick(course.units[0].id)}
                    >
                        {course.units[0].is_completed ? 'Continue Course' : 'Start Course'}
                    </button>
                )}
            </main>
        </div>
    );
};

export default CourseOverview;
