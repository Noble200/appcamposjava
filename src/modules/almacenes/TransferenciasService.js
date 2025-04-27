// src/modules/almacenes/TransferenciasService.js
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy, 
    where,
    Timestamp
  } from 'firebase/firestore';
  import { db } from '../../config/firebaseConfig';
  import { getProductoById, updateProducto } from './AlmacenesService';
  
  const COLLECTION_NAME = 'transferencias';
  
  // Registrar una nueva transferencia de productos entre almacenes
  export const registrarTransferencia = async (transferencia) => {
    try {
      // Validar datos de la transferencia
      if (!transferencia.productoId || !transferencia.almacenOrigenId || 
          !transferencia.almacenDestinoId || !transferencia.cantidad || 
          transferencia.cantidad <= 0) {
        throw new Error('Los datos de transferencia son inválidos');
      }
  
      // Obtener el producto a transferir
      const producto = await getProductoById(transferencia.productoId);
      
      // Verificar stock suficiente
      if (producto.cantidad < transferencia.cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.cantidad} ${producto.unidadMedida}`);
      }
      
      // Verificar que no sea el mismo almacén
      if (transferencia.almacenOrigenId === transferencia.almacenDestinoId) {
        throw new Error('No se puede transferir al mismo almacén');
      }
  
      // Buscar si el producto ya existe en el almacén destino
      const productosCollection = collection(db, 'productos');
      const q = query(
        productosCollection, 
        where('nombre', '==', producto.nombre),
        where('categoria', '==', producto.categoria),
        where('almacenId', '==', transferencia.almacenDestinoId)
      );
      
      const productosDestino = await getDocs(q);
      let productoDestinoId = null;
      let productoDestino = null;
      
      if (!productosDestino.empty) {
        productoDestinoId = productosDestino.docs[0].id;
        productoDestino = { 
          id: productoDestinoId, 
          ...productosDestino.docs[0].data() 
        };
      }
  
      // Actualizar stock del producto en almacén origen
      await updateProducto(transferencia.productoId, {
        ...producto,
        cantidad: producto.cantidad - transferencia.cantidad
      });
  
      // Actualizar o crear producto en almacén destino
      if (productoDestinoId) {
        // Producto ya existe en destino, solo actualizar cantidad
        await updateProducto(productoDestinoId, {
          ...productoDestino,
          cantidad: productoDestino.cantidad + transferencia.cantidad
        });
      } else {
        // Crear un nuevo producto en el almacén destino
        const nuevoProducto = {
          nombre: producto.nombre,
          categoria: producto.categoria,
          cantidad: transferencia.cantidad,
          unidadMedida: producto.unidadMedida,
          almacenId: transferencia.almacenDestinoId,
          stockMinimo: producto.stockMinimo,
          fechaVencimiento: producto.fechaVencimiento,
          lote: producto.lote,
          notas: `Transferido desde almacén origen el ${new Date().toLocaleDateString()}`
        };
        
        // Añadir el nuevo producto a la colección
        const productosRef = collection(db, 'productos');
        await addDoc(productosRef, { 
          ...nuevoProducto, 
          createdAt: new Date() 
        });
      }
  
      // Registrar la transferencia
      const transferenciasCollection = collection(db, 'transferencias');
      const docRef = await addDoc(transferenciasCollection, {
        productoId: transferencia.productoId,
        productoNombre: producto.nombre,
        productoCategoria: producto.categoria,
        cantidad: transferencia.cantidad,
        unidadMedida: producto.unidadMedida,
        almacenOrigenId: transferencia.almacenOrigenId,
        almacenDestinoId: transferencia.almacenDestinoId,
        usuario: transferencia.usuario || 'Sistema',
        observaciones: transferencia.observaciones || '',
        fecha: Timestamp.fromDate(new Date()),
        createdAt: new Date()
      });
  
      return docRef.id;
    } catch (error) {
      console.error('Error al registrar transferencia:', error);
      throw error;
    }
  };
  
  // Obtener todas las transferencias
  export const getTransferencias = async (filtros = {}) => {
    try {
      const transferenciasCollection = collection(db, COLLECTION_NAME);
      
      // Aplicar filtros
      let consulta = [];
      
      if (filtros.fechaInicio && filtros.fechaFin) {
        const fechaInicio = Timestamp.fromDate(new Date(filtros.fechaInicio));
        const fechaFin = Timestamp.fromDate(new Date(filtros.fechaFin));
        consulta.push(where('fecha', '>=', fechaInicio));
        consulta.push(where('fecha', '<=', fechaFin));
      }
      
      if (filtros.almacenOrigenId) {
        consulta.push(where('almacenOrigenId', '==', filtros.almacenOrigenId));
      }
      
      if (filtros.almacenDestinoId) {
        consulta.push(where('almacenDestinoId', '==', filtros.almacenDestinoId));
      }
      
      if (filtros.productoNombre) {
        consulta.push(where('productoNombre', '==', filtros.productoNombre));
      }
      
      // Ordenar por fecha (más reciente primero)
      consulta.push(orderBy('fecha', 'desc'));
      
      const q = query(transferenciasCollection, ...consulta);
      const transferenciasSnapshot = await getDocs(q);
      
      return transferenciasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha.toDate() // Convertir Timestamp a Date
      }));
    } catch (error) {
      console.error('Error al obtener transferencias:', error);
      throw error;
    }
  };