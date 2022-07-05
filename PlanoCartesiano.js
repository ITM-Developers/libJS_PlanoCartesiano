// Namespace 
var PlanoCartesiano = 
{
    // Class
    Segment: function( pointA = undefined, pointB = undefined )
    {
        var point_A = pointA;
        var point_B = pointB;
        
        this.settings = 
        {
            lineColor : 'blue',
            lineWidth : 2
        };

        this.setPoint_A = function( point )
        {
            if( point instanceof PlanoCartesiano.Point )
            {
                point_A = point;
                return true;
            }
            else
            {
                return false;
            }
        }

        this.getPoint_A = function()
        {
            return point_A;
        }

        this.setPoint_B = function( point )
        {
            if( point instanceof PlanoCartesiano.Point )
            {
                point_B = point;
                return true;
            }
            else
            {
                return false;
            }
        }

        this.getPoint_B = function()
        {
            return point_B;
        }
    },

    /**
     * Class: DCL_Punto
     * Esta clase representa a un circulo dibujado en un canvas (Point),  dicho punto puede tener una gran variedad
     * de propiedades que se utilizan para darle un estilo personalizado. Por ejemplo el color de relleno, el color
     * de contorno, algun texto o leyenda al lado de este, etc.
     */
    Point: function( x = undefined, y = undefined )
    {
        let _x = x;
        let _y = y;

        this.settings = 
        {
            radius      : 5,
            fillColor   : 'yellow',
            borderColor : 'black',
            borderLineWidth : 1
        };

        this.set_x = function( x )
        {
            _x = x;
        }

        this.get_x = function()
        {
            return _x;
        }

        this.set_y = function( y )
        {
            _y = y;
        }

        this.get_y = function()
        {
            return _y;
        }
    }, 
    // end class Point

    // Class DCL 'Diagrama de Cuerpo Libre'
    DCL: function()
    {
        let segments = [];      // Son segmentos ue va a ser dibujados en el canvas
        let points   = [];      // Son puntos Individuales que se vana dibujar en el canvas
        let polygons = [];      //

        let DOMElement;         // DOM Element donde va a ser insertado el canvas del DCL
        let canvas;             // Canvas to render
        let context;            // Canvas context
        let center_y;
        let center_x;

        this.settings = 
        {
            gridCentralAxisWidth: 2,
            gridCentralAxisColor: 'blue',
            gridLinesColor   : 'black',
            gridLinesWidth   : 1,
            gridNumbersColor : 'red',
            gridNumbersFont  : '10px Arial',
            zoomScale        : 4 
        };

        /** =============================================== Controles ====================================================
         * 
         */
        var btn_zoom_in;
        var btn_zoom_out;

        var cfg_grid_size  = 10;

        // variables Booleanas (para activar o desactivar caracteristicas)
        var isGridEnabled = true;
        var isGridNumbersEnabled = true;
        var isCentralAxisEnabled = true;

        this.initialize = function( selectorCSS )
        {
            // Validamos la variable 'selectorCSS' es de tipo String
            if( typeof selectorCSS === 'string')
            {
                DOMElement = document.querySelector(selectorCSS);
                if( DOMElement != undefined )
                {
                    canvas = document.createElement('canvas');
                    context = canvas.getContext('2d');
                    DOMElement.appendChild(canvas);

                    canvas.width = 500;
                    center_x = canvas.width / 2;
                    canvas.height = 500;
                    center_y = canvas.height / 2;
                    this.render();
                }
                else
                {
                    throw new Error("El selector proporcionado no se ha encontrado en el DOM.");
                }
            }
            else
            {
                throw new Error("la variable 'selectorCSS' debe ser de tipo String");
            }
        }

        this.setWidth = function( width )
        {
            canvas.width = width;
            center_x = canvas.width / 2;
            this.render();
        }

        this.getWidth = function( )
        {
            return canvas.width;
        }

        this.setHeight = function( height )
        {
            canvas.height = height;
            center_y = canvas.height / 2;
            this.render();
        }

        this.getHeight = function()
        {
            return canvas.height;
        }

        this.setZoomScale = function( zoomScale )
        {
            // condicionamos la escala a 2 como minimo
            if( zoomScale < 2 )
            {
                console.log('Escala minima alcanzada');
                return false;
            }
            // El zoom es un numero para indicar el incremento de los cuadros
            //this.settings.zoomScale = zoomScale;
            this.settings.zoomScale = zoomScale;
            this.render();
        }

        this.setGridSize = function( gridSize )
        {
            // Es el ancho de las cuadriculas
            cfg_grid_size = gridSize;
            this.render();
        }

        this.setGridColor = function( color )
        {
            cfg_grid_color = color;
            this.render();
        }

        this.addPoint = function( point )
        {
            // validamos que el objeto recibido como argumento sea una instancia de la clase punto
            if( point instanceof PlanoCartesiano.Point)
            {
                // agregamos el punto a nuestro array de puntos
                points.push( point );
                // Actualizamos el linezo para que se dibuje el nuevo punto agregado
                this.render();
            }
            else
            {
                console.log('Pra agregar un punto al DCL se debe de pasar un objeto de la clase Point a la funcion addPoint');
                return false;
            }
            
        }

        this.removePoint = function( punto )
        {
            if( punto instanceof Point)
            {

            }
            else
            {
                console.log('Pra remover un punto del DCL se debe de pasar un objeto de la clase Point a la funcion removePoint');
                return false;
            }
            // PENDIENTE
        }

        this.addSegment = function( segment )
        {
            if( segment instanceof PlanoCartesiano.Segment)
            {
                segments.push(segment);
                this.render();
            }
            else
            {
                console.log('Se debe pasar un objeto de tipo vector a la funcion addVector()');
            }
        }

        this.removeSegment = function()
        {

        }

        this.render = function()
        {
            var classInstance = this;

            drawEmptyCanvas();

            if( isGridEnabled )
                drawGridLines( classInstance );
            
            if( isCentralAxisEnabled )
                drawCentralAxis( classInstance );

            if( isGridNumbersEnabled )
                drawGridNumbers( classInstance );
            
            points.forEach( point => drawPoint(classInstance, point) );
            segments.forEach( segment => drawSegment(classInstance, segment) );

            drawControls(this);
        }

        var drawEmptyCanvas = function()
        {
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        var drawGridLines = function( classInstance )
        {
            // Los estilos del Grid
            context.beginPath();
            context.lineWidth   = classInstance.settings.gridLinesWidth;
            context.strokeStyle = classInstance.settings.gridLinesColor;

            // para calcular el tamano real del cuadrado de la malla en pixels debemos multiplicar su tamano por la
            // escala del zoom,
            var pixels_per_square = cfg_grid_size * classInstance.settings.zoomScale;

            // ===================================================================================================
            //                              Dibujamos las lineas del Cuadrante 1
            
            // Lineas Horizontales
            for(let y = center_y; y >= 0; y -= pixels_per_square)
            {
                context.moveTo(center_x     , y);
                context.lineTo(canvas.width , y);
                context.stroke();
            }
            // Lineas Verticales
            for(let x = center_x; x < canvas.width; x += pixels_per_square)
            {
                context.moveTo(x, 0);
                context.lineTo(x, center_x);
                context.stroke();
            }
            // ===================================================================================================
            //                              Dibujamos las lineas del Cuadrante 2

            // Lineas Horizontales
            for(let y = center_y; y >= cfg_grid_size; y -= pixels_per_square)
            {
                context.moveTo( 0        , y);
                context.lineTo( center_x , y);
                context.stroke();
            }
            // Lineas Verticales
            for(let x = center_x; x >= cfg_grid_size; x -= pixels_per_square)
            {
                context.moveTo(x, 0);
                context.lineTo(x, center_y);
                context.stroke();
            }
            // ===================================================================================================
            //                              Dibujamos las lineas del Cuadrante 3

            // Lineas Horizontales
            for(let y = center_y; y < canvas.height; y += pixels_per_square)
            {
                context.moveTo(0, y);
                context.lineTo(center_x, y);
                context.stroke();
            }
            // Lineas Verticales
            for(let x = center_x; x >= cfg_grid_size; x -= pixels_per_square)
            {
                context.moveTo(x, center_y);
                context.lineTo(x, canvas.height);
                context.stroke();
            }
            // ===================================================================================================
            //                              Dibujamos las lineas del Cuadrante 4

            // Lineas Horizontales
            for(let y = center_y; y < canvas.height; y += pixels_per_square)
            {
                context.moveTo(center_x, y);
                context.lineTo(canvas.width, y);
                context.stroke();
            }
            // Lineas Verticales
            for(let x = center_x; x < canvas.width; x += pixels_per_square)
            {
                context.moveTo(x, center_x);
                context.lineTo(x, canvas.height);
                context.stroke();
            }
        }

        var drawCentralAxis = function( classInstance )
        {
            context.beginPath();
            context.lineWidth   = classInstance.settings.gridCentralAxisWidth;
            context.strokeStyle = classInstance.settings.gridCentralAxisColor;
    
            // Eje de X
            context.moveTo(0, center_y);
            context.lineTo(canvas.width, center_y);
            context.stroke();
    
            // Eje de Y
            context.moveTo(center_x, 0);
            context.lineTo(center_x, canvas.height);
            context.stroke();
        }
    
        var drawGridNumbers = function( classInstance )
        {
            context.beginPath();
            context.fillStyle   = classInstance.settings.gridNumbersColor;
            context.font        = classInstance.settings.gridNumbersFont;
    
            let i;
            let margin_x = 7;
            let margin_y = 5;
            let square_size = cfg_grid_size * classInstance.settings.zoomScale;

            // CUADRANTE 1
            i = 0;
            for(let x = center_x; x < canvas.width; x += square_size)
            {
                context.fillText(i, x + margin_x, center_y - margin_y);
                i++;
            }
            
            // CUADRANTE 2
            i = 0;
            for(let x = center_x; x > 0; x -= square_size)
            {
                context.fillText(i, x + margin_x, center_y - margin_y);
                i--;
            }
            
            // CUADRANTE 3
            i = 0;
            for(let y = center_y; y > 0; y -= square_size)
            {
                context.fillText(i, center_x + margin_x, y - margin_y);
                i++;
            }

            // CUADRANTE 4
            i = 0;
            for(let y = center_y; y < canvas.height; y += square_size)
            {
                context.fillText(i, center_x + margin_x, y - margin_y);
                i--;
            }
        }

        var drawControls = function( classInstance )
        {
            if( btn_zoom_in == undefined )
            {
                btn_zoom_in  = document.createElement('button');
                btn_zoom_in.textContent  = '+';
                btn_zoom_in.setAttribute('class','btn btn-primary');
                btn_zoom_in.addEventListener('click', function(){
                    classInstance.setZoomScale( classInstance.settings.zoomScale + 1);
                });
                DOMElement.appendChild(btn_zoom_in);
            }

            if( btn_zoom_out == undefined )
            {
                btn_zoom_out = document.createElement('button');
                btn_zoom_out.textContent = '-';
                btn_zoom_out.setAttribute('class','btn btn-primary');
                btn_zoom_out.addEventListener('click', function(){
                    classInstance.setZoomScale( classInstance.settings.zoomScale - 1);
                });
                DOMElement.appendChild(btn_zoom_out);
            }
            
        }

        var drawPoint = function( classInstance, point )
        {
            if( point instanceof PlanoCartesiano.Point )
            {
                // calculamos las coordenadas en xy en el canvas
                let x = center_x + ((classInstance.settings.zoomScale * cfg_grid_size) * point.get_x());
                let y = center_y - ((classInstance.settings.zoomScale * cfg_grid_size) * point.get_y());

                context.beginPath();
                context.arc(x, y, point.settings.radius, 0, 2 * Math.PI, false);
                context.fillStyle = point.settings.fillColor;
                context.fill();
                context.lineWidth = point.settings.borderLineWidth;
                context.strokeStyle = point.settings.borderColor;
                context.stroke();   
            }
        }

        var drawSegment = function( classInstance, segment )
        {
            // calculamos las coordenadas en el canvas
            var ax = segment.getPoint_A().get_x() * classInstance.settings.zoomScale * cfg_grid_size;
            var ay = segment.getPoint_A().get_y() * classInstance.settings.zoomScale * cfg_grid_size;
            var bx = segment.getPoint_B().get_x() * classInstance.settings.zoomScale * cfg_grid_size;
            var by = segment.getPoint_B().get_y() * classInstance.settings.zoomScale * cfg_grid_size;

            // Dibujamos la linea del segmento
            context.beginPath();
            context.strokeStyle = segment.settings.lineColor;
            context.lineWidth   = segment.settings.lineWidth;
            context.moveTo( center_x + ax, center_y - ay );
            context.lineTo( center_x + bx, center_y - by );
            context.stroke();

            // dibujamos los puntos extremos del segmento
            drawPoint( classInstance, segment.getPoint_A() );
            drawPoint( classInstance, segment.getPoint_B() );
        }

    } // end class DCL
};