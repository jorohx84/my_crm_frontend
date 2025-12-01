import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { GlobalService } from "./global.service";
import { DataService } from "./data.service";

@Injectable({
    providedIn: 'root'
})

export class LogBookService {
    api = inject(APIService);
    global = inject(GlobalService);
    dataservice = inject(DataService);
    task = this.dataservice.task;

    taskLogs: Record<string, string> = {
        title: 'Titel wurde geändert:',
        description: 'Beschreibung wurde geändert:',
        state: 'Status wurde geändert:',
        priority: 'Priorität wurde geändert:',
        due_date: 'Fälligkeit wurde geändert:',
        subtask: 'neue Subtask wurde erstellt:',
        assignee: 'Bearbeiter wurde geändert:',
        subtask_create: 'Subtasks wurden bearbeitet:',
        subtask_delete: 'Subtasks wurden bearbeitet:',
        subtask_done: 'Aufgabe abgeschlossen:',
        subtask_undone: 'Aufgabe auf unbearbeitet geändert:',
        release: 'Aufgabe wurde freigegeben:',
        close: 'Aufgabe wurde geschlossen:',
        create: 'Aufgabe wurde erstellt:',
        members_added: 'Neuer Mitarbeiter hinzugefügt',
        members_deleted: 'Mitarbeiter entfernt',
        reviewer:'Zuständigkeit wurde geändert:'
    }



    saveTaskLog(objKey: string, task: any, varObj: any = null) {
        const logData = this.createLog(objKey, task, varObj);
        this.api.postData('task/logs/', logData).subscribe({
            next: (response) => {
                console.log(response);
            }
        })
    }




    createLog(objKey: string, task: any, varObj: any) {
        const logText = this.taskLogs[objKey]
        const states: any = this.getTaskStates(task, varObj);
        const newState = states[objKey];

        return {
            task: task.id,
            log: logText,
            type: objKey,
            new_state: newState
        }
    }

    getTaskStates(task: any, varObj: any) {
        return {
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            priority: this.global.interpretation['priority'][task.priority],
            state: this.global.interpretation['state'][task.state],
            reviewer: varObj,
            subtask_create: `Aufgabe "${varObj}" hinzugefügt`,
            subtask_delete: `Aufgabe "${varObj}" gelöscht`,
            assignee: varObj,
            subtask_done: varObj,
            subtask_undone: varObj,
            release: 'Freigabe erteilt durch Prüfer',
            close: 'Aufgabe abgeschlossen durch Bearbeiter',
            create: 'Neue Aufgabe',
            members_added: varObj,
            members_deleted: varObj,
        }
    }




    getnewState(objKey: string, task: any, variableObj: any) {
        if (objKey === 'description' || objKey === 'due_date' || objKey === 'title') {
            return task[objKey]
            // } else if (objKey === 'state' || objKey === 'priority') {
            //     return this.global.interpretation[objKey][task[objKey]]
        } else if (objKey === 'subtask') {
            return variableObj.title;
        } else if (objKey === 'assignee') {
            return variableObj.fullname
        } else if (objKey === 'checklist') {
            return 'Aufgabe hinzugefügt'
        } else if (objKey === 'tododone' || objKey === 'todoundone') {
            return variableObj
        } else if (objKey === 'release') {
            return 'Freigabe erteilt durch Prüfer'
        } else if (objKey === 'close') {
            return 'Aufgabe abgeschlossen durch Bearbeiter'
        } else if (objKey === 'create') {
            return 'Neue Aufgabe'
        }
    }

}