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
        if (variant === 'course' && setActiveSection) {
            setActiveSection('overview');
        } else {
            navigate(`/courses/${course.id}`);
        }
    };

    return (
        <aside className="course-sidebar">
            <div className="sidebar-header">
                <h3>{course.title}</h3>
                <button 
                    className={`sidebar-button ${variant === 'course' && activeSection === 'overview' ? 'active' : ''}`}
                    onClick={handleOverviewClick}
                >
                    Course Overview
                </button>
            </div>
            
            <div className="sidebar-units">
                {course.units.map((unit, index) => (
                    <div 
                        key={unit.id}
                        className={`sidebar-item ${
                            (variant === 'course' && activeSection === unit.order) || 
                            (variant === 'unit' && unit.id === currentUnitId) ? 
                            'active' : ''
                        } ${unit.is_completed ? 'completed' : ''}`}
                        onClick={() => handleUnitClick(unit.id)}
                    >
                        <span className="unit-number">{unit.order}</span>
                        <span className="unit-title">{unit.title}</span>
                        {unit.is_completed && <span className="completion-check">✓</span>}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default CourseSidebar;
