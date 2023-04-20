# CHANGELOG

## [MARIO/RED-10-AUTH-1] - 2023-04-20 - Al terminar hacer merge al MARIO/RED-10-AUTH

- Configurar app y environments para usar angular/fire modular. Se conserva el angular/fire compat.
- Agregar date.utils.
- Mejorar failure.utils.
- Agregar types para FieldValue, Timestamp y "query constraints".
- Agregar/ajustar modelos y servicios para licences, reports y woods.
- FirebaseService: Add methods collection$, fetchCollection$, doc$ y fetchDoc, usando angular/fire modular.
- FirebaseService: Marcar deprecated las clases de angular/fire compat para cambiarlas a futuro.
- Agregar constantes para los keys del localstorage y las colecciones de Firebase.
- Crear el UserService, para separar también la lógica para allá.
- Crear una constante para el key del localstorage del usuario autenticado.
- Crear el LocalStorageRepository, para evitar el acceso directo al localstorage desde los componentes.
- Fixes y limpieza.

## [MARIO/RED-10-AUTH] - 2023-04-18

- Estilos email-verification, reset-password, sign-up, update-password, admin-account, help-desk, profile.
  -Agregar interface de wt-licenses.

## [MARIO/RED-10-AUTH] - 2023-04-03

- global.scss: ajustar estilos del popup.
- Agregar iconos de WoodTraver.
- Cambiar textos del email verifications en la autenticación.
- Ajustar estilos de demás páginas y los routing.
- Ajustar estilos del header y del nav-bar.
- Agregar componentes faltantes del help.
- Cambiar el icono de la app.

## [MARIO/RED-10-AUTH] - 2023-03-21

- Crear componente Change-password.
- Ajustar estilos del login.
- Agregar campos faltantes para el sign-up (fNacimiento, genero, movil).
- Ajustar interface de profile, admin-account y membership.
- Modificar estolos del header y help-slider.
- Cambiar logo.
- Splash.

## [MARIO/RED-10-AUTH] - 2023-03-14

- Login page.
- Tabs page.
- admin-account page.

## [MARIO/RED-10-AUTH] - 2023-03-10

- Fix bugs with Login observables.
- Estilos help-slider.

## [MARIO/RED-10-AUTH] - 2023-03-08

- Ajuste de colores -Ionic CSS Variables, estilos globales.
-

## [MARIO/RED-10-AUTH] - 2023-03-07

- Ajustar para que el registro y el login funcionen con casos de borde.

## [MARIO/RED-10-AUTH] - 2023-03-04

- Add FailureUtils for better error handling and flow control.
- FirebaseService: Add authState getter.
- SingUpPage: Refactor to work with existing users in RedForestal.
- LoginPage: Refactor to be more reactive, handle errors and remove license verification.

## [0.0.1] - 2023-02-23

- Ajustar environments para apuntar a RedForestal.
- Mover a repositorio WoodTrace.
