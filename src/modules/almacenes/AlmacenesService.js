// src/modules/almacenes/AlmacenesService.js
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where 
  } from 'firebase/firestore';
  import { db } from '../../config/firebaseConfig';
  
  const COLLECTION_NAME = 'almacenes';
  const PRODUCTS_COLLECTION = 'productos';
  
  // Obtener todos los almacenes
  export const getAlmacenes = async () => {
    try {
      const almacenesCollection = collection(db, COLLECTION_NAME);
      const almacenesSnapshot = await getDocs(almacenesCollection);
      return almacenesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener almacenes:', error);
      throw error;
    }
  };
  
  // Obtener un almacén por ID
  export const getAlmacenById = async (id) => {
    try {
      const almacenDoc = doc(db, COLLECTION_NAME, id);
      const almacenSnapshot = await getDoc(almacenDoc);
      
      if (almacenSnapshot.exists()) {
        return {
          id: almacenSnapshot.id,
          ...almacenSnapshot.data()
        };
      } else {
        throw new Error('Almacén no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener almacén por ID:', error);
      throw error;
    }
  };
  
  // Crear un nuevo almacén
  export const createAlmacen = async (almacenData) => {
    try {
      const almacenesCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(almacenesCollection, {
        ...almacenData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear almacén:', error);
      throw error;
    }
  };
  
  // Actualizar un almacén existente
  export const updateAlmacen = async (id, almacenData) => {
    try {
      const almacenDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(almacenDoc, {
        ...almacenData,
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error al actualizar almacén:', error);
      throw error;
    }
  };
  
  // Eliminar un almacén
  export const deleteAlmacen = async (id) => {
    try {
      const almacenDoc = doc(db, COLLECTION_NAME, id);
      await deleteDoc(almacenDoc);
      return id;
    } catch (error) {
      console.error('Error al eliminar almacén:', error);
      throw error;
    }
  };
  
  // Obtener productos por almacén
  export const getProductosByAlmacen = async (almacenId) => {
    try {
      const productosCollection = collection(db, PRODUCTS_COLLECTION);
      const q = query(productosCollection, where('almacenId', '==', almacenId));
      const productosSnapshot = await getDocs(q);
      
      return productosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener productos por almacén:', error);
      throw error;
    }
  };
  
  // Obtener todos los productos
  export const getProductos = async () => {
    try {
      const productosCollection = collection(db, PRODUCTS_COLLECTION);
      const productosSnapshot = await getDocs(productosCollection);
      
      return productosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  };
  
  // Obtener un producto por ID
  export const getProductoById = async (id) => {
    try {
      const productoDoc = doc(db, PRODUCTS_COLLECTION, id);
      const productoSnapshot = await getDoc(productoDoc);
      
      if (productoSnapshot.exists()) {
        return {
          id: productoSnapshot.id,
          ...productoSnapshot.data()
        };
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }
  };
  
  // Crear un nuevo producto
  export const createProducto = async (productoData) => {
    try {
      const productosCollection = collection(db, PRODUCTS_COLLECTION);
      const docRef = await addDoc(productosCollection, {
        ...productoData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  };
  
  // Actualizar un producto existente
  export const updateProducto = async (id, productoData) => {
    try {
      const productoDoc = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(productoDoc, {
        ...productoData,
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  };
  
  // Eliminar un producto
  export const deleteProducto = async (id) => {
    try {
      const productoDoc = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(productoDoc);
      return id;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  };
  
  // Transferir producto entre almacenes
  export const transferirProducto = async (productoId, almacenDestinoId, cantidad) => {
    try {
      const productoDoc = await getProductoById(productoId);
      
      // Validar stock suficiente
      if (productoDoc.cantidad < cantidad) {
        throw new Error('Stock insuficiente para transferir');
      }
      
      // Verificar si ya existe el producto en el almacén destino
      const productosDestino = await getProductosByAlmacen(almacenDestinoId);
      const productoEnDestino = productosDestino.find(p => 
        p.nombre === productoDoc.nombre && 
        p.categoria === productoDoc.categoria
      );
      
      // Actualizar producto origen (restar cantidad)
      await updateProducto(productoId, {
        ...productoDoc,
        cantidad: productoDoc.cantidad - cantidad
      });
      
      if (productoEnDestino) {
        // Actualizar producto en destino (sumar cantidad)
        await updateProducto(productoEnDestino.id, {
          ...productoEnDestino,
          cantidad: productoEnDestino.cantidad + cantidad
        });
      } else {
        // Crear nuevo producto en destino
        await createProducto({
          nombre: productoDoc.nombre,
          categoria: productoDoc.categoria,
          cantidad: cantidad,
          unidadMedida: productoDoc.unidadMedida,
          almacenId: almacenDestinoId,
          stockMinimo: productoDoc.stockMinimo,
          fechaVencimiento: productoDoc.fechaVencimiento,
          lote: productoDoc.lote,
          notas: `Transferido desde almacén: ${productoDoc.almacenId}`
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error al transferir producto:', error);
      throw error;
    }
  };