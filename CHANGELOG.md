# CHANGELOG

## [RED-22] - 2023-06-26 (Mario)

- LoginPage: Hacer refactor para verificar si el usuario está activo. Quitar dependencias de FirebasService.
- FirebaseService/UserService: Mover métodos para evitar dependencias directas de los componentes
  al FirebaseService.
- Agregar todos al SignUpPage
- user.model.ts/wt-woods.ts Limpiar imports que causan errores.
- Agregar todos para mario y diana.
- Cerrar sesión limpiamente desde ProfilePage.
- TabsPage: Limpiar código inutil.
- UserService: Fix retrieveAuthenticatedUser para que incluya la respuesta online/offline.
- FailureUtils: Ajustar imports.
- AppModule: Fix para que no haya errores con los imports que usan la versión compat de angular fire.

## [MARIO/RED-10-AUTH] - 2023-06-26 (Diana)

- Eliminar iconos que no se usan.
- Crar loading-modal.
- Crear error-modal.
- Hacer que el especie-modal cuere con el backbotton.
- Limpiar codigo en Analysis-result, analysis-list, report, report-details.
- Agregar la img de la lupa en implements.
- Agregar opción de Tutorial análisis en help-desk
- Ajustar imágenes de los pasos del how-to-use
- Agregar campos personaType, fullName, doctype y docNumber a analisys-form.

## [RED-22] - 2023-06-23 (Mario)

- Instalar plugin @capacitor/network para detectar conexión de red.
- Agregar NetworkRepository.
- Agregar CameraService, para centralizar el uso de la camar apropiadamente.
- ProfilePage: Ajustar subida y guardado en firebase de foto del perfil.
- FirebaseUser: Agregar métodos para subir imágenes y marcar los otros métodos como deprecated.
- UserService: Fixes en los métodos patchUser y otros métodos secundarios.
- UserState: Agregar campo userPhotoPath para guardar la foto local.

## [MARIO/RED-10-AUTH] - 2023-06-13 (Diana)

- Eliminar módulos que nos e van a usar: stepper. lote-modal.
- Crear componete especie-modal y agregar funcionalidad en take-photos.
- Agregar iconos e imágenes según figma.
- Agregar campo firstReport a interface wtUser y toda la funcionalidad para que se setee la
  primera vez que haga un reporte.
- Limpiar código en módulos analysis, analysis-form how-to-use, take-photos.
- firebaseService: Crear funciones update y create.
- userService: complementar la función pathcUser.

## [MARIO/RED-10-AUTH] - 2023-06-13

- Eliminar módulos que nos e van a usar: Chenge-pasword, devices, operators, properties.
- Ajustes de estilos en todos los módulos de auth y tabs/profile
- Limpieza de código en todos los módulos de auth y tabs/profile
- Cambio en la manera en la que se consulta/modifica en wt-user y sus datos.
- Implementación de funcionalidad para eliminar cuenta.
- remplazo de icons, img a la luz de los nuevos cambios de figma.

## [MARIO/RED-10-AUTH] - 2023-06-05

- Cambios hechos con el último deploy.

## [MARIO/RED-10-AUTH] - 2023-06-02

- Crear componentes analysis-list, analysis-result, report-details.
- implementar flujo de los componentes creados.

## [MARIO/RED-10-AUTH] - 2023-05-18

- Reordenar los imports del AnalysisPageModule para ver si desaparece el error.
- Volver a usar los Tabs de ionic.
- Hacer fix temporal del ProfilePage, para que se muestre todo después de cerrar y abrir sesión.
- Ajuste de consulta de user por $user para módulos de Profile.
- borrar código innecesario.
- AnalysisModule: Forzar el comportamiento de los tabs con el router.
- Limpiar codigo del componente TabsPage.
- Hacer build con los nuevos assets.
- Deshabilitar guards.

## [MARIO/RED-10-AUTH] - 2023-05-17

- Agregar iconos faltantes en pantalla s de auth y profile.
- Implementar analysis- form, analysis-resume, how-to-use, take-photo, con su funcionalidad.
- Ajustar estilos en general.
- Agregar iconos en help-slide, analysis-help,report-help, help-desk e implements.
- Agregar iconos en membership.
- Crear módulo contact.
- Ajustar consulta de usuario en profile
- Crear módulo input-custom.
- Agregar especies.ts (listado de especies).

## [MARIO/RED-10-AUTH] - 2023-05-10

- Implementación del formulario de reporte.
- Estilos de how to use analisis.
- Implkementación del formulario de wood (analisis).
- Vinculación del mok de analisis con el módulo take-photos.

## [MARIO/RED-10-AUTH] - 2023-05-04

- membership: Hacer que se recuperen y se rediman las licencias.
- Borrar código en desuso.
- Anaálisis: Que identifique y se comporte según si existe o nó licencia.

## [MARIO/RED-10-AUTH] - 2023-04-24

- Estilos pantalla analisis-form.
- Poblar datos de la empresa.

## [MARIO/RED-10-AUTH] - 2023-04-22

- Crear clase BaseStore.
- Crear State/Store para Report (incluye Wood y "Reports") y User (incluye License y Company).
- Ajustar los servicios para que devuelvan y escriban el state apropiadamente.
- Agregar modelos para WtCompany y WtUser.
- Make UserService reactive to authentication state change.
- Make Analysis page reactive.

## [MARIO/RED-10-AUTH] - 2023-04-21

- Estilos pantalla analisis y finkappalert.

## [MARIO/RED-10-AUTH] - 2023-04-20 - Al terminar hacer merge al MARIO/RED-10-AUTH

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
