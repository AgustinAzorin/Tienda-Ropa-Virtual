## Explicacion basica de como Funciona una web APP

La Web App se divide en dos partes: El backend que es donde sucede la logica detras de la app y el frontend que es donde se muestra la informacion al cliente. Tambien se suele dividir entre server side y client side

## Back 
Database (EN este caso Supabase): Son las tablas que contienen la informacion que necesitamos. Estan las columnas y las filas. Convencionalmente siempre se usa una columna que sea ID para que la computadora peuda identificar bien una fila y no haya problema por nobres repetidos y esas cosas. LOs archivos que odifican la DB se llaan migraciones y van en /Back/Migraciones (esto es la direccion de la carpeta por si no estas familiarizado con el termino). Vos Hace los archivos y despues me decis a mi para que los revise y los eejcute en la DB asi nos aseguramos de no romper nada

Models: Los models son archivos que le dicen a la computadora que el producto debe tener cierta estructura para poder entrar a la DB. O sea si tienen que tener id, nombre , edad u otra cosa mas. Se encuentran en /Back/src/models. 

Repository: Son los archivos que manejan donde se guarda la informacion. Por ejemplo, en cual modelo. Se encuentran como archivos individuales dentro de las carpetas de /modules

Services: Son los archivos que manejan la logica. Por ejemplo si se tiene que sumar una variable mas otra. Se encuentran en las mismas carpetas de modules

Routes: Son los archivos que exponen los "endpoints". LOs endpoints son URLs que al acceder llaman a cierto service que el service llama al repository y el repository a la DB. POr ejemplo si el usuario entra a "nuestra_pagina/sumar" el route va a llamar a un service que sume dos variables por ejemplo y va a devolver eso. En general tambien servide para mandar a otras paginas. Back/src/app

## Frontend
Es donde estan las paginas. La verda que ni puta idea. :) preguntale a copilot jsjsjsjsj.