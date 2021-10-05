import { Injectable } from "@angular/core";

import { Subject } from "rxjs/Rx";
import { Message } from "./message.model";


@Injectable()
export class MessagesService {
  
  // Exposed field and private subject for when module groups change.
  messages: Message[] = null;
  private messagesChange: Subject<Message[]> = new Subject<Message[]>();

  constructor() {
    // Create a subscriber for when preferences change.
    this.messagesChange.subscribe((messages: Message[]) => {
      this.messages = messages;
    });
  }

  addMessage(messages: Message[]): void {
   
    this.messagesChange.next(messages);
  }

}
