import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CourseSidebar.css';

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
    units: Unit[];
}

interface CourseSidebarProps {
    course: Course;
    currentUnitId?: number;
    activeSection?: 'overview' | number;
    setActiveSection?: (section: 'overview' | number) => void;
    variant: 'course' | 'unit';
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ 
    course, 
    currentUnitId, 
    activeSection,
    setActiveSection,
    variant 
}) => {
    const navigate = useNavigate();

    const handleUnitClick = (unitId: number) => {
        if (variant === 'course' && setActiveSection) {
            // In CourseOverview page, set active section
            const unit = course.units.find(u => u.id === unitId);
            if (unit) {
                setActiveSection(unit.order);
            }
        }
        
        // Navigate to unit page
        navigate(`/courses/${course.id}/units/${unitId}`);
    };

    const handleOverviewClick = () => {
        if (setActiveSection) {
            setActiveSection('overview');
        } else {
            navigate(`/courses/${course.id}`);
        }
    };

    return (
        <aside className="course-sidebar">
            {variant === 'course' ? (
                // Course overview sidebar
                <>
                    <div 
                        className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
                        onClick={handleOverviewClick}
                    >
                        Course Overview
                    </div>
                    {course.units.map(unit => (
                        <div 
                            key={unit.id}
                            className={`sidebar-item ${activeSection === unit.order ? 'active' : ''} ${unit.is_completed ? 'completed' : ''}`}
                            onClick={() => handleUnitClick(unit.id)}
                        >
                            <span className="unit-number">{unit.order}</span>
                            {unit.title}
                            {unit.is_completed && <span className="completion-check">✓</span>}
                        </div>
                    ))}
                </>
            ) : (
                // Unit page sidebar
                <>
                    <h3>Course Progress</h3>
                    <div className="progress-indicator">
                        {course.units.map((unit, index) => (
                            <div 
                                key={unit.id}
                                className={`progress-dot ${unit.is_completed ? 'completed' : ''} ${unit.id === currentUnitId ? 'current' : ''}`}
                                onClick={() => handleUnitClick(unit.id)}
                            >
                                <span className="dot-number">{index + 1}</span>
                                <span className="dot-title">{unit.title}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
};

export default CourseSidebar;
