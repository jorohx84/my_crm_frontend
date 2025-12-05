export interface Contact {
    name: string;
    position: string;
    function: string;
    department: string;
    phone: string;
    email: string;
    is_active: string;
    newsletter_opt_in: boolean;
    notes: string;
    last_contact: string;
    last_contact_by: string;
    created_at: string;
    created_by: any | null;
    updated_at: string;
    updated_by: any | null;

}

export function createContactModel(): Contact {
    return {
        name: '',
        position: '',
        function: '',
        department: '',
        phone: '',
        email: '',
        is_active: '',
        newsletter_opt_in: false,
        notes: '',
        last_contact: '',
        last_contact_by: '',
        created_at: '',
        created_by: null,
        updated_at: '',
        updated_by: null,
    }
}