import { inject, Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { GlobalService } from "./global.service";
import { DataService } from "./data.service";
import { createTaskModel } from "../models/task.model";

@Injectable({
    providedIn: 'root'
})

export class LogBookService {
    api = inject(APIService);
    global = inject(GlobalService);
    dataservice = inject(DataService);
    task = createTaskModel();
    taskLogs: Record<string, string> = {
        title: 'Titel wurde geändert:',
        description: 'Beschreibung wurde geändert:',
        state: 'Status wurde geändert:',
        priority: 'Priorität wurde geändert:',
        due_date: 'Fälligkeit wurde geändert:',
        // subtask: 'neue Subtask wurde erstellt:',
        assignee: 'Bearbeiter wurde geändert:',
        subtask_create: 'Aufgabe wurde erstellt:',
        subtask_delete: 'Aufgabe wurde gelöscht:',
        subtask_done: 'Aufgabe abgeschlossen:',
        subtask_undone: 'Aufgabe auf unbearbeitet geändert:',
        release: 'Aufgabe wurde freigegeben:',
        close: 'Aufgabe wurde geschlossen:',
        create: 'Aufgabe wurde erstellt:',
        members_added: 'Neuer Mitarbeiter hinzugefügt',
        members_deleted: 'Mitarbeiter entfernt',
        reviewer: 'Zuständigkeit wurde geändert:'
    }



    saveTaskLog(objKey: string, task: any, varObj: any = null, substask: any = null) {
        const logData = this.createLog(objKey, task, varObj, substask);
        this.api.postData('task/logs/', logData).subscribe({
            next: (response) => {
                console.log(response);
            }
        })
    }




    createLog(objKey: string, task: any, varObj: any, subtask: any) {
        const logText = this.taskLogs[objKey]
        const states: any = this.getTaskStates(task, varObj);
        const newState = states[objKey];

        return {
            task: task.id,
            log: logText,
            type: objKey,
            new_state: newState,
            subtask: subtask,
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
            subtask_create: varObj,
            subtask_delete: varObj,
            assignee: varObj,
            subtask_done: varObj,
            subtask_undone: varObj,
            release: 'Freigabe erteilt durch Prüfer',
            close: 'Aufgabe abgeschlossen durch Bearbeiter',
            create: 'Neue Aufgabe',
            members_added: varObj?.profile?.fullname,
            members_deleted: varObj?.profile?.fullname,
        }
    }

    findChangesInIdList(res: any, oldMembers: any[]) {
        const newList = res.newList;
        const oldList = oldMembers;
        const allMembers = res.all;
        const oldSet = new Set(oldList);
        const newSet = new Set(newList);
        const added = newList.filter((id: string) => !oldSet.has(id));
        const deleted = oldList.filter((id: string) => !newSet.has(id));
        const addedMembers = this.resolveNames(added, allMembers);
        const deletedMembers = this.resolveNames(deleted, allMembers);
        console.log(deleted);
        return { newList, addedMembers, deletedMembers }
    }

    resolveNames(memberIds: string[], allMembers: any[]) {
        const result: string[] = [];
        for (const id of memberIds) {
            const member = allMembers.find(m => m.id === id);
            if (member) {
                result.push(member);
            }
        }
        return result;
    }

    sendLog(varObj: any, objKey: string, task: any) {
        if (objKey === 'nolog') { return }
        if (objKey === 'members') {
            this.sendMemberLog(varObj, task);
        } else if (objKey === 'assignee') {
            this.sendSubtaskLog(varObj, task, objKey);
        } else {
            this.saveTaskLog(objKey, task, varObj);
        }
    }


    sendMemberLog(varObj: any, task: any) {
        const foundMembers = varObj
        if (foundMembers.added.length > 0) {
            this.sendArrayLogs(foundMembers.added, 'members_added', task)
        }
        if (foundMembers.deleted.length > 0) {
            this.sendArrayLogs(foundMembers.deleted, 'members_deleted', task);
        }
    }

    sendSubtaskLog(varObj: any, task: any, objKey: string) {
        console.log(varObj);

        const fullname = varObj.assignee.profile.fullname;
        const substaskText = varObj.subtask.text;
        this.saveTaskLog(objKey, task, fullname, substaskText);
    }


    sendArrayLogs(varObj: any[], objKey: any, task: any) {
        varObj.forEach(obj => {
            this.saveTaskLog(objKey, task, obj);
        })
    }

}