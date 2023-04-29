import { AuthGuard } from '@nestjs/passport';

export class FirebaseAuthGuard extends AuthGuard('firebase') {}
