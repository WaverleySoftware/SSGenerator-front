import { Injectable, Injector } from "@angular/core";

import { Observable } from "rxjs/Rx";
import { HttpInterceptor, HttpResponse, HttpClient, HttpEvent, HttpRequest, HttpHandler } from "@angular/common/http";

import { Message } from "../messages/message.model";

import { MessagesService } from "../messages/messages.service";
import { LocaleService } from "angular-l10n";

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  private messagesService: MessagesService;

  constructor(private http: HttpClient, private inj: Injector, private localeService: LocaleService) {

    this.messagesService = this.inj.get(MessagesService);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.info("Global HTTP request monitor fired");

    const userObj: any = JSON.parse(localStorage.getItem("userObj"));

    if (!!userObj) {

      const authToken = `${userObj["token_type"]} ${userObj["access_token"]}`;

      const modified = req.clone({ setHeaders: { 'Authorization': authToken, 'Pragma': 'no-cache' } });

      return next.handle(modified).map((event: HttpEvent<any>): HttpEvent<any> => {

        if (!!this.messagesService) {

          event = this.handleResponseMap(event);

        }

        return event;
      });
    }

    return next.handle(req);
  }

  private handleResponseMap(event: HttpEvent<any>): HttpEvent<any> {
    if (event instanceof HttpResponse) {
      // Determine if the event contains the sizingResponseMessages object
      const response = event as HttpResponse<any>;

      let isSizingResponseMessage: boolean = false;

      const responseMessages: Message[] = [];

      if (response.body != null)
      {
        if (!!response.body["sizingResponseMessages"] && response.body.sizingResponseMessages.length > 0) {
          
          isSizingResponseMessage = true;

          // Enter the response messages into a service
          for (let message of response.body.sizingResponseMessages) {

            const newMessage = new Message();

            newMessage.messageKey = message.messageKey;
            newMessage.severity = message.severity;
            newMessage.value = message.value;
            newMessage.unitKey = message.unitKey;
            newMessage.displayValue = this.localizeValue(message.value);
            responseMessages.push(newMessage);
          }

          // Once done remove the response messages from the body
          delete response.body.sizingResponseMessages;
        }

        // Add the messages
        if (!!responseMessages && responseMessages.length > 0) {
          this.messagesService.addMessage(responseMessages);
        }

        // Preserve the original response
        if (!!response.body["response"]) {

          // If the response signature looks like this, but no processing of sizing response messages have been done,
          // then the response is within a nested object and is best avoided.
          if (!isSizingResponseMessage) {
            console.warn("HTTP response contains a nested response object. It is recommended to remove the outer object for the sake of simplicity.");
          }

          return event.clone({
            body: event.body.response,
            headers: event.headers,
            status: event.status,
            statusText: event.statusText,
            url: event.url
          });
        }

      }

    }

    return event;
  }

  localizeValue(value: any) {
    return this.localeService.formatDecimal(value.toFixed(2));
  }
}
