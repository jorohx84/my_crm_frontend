export interface Deal {
    id: string;
    customer: any;
    contact: any;
    sales: any;
    internal_sales: any;
    title: string;
    state: string;
    total_amount: number;
    notes: string;
    created_at: string;
    updated_at: string;
}

export function createDealModel(): Deal {
    return {
        id: '',
        customer: null,
        contact: null,
        sales: null,
        internal_sales: null,
        title: '',
        state: '',
        total_amount: 0,
        notes: '',
        created_at: '',
        updated_at: '',

    }
}