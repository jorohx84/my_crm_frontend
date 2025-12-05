
export interface Customer {
    id: string;
    companyname: string;
    street: string;
    areacode: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    website: string;
    branch: string;
    is_activ: boolean;
    created_at: string;
    lastContact: string;
    assignedTo: any | null;
    notes: string;
    description: string;
    revenue: number | null;
    paymentTerms: string;
    insideSales: any | null;
    outsideSales: any | null;
    created_by: string | null;
    updated_at: string;

}


export function createCustomerModel(): Customer {
    return {
        id: '',
        companyname: '',
        street: '',
        areacode: '',
        city: '',
        country: '',
        email: '',
        phone: '',
        website: '',
        branch: '',
        is_activ: false,
        created_at: '',
        lastContact: '',
        assignedTo: null,
        notes: '',
        revenue: null,
        paymentTerms: '',
        insideSales: null,
        outsideSales: null,
        created_by: null,
        updated_at: '',
        description: '',
    }
}