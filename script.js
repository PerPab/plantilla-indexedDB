var db;
var contenedor;

function iniciarBD() {

    var btnGuardar = document.getElementById('btn-buscar')
    btnGuardar.addEventListener('click', buscarRegistro)

    contenedor = document.getElementById('contenedor');
    var btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.addEventListener('click', almacenarContacto)

    var solicitud = indexedDB.open("data-base");  //crea y abre la base de datos llamada data-base
    //la solicitud puede traer 3 eventos posibles:
    solicitud.addEventListener('error', mostrarError);  //error, cuando falla la conexion.
    solicitud.addEventListener('success', comenzar);  //success cuando tenemos exito con la creacion o apertura de una bd existente
    solicitud.addEventListener('upgradeneeded', crearAlmacen);  //cuando abrimos una bd que no existe

}

function mostrarError(evento) {
    console.log(evento.code, evento.message);
}

function comenzar(evento) {
    bd = evento.target.result;
    mostrar()
}

function crearAlmacen(evento) {
    var basedatos = evento.target.result;
    var almacen = basedatos.createObjectStore('contactos', { keyPath: 'id' });//el id es un campo (propiedad) perteneciente al objeto que guardamos usado como identificador o clave primaria
    almacen.createIndex('buscarPorNombre', 'nombre', { unique: false });  //creacion de un indice de busqueda, indicamos el nombre del indice
    //-----------------------------------------------------------------//la propiedad que va a usar para buscar (en este caso busca por nombre)
}                                                                     //y finalmente si la clave va a ser unica o no.



/*------------------------------------- almacenar contactos -------------------------------------------------------*/
function almacenarContacto() {
    var nombre_input = document.getElementById('nombre').value;
    var id_input = document.getElementById('id').value;
    var edad_input = document.getElementById('edad').value;

    var transaccion = bd.transaction(['contactos'], 'readwrite'); //indicamos el nombre del almacen donde se va a almacenar el dato
    var almacen = transaccion.objectStore('contactos') //se abre el almacen para recibir el dato
    transaccion.addEventListener('complete', mostrar);

    almacen.add({
        nombre: nombre_input,
        id: id_input,
        edad: edad_input
    })

    document.getElementById('nombre').value = "";
    document.getElementById('id').value = "";
    document.getElementById('edad').value = "";

}

/*------------------------------------- mostrar registros ---------------------------------------------------------*/
function mostrar() {
    contenedor.innerHTML = "";
    var transaccion = bd.transaction(['contactos'], 'readonly'); //se crea la transaccionm
    var almacen = transaccion.objectStore('contactos'); //se abre el almacen
    var puntero = almacen.openCursor(); //se crea el cursor que apunta al objeto
    puntero.addEventListener('success', mostrarRegistros)
}


function mostrarRegistros(evento) {
    var puntero = evento.target.result;
    if (puntero) {
        contenedor.innerHTML += `<hr><ul>
        <li>${puntero.value.nombre}</li>
        <li>${puntero.value.id}</li>
        <li>${puntero.value.edad}</li>
        </ul>
        <input type='button' id='btn-editar' value='editar' onclick='seleccionarRegistro("${puntero.value.id}")'>
        <input type='button' id='btn-borrar' value='borrar' onclick='eliminarRegistro("${puntero.value.id}")'>
        <hr>`
    }
    if (puntero != null) {
        puntero.continue();
    }
}

/*------------------------------------ editar registros ----------------------------------------------------------------*/

function seleccionarRegistro(key) {
    var transaccion = bd.transaction(['contactos'], 'readwrite')
    var almacen = transaccion.objectStore('contactos');
    var solicitud = almacen.get(key)
    solicitud.addEventListener('success', function () {
        document.getElementById('nombre').value = solicitud.result.nombre;
        document.getElementById('id').value = solicitud.result.id;
        document.getElementById('edad').value = solicitud.result.edad;

    })

    var padreBoton = document.getElementById('btn-contenedor');
    padreBoton.innerHTML = `<input type='button' id='btn-actualizar' value='actualizar' onclick='actualizarRegistro()'>`
}

function actualizarRegistro() {
    var nombre_input = document.getElementById('nombre').value;
    var id_input = document.getElementById('id').value;
    var edad_input = document.getElementById('edad').value;

    var transaccion = bd.transaction(['contactos'], 'readwrite');
    var almacen = transaccion.objectStore('contactos')
    transaccion.addEventListener('complete', mostrar);

    almacen.put({
        nombre: nombre_input,
        id: id_input,
        edad: edad_input
    })

    document.getElementById('nombre').value = "";
    document.getElementById('id').value = "";
    document.getElementById('edad').value = "";

    var padreBoton = document.getElementById('btn-contenedor');
    padreBoton.innerHTML = `<input type='button' id='btn-guardar' value='Guardar' onclick='almacenarContacto()'>`

}


/*-------------------------------- eliminar registros -----------------------------------------------------------------*/


function eliminarRegistro(key) {
    var transaccion = bd.transaction(["contactos"], 'readwrite');
    var almacen = transaccion.objectStore('contactos');
    transaccion.addEventListener('complete', mostrar);
    var solicitud = almacen.delete(key);
}


/*------------------------------ buscar registro ------------------------------------------------------------------------*/

function buscarRegistro(evento) {
    evento.preventDefault()
    var buscar = document.getElementById('buscar-nombre').value
    var transaccion = bd.transaction(['contactos'])
    var almacen = transaccion.objectStore('contactos')
    var indice = almacen.index('buscarPorNombre')
    var rango = IDBKeyRange.only(buscar)
    var puntero = indice.openCursor(rango)

    puntero.addEventListener('success', mostrarBusqueda)
}

function mostrarBusqueda(evento) {
    var puntero = evento.target.result
    var resultado = document.getElementById('mostrar-nombre')
    if (puntero) {
        resultado.value = puntero.value.id + " - " + puntero.value.nombre + " - " + puntero.value.edad
    }
}


window.addEventListener('load', iniciarBD);  //al cargar la pagina ejecuta la funcion iniciarBD