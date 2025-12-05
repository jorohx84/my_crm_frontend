export interface Task {

    title: string;
    description: string;
    customer: any,
    state: string;
    comments: any[];
    priority: string;
    created_at: string;
    updated_at: string;
    due_date: string;
    reviewer: string;
    completed_at: string;
    subtasks: any[];
    log: any[];
    members:any[];
}

export function createTaskModel(): Task {
    return {
        title: '',
        description: '',
        customer: null,
        state: 'todo',
        comments: [],
        priority: 'low',
        created_at: '',
        updated_at: '',
        due_date: '',
        reviewer: '',
        completed_at: '',
        log: [],
        subtasks: [],
        members:[],
    }
}