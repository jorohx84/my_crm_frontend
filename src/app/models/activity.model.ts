export interface Activity {
    id: string;
    title: string;
    description: string;
    type: string;
    contact: any;
    customer: any;
    date: string;

}

export function createActivityModel(): Activity {
    return {
        id: '',
        title: '',
        description: '',
        type: '',
        contact: null,
        customer: null,
        date: '',
    }
}