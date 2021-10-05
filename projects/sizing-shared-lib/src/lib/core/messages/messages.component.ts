import { Component } from '@angular/core';

import { Message } from "./message.model";
import { MessagesService } from "./messages.service";

import * as cloneDeep_ from 'lodash/cloneDeep';

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent {
  public cloneDeep = cloneDeep_;
  /**
   * Anonymous hash to determine severity icons.
   */
  severityHash: { icon: string }[] = [
    { icon: "fa fa-info-circle" },
    { icon: "fa fa-exclamation-circle" },
    { icon: "fa fa-times-circle" }
  ];

  get messages(): Message[] {
    const messages = this.messagesService.messages;
    
    return messages;
  }

  constructor(public messagesService: MessagesService) {

  }

  /**
   * Dismisses the alert by clearing the messages.
   */
  dismissAlert(): void {
    // To dismiss the alert, clear the messages.
    this.messagesService.addMessage(null);
  }

  /**
   * Dismisses the individual message.
   */
  dismissMessage(message: Message): void {

    const messagesCopy = this.cloneDeep(this.messages);

    const index = this.messages.indexOf(message);

    if (index > -1) {

      messagesCopy.splice(index, 1);

      // Reapply the new messages
      this.messagesService.addMessage(messagesCopy);
    }

  }

  /**
   * Determines which icon to use based on the given severity.
   * @param severity
   */
  getSeverityIcon(severity: number): string {

    const hashItem = this.severityHash[severity];

    return !!hashItem ? hashItem.icon : this.severityHash[0].icon;
  }

  /**
   * Determines whether or not the translation term is an internal error.
   */
  isInternalError(message: string): boolean {
    return message === "INTERNAL_ERROR";
  }
}
