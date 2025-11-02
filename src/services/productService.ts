import { Product } from '../types';
import { apiFetch } from './api';

export const getProducts = async (): Promise<Product[]> => {
    const products = await apiFetch('/products/');
    // The backend sends image URLs relative to MEDIA_ROOT, so we prepend the base URL.
    return products.map((p: any) => ({ ...p, imageUrl: `http://127.0.0.1:8000${p.image}`}));
};

export const createProduct = async (productData: Omit<Product, 'id' | 'farmerId'>, imageFile: File | null): Promise<Product> => {
    const formData = new FormData();
    
    // Append all fields except the image file to the form data
    Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
             formData.append(key, String(value));
        }
    });

    if (imageFile) {
        formData.append('image', imageFile, imageFile.name);
    }
    
    // Remove imageUrl as we are sending a file
    formData.delete('imageUrl');

    const newProduct = await apiFetch('/products/', {
        method: 'POST',
        body: formData, // Let the browser set the Content-Type header for multipart/form-data
    });
    return { ...newProduct, imageUrl: `http://127.0.0.1:8000${newProduct.image}`};
};

export const updateProduct = async (id: number, productData: Partial<Omit<Product, 'id' | 'farmerId'>>, imageFile?: File | null): Promise<Product> => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });
    if (imageFile) {
        formData.append('image', imageFile, imageFile.name);
    }
    formData.delete('imageUrl');

    const updatedProduct = await apiFetch(`/products/${id}/`, {
        method: 'PATCH', // Use PATCH for partial updates
        body: formData,
    });
    return { ...updatedProduct, imageUrl: `http://127.0.0.1:8000${updatedProduct.image}`};
};

export const deleteProduct = async (id: number): Promise<void> => {
    await apiFetch(`/products/${id}/`, {
        method: 'DELETE',
    });
};
