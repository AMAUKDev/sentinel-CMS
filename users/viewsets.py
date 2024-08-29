from users.models import CustomUser
from rest_framework import viewsets
from users.serializers import CustomUserSerializer


class LoggedInUserViewSet(viewsets.ModelViewSet):
    # queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        # filter queryset based on logged in user
        return CustomUser.objects.filter(
            email=self.request.user.email
        )

    def perform_create(self, serializer):
        # ensure current user is correctly populated on new objects
        serializer.save(user=self.request.user)
