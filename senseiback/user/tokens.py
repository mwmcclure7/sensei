from django.contrib.auth.tokens import PasswordResetTokenGenerator


class PasswordTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp)  +
            str(user.is_active)
        )


account_activation_token = PasswordTokenGenerator()
