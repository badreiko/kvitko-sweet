export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
    featured?: boolean;
    tags?: string[];
    createdAt: Date;
  }
  
  export interface Category {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  }
  
  export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }
  
  export interface CustomBouquet {
    id: string;
    userId: string;
    flowers: Array<{
      flowerId: string;
      quantity: number;
    }>;
    additionalItems?: Array<{
      itemId: string;
      quantity: number;
    }>;
    wrappingStyle: string;
    message?: string;
    price: number;
    status: 'draft' | 'ordered' | 'completed';
    createdAt: Date;
  }
  
  export interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    author: string;
    tags?: string[];
    published: boolean;
    publishedAt: Date;
    createdAt: Date;
  }
  
  export interface Order {
    id: string;
    userId: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    customBouquets?: CustomBouquet[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    deliveryAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    deliveryDate?: Date;
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
    createdAt: Date;
  }