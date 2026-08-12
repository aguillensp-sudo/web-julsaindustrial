# REVISION WEB JULSA INDUSTRIAL 11-08-2026

## 1. Form Crear cuenta de cliente
-Razon Social, Contacto y email son campos obligatorios. Deben quedar claros al usuario que se da de alta. Sin esos campos informados, no se habilita el botón de crear cuenta.
-El campo emal debe tener validación de que es un email.
-El campo Ubicacion/sede de momento, lo ocultamos. Ya veremos que hacer con el.
- El mensaje que sale después de haber rellenado los datos: "Crear cuenta de cliente
Cree su usuario para acceder a precios en USD y realizar pedidos." debe cambiarse por: "Crear cuenta de cliente
Cree su usuario para consultar nuestros productos y realizar pedidos.
- Se esta recibiendo un mail de supabase...deberiamos cambiar esto a un mail de nuestra empresa.
- Cuando se pulsa el botón del email, se accede a la landing page pero no al area de usuario.
- Los campos de phone y location no están llegando a supabase aunque el usuario los meta. Phone si va en el formulario obligado el otro no, hemos dicho que lo ocultamos aunque debemos dejarlo funcionando en supabase.

## 2. Página Portal
- El box Catalogo y Precios el texto debe cambiarse por Tienda. El subitulo actual debe cambiarse por "Ver productos y realizar pedidos".

## 3. General navegación
- Desde cualquier pantalla del area de usuario, debe haber un acceso para volver al portal

## 4. Pagina Mis Pedidos
- En cada linea de la tabla de pedidos, cuando ya el pedido ha sido realizado y el usuario ha adjuntado su archivo, se le muestra de nuevo un boton para adjuntar archivo. Eso no esta mal, lo que esta mal es que no haya un indicador de que ya hay un arhivo previamente adjuntado. El usuario debe tener acceso a ese archivo siempre para que lo vea, porque puede que por error haya adjuntado otro archivo distinto y quiera modificarlo. Deberiamos permitir solo adjuntar 1 archivo por linea. 
- COmprobamos que los adjuntos del usuario no se estan recuperando desde el portal del administrador. Verificar si se estan subiendo a Supabase

## 5. Area privada
- El texto Carrito y en general los textos para navegar entre estas páginas (los hipervinculos)están en letras muy pequeñas. Incrementar en 2px.
- El texto carrito debe ir acompañado asimimps por un icono de carrito.
- En la pantalla Finalizar pedido, cuando se indica "pago tarjeta" debemos poner los iconos de las tarjetas que aceptamos.

## 6. Flujo Olvida Contraseña
- Al recibirse el email de Supabase, el flujo lleva a la landing con la ventana de acceso de clientes abierta. Esta mal, desde ahí no puede restablecerse la contraseña. 

## 7. Detalles menores
- El favicon esta mal, debe ser: ("C:\Users\admin\proyectos\03_00_Web Julsa Industrial\docs\favicon-ji.png")

## 8. Instrucciones
- Solo cambia los archivos de esta carpeta: C:\Users\admin\proyectos\03_00_Web Julsa Industrial\web-julsaindustrial-FORK
- No toques ni mires otras carpetas
- Haz los cambios solicitados sin preguntar.
- Corre el proceso y verifica todo
- Cuando termines, comitelo al proyecto en GitHub
- Al finalizar todo, me avisas que terminaste y no hagas nada mas.
