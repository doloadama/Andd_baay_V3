import { Product } from '../types';
import { apiFetch } from './api';

export const getProducts = async (): Promise<Product[]> => {
    const products = await apiFetch('/products/');
    // The backend sends image URLs relative to MEDIA_ROOT, so we prepend the base URL.
    return products.map((p: any) => ({ ...p, imageUrl: p.image ? `http://127.0.0.1:8000${p.image}` : `https://source.unsplash.com/400x300/?${p.product_name}`}));
};

export const createProduct = async (productData: Omit<Product, 'id' | 'farmerId'>, imageFile: File | null): Promise<Product> => {
    const formData = new FormData();
    
    // The backend expects snake_case for fields
    formData.append('product_name', productData.productName);
    formData.append('project', String(productData.projectId));
    formData.append('quantity', String(productData.quantity));
    formData.append('price', String(productData.price));
    formData.append('unit', productData.unit);
    formData.append('availability_status', productData.availabilityStatus);
    
    if (imageFile) {
        formData.append('image', imageFile, imageFile.name);
    }

    const newProduct = await apiFetch('/products/', {
        method: 'POST',
        body: formData,
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
