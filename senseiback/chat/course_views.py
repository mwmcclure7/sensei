from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Course, Unit, Message
from .serializers import CourseSerializer, UnitSerializer
from .course_llm import generate_course, generate_unit_content
import logging
import json

logger = logging.getLogger(__name__)

class CourseListCreate(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(author=self.request.user, is_active=True).prefetch_related('units')

    def post(self, request):
        if request.data.get('action') == 'generate':
            if 'user_content' not in request.data:
                return Response(
                    {'error': 'user_content is required'},
                    status=400
                )

            chat_history = []
            if 'messages' in request.data:
                chat_history = request.data['messages']

            try:
                logger.debug(f"Generating course with content: {request.data['user_content']}")
                logger.debug(f"Chat history: {chat_history}")
                
                course_data = generate_course(request.data['user_content'], chat_history)
                
                # Create the course
                course = Course.objects.create(
                    title=course_data['title'],
                    description=course_data['description'],
                    summary=course_data.get('summary', ''),  # Add summary field with default value
                    author=request.user
                )

                # Create the units
                for unit_data in course_data['units']:
                    Unit.objects.create(
                        course=course,
                        title=unit_data['title'],
                        description=unit_data['description'],
                        order=unit_data['order']
                    )

                serializer = self.get_serializer(course)
                return Response(serializer.data, status=201)
            except KeyError as e:
                logger.error(f"KeyError in course generation: {str(e)}")
                return Response(
                    {'error': f'Missing required field in course data: {str(e)}'},
                    status=400
                )
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in course generation: {str(e)}")
                return Response(
                    {'error': 'Invalid JSON response from course generation'},
                    status=400
                )
            except Exception as e:
                logger.error(f"Error in course generation: {str(e)}")
                return Response(
                    {'error': str(e)},
                    status=400
                )
        
        return super().post(request)


class CourseDetail(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(
            author=self.request.user, 
            is_active=True
        ).prefetch_related('units')


class UnitList(generics.ListAPIView):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Unit.objects.filter(course__author=self.request.user)


class UnitDetail(generics.RetrieveAPIView):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Unit.objects.filter(course__author=self.request.user)


class UnitComplete(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        unit = get_object_or_404(Unit, id=pk, course__author=request.user)
        unit.is_completed = True
        unit.save()
        return Response({'status': 'unit marked as completed'})


class UnitContent(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        unit = get_object_or_404(Unit, id=pk, course__author=request.user)
        
        if not unit.content:
            # Generate content if it doesn't exist
            unit.content = generate_unit_content(
                unit.course.title,
                {
                    'title': unit.title,
                    'description': unit.description
                }
            )
            unit.save()

        return Response({'content': unit.content})
