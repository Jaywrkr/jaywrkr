# jaywrkr
Animación con Three.js en base a variaciones de música y movimiento del mouse. Demo: https://jaywrkr.mybluemix.net
Al mover el mouse se hace uso de un filtro RGB para el mismo elemento que se ha generado.  

Capacidades:
  Con el mouse se mueven los elementos
  Con los números se pueden cambiar de canciones
  Con el scroll hacia abajo se PAUSA, con el scroll hacia arriba PLAY
  Con doble click se cambia de animación

Documentación
https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene


Nota
De momento no funciona en algunas versiones de Safari, ni en teléfonos móviles. Me encuentro en proceso de prueba de algunas librerías que supuestamente solucionarian al menos el problema en teléfonos móviles. 

Para poder utilizar este demo deberías contar con un Client ID de Soundcloud. Lamentablemente en la actualidad no se pueden generar nuevos ID's. Así que si por suerte algún momento lo generaste puedes usarlo o puedes buscar en la web si alguien te lo puede prestar (Obviamente no para un sistema en producción). 

Si cuentas con tu client_id, debes modificar el index.js en los siguientes puntos: 

	o.open("GET", "//api.soundcloud.com/resolve.json?url=XXXXX&YYYYY".....
	r.src = e.stream_url + "?YYYYY".....
				
        	XXXXX = link de compartir desde Soundcloud
		YYYYY = client_id=xxxxxxxxxxxxxxxxxxxxxxxx
        


www.minervohub.com
www.jcjaramillo.com
https://www.instagram.com/jaywrkr
