export class Customer {
    companyName: string;
    street: string;
    areacode: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    website: string;
    branch: string;
    isActiv: boolean;
    created_at: string;
    lastContact: string;
    assignedTo: number;
    notes: string;
    revenue: number;
    paymentTerms: string;
    insideSales: any;
    outsideSales: any;
    created_by: any;
    updated_at: string;
    description: string;
   

    constructor(user?: any) {
        this.companyName = user?.company_name || '';
        this.street = user?.street || '';
        this.areacode = user?.areacode || '';
        this.city = user?.city || '';
        this.country = user?.country || '';
        this.email = user?.email || '';
        this.phone = user?.phone || '';
        this.website = user?.website || '';
        this.branch = user?.branch || '';
        this.isActiv = user?.isActiv ?? false;
        this.created_at = user?.created_at || '';
        this.lastContact = user?.lastContact || '';
        this.assignedTo = user?.assignedTo || 0;
        this.notes = user?.notes || '';
        this.revenue = user?.revenue || 0;
        this.paymentTerms = user?.paymentTerms || '';
        this.insideSales = user?.insideSales || {};
        this.outsideSales = user?.outsideSales || {};
        this.created_by = user?.created_by || {};
        this.updated_at = user?.updated_at || {};
        this.description = user?.description || {};
 
    }
}
