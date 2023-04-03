import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { IntroGuard } from "./guards/intro.guard";
import { NoAuthGuard } from "./guards/no-auth.guard";
import { NoVerifyEmailGuard } from "./guards/no-verify-email.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "intro",
    pathMatch: "full",
  },
  {
    path: "login",
    loadChildren: () =>
      import("./pages/auth/login/login.module").then((m) => m.LoginPageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: "sign-up",
    loadChildren: () =>
      import("./pages/auth/sign-up/sign-up.module").then(
        (m) => m.SignUpPageModule
      ),
    canActivate: [NoAuthGuard],
  },
  {
    path: "reset-password",
    loadChildren: () =>
      import("./pages/auth/reset-password/reset-password.module").then(
        (m) => m.ResetPasswordPageModule
      ),
    canActivate: [NoAuthGuard],
  },
  {
    path: "tabs",
    loadChildren: () =>
      import("./pages/tabs/tabs.module").then((m) => m.TabsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: "email-verification",
    loadChildren: () =>
      import("./pages/auth/email-verification/email-verification.module").then(
        (m) => m.EmailVerificationPageModule
      ),
    canActivate: [NoVerifyEmailGuard],
  },
  {
    path: "intro",
    loadChildren: () =>
      import("./pages/auth/intro/intro.module").then((m) => m.IntroPageModule),
    canActivate: [IntroGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
