// src/modules/compras/ComprasService.js
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy
  } from 'firebase/firestore';
  import { db } from '../../config/firebaseConfig';
  
  const COLLECTION_NAME = 'compras';
  
  // Obtener todas las compras
  export const getCompras = async () => {
    try {
      const comprasCollection = collection(db, COLLECTION_NAME);
      const q = query(comprasCollection, orderBy('fechaRecepcion', 'desc'));
      const comprasSnapshot = await getDocs(q);
      
      return comprasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaEmision: doc.data().fechaEmision?.toDate ? doc.data().fechaEmision.toDate() : doc.data().fechaEmision,
        fechaRecepcion: doc.data().fechaRecepcion?.toDate ? doc.data().fechaRecepcion.toDate() : doc.data().fechaRecepcion
      }));
    } catch (error) {
      console.error('Error al obtener compras:', error);
      throw error;
    }
  };
  
  // Obtener una compra por ID
  export const getCompraById = async (id) => {
    try {
      const compraDoc = doc(db, COLLECTION_NAME, id);
      const compraSnapshot = await getDoc(compraDoc);
      
      if (compraSnapshot.exists()) {
        const data = compraSnapshot.data();
        return {
          id: compraSnapshot.id,
          ...data,
          fechaEmision: data.fechaEmision?.toDate ? data.fechaEmision.toDate() : data.fechaEmision,
          fechaRecepcion: data.fechaRecepcion?.toDate ? data.fechaRecepcion.toDate() : data.fechaRecepcion
        };
      } else {
        throw new Error('Compra no encontrada');
      }
    } catch (error) {
      console.error('Error al obtener compra por ID:', error);
      throw error;
    }
  };
  
  // Crear una nueva compra
  export const createCompra = async (compraData) => {
    try {
      const comprasCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(comprasCollection, {
        ...compraData,
        createdAt: new Date()
      });
      
      // Si la compra tiene un estado "Completado", actualizar inventario en almacén
      if (compraData.estado === 'Completado' && compraData.almacenDestino) {
        await actualizarInventarioAlmacen(compraData);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error al crear compra:', error);
      throw error;
    }
  };
  
  // Actualizar una compra existente
  export const updateCompra = async (id, compraData, compraAnterior) => {
    try {
      const compraDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(compraDoc, {
        ...compraData,
        updatedAt: new Date()
      });
      
      // Si la compra cambia a estado "Completado", actualizar inventario
      if (compraData.estado === 'Completado' && compraAnterior.estado !== 'Completado') {
        await actualizarInventarioAlmacen(compraData);
      }
      
      return id;
    } catch (error) {
      console.error('Error al actualizar compra:', error);
      throw error;
    }
  };
  
  // Eliminar una compra
  export const deleteCompra = async (id) => {
    try {
      const compraDoc = doc(db, COLLECTION_NAME, id);
      await deleteDoc(compraDoc);
      return id;
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      throw error;
    }
  };
  
  // Función para actualizar inventario en almacén al recibir productos
  const actualizarInventarioAlmacen = async (compraData) => {
    try {
      const { productosComprados, almacenDestino } = compraData;
      
      // Verificar que tengamos los datos necesarios
      if (!almacenDestino || !productosComprados || productosComprados.length === 0) {
        return;
      }
      
      // Obtener productos actuales del almacén
      const productosCollection = collection(db, 'productos');
      const q = query(productosCollection, where('almacenId', '==', almacenDestino));
      const productosSnapshot = await getDocs(q);
      const productosActuales = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Procesar cada producto comprado
      for (const productoComprado of productosComprados) {
        const { nombre, categoria, cantidad, unidadMedida } = productoComprado;
        
        // Buscar si el producto ya existe en el almacén
        const productoExistente = productosActuales.find(p => 
          p.nombre === nombre && p.categoria === categoria
        );
        
        if (productoExistente) {
          // Actualizar cantidad del producto existente
          const productoDoc = doc(db, 'productos', productoExistente.id);
          await updateDoc(productoDoc, {
            cantidad: productoExistente.cantidad + parseFloat(cantidad),
            updatedAt: new Date()
          });
        } else {
          // Crear nuevo producto en el almacén
          await addDoc(collection(db, 'productos'), {
            nombre,
            categoria,
            cantidad: parseFloat(cantidad),
            unidadMedida,
            almacenId: almacenDestino,
            stockMinimo: 0, // Valor por defecto
            fechaCreacion: new Date(),
            createdAt: new Date()
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      throw error;
    }
  };