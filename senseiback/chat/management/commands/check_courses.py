from django.core.management.base import BaseCommand
from chat.models import Course
from chat.serializers import CourseSerializer

class Command(BaseCommand):
    help = 'Check courses in the database'

    def handle(self, *args, **options):
        courses = Course.objects.all()
        self.stdout.write(f"Total courses: {courses.count()}")
        
        for course in courses:
            self.stdout.write("\n=== Course ===")
            self.stdout.write(f"ID: {course.id}")
            self.stdout.write(f"Title: {course.title}")
            self.stdout.write(f"Author: {course.author}")
            self.stdout.write(f"Is Active: {course.is_active}")
            self.stdout.write(f"Units: {course.units.count()}")
            
            # Check serialization
            serializer = CourseSerializer(course)
            self.stdout.write("\nSerialized data:")
            self.stdout.write(str(serializer.data))
