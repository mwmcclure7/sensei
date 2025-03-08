import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/Courses.css';

interface Course {
    id: number;
    title: string;
    description: string;
    summary: string;
    units: Unit[];
}

interface Unit {
    id: number;
    title: string;
    description: string;
    order: number;
    is_completed: boolean;
}

const Courses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get('/api/courses/');
            console.log('Courses response:', {
                status: response.status,
                headers: response.headers,
                data: response.data,
                isArray: Array.isArray(response.data),
                length: Array.isArray(response.data) ? response.data.length : 'not an array'
            });
            
            // Ensure we have an array of courses
            if (!Array.isArray(response.data)) {
                console.error('Expected array of courses but got:', typeof response.data);
                setError('Invalid course data received');
                return;
            }
            
            setCourses(response.data);
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            if (error.response?.status === 401) {
                setError('Please log in to view your courses.');
                navigate('/login');
            } else {
                setError(error.response?.data?.error || 'Failed to load courses. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCourse = () => {
        navigate('/courses/create');
    };

    const handleOpenCourse = (courseId: number) => {
        navigate(`/courses/${courseId}`);
    };

    if (isLoading) {
        return (
            <div className="courses-container">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>Loading courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="courses-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchCourses}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="courses-container">
            <h1 className="courses-title">My Courses (BETA)</h1>
            <div className="courses-grid">
                <div 
                    className="course-card create-card"
                    onClick={handleCreateCourse}
                >
                    <div className="create-icon">+</div>
                    <h3>Create New Course</h3>
                    <p>Design your personalized learning path</p>
                </div>
                
                {courses.map(course => (
                    <div 
                        key={course.id}
                        className="course-card"
                        onClick={() => handleOpenCourse(course.id)}
                    >
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <div className="course-progress">
                            <div 
                                className="progress-bar"
                                style={{
                                    width: `${(course.units?.filter(u => u.is_completed)?.length || 0) / (course.units?.length || 1) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
