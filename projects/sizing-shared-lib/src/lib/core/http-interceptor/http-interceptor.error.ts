import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {Observable,throwError, of } from 'rxjs';
import {HttpError} from "../http-error";
//import {Toaster} from "nw-style-guide/toasts";
import swal from 'sweetalert';
import { catchError, retry } from 'rxjs/operators';

import { Message } from "../messages/message.model";

import { MessagesService } from "../messages/messages.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
// Regular dep. injection doesn't work in HttpInterceptor due to a framework issue (as of angular@5.2.9),
// use Injector directly (don't forget to add @Injectable() decorator to class).
private messagesService: MessagesService;
private request : HttpRequest<any>;

constructor(private _injector: Injector) {
  this.messagesService = this._injector.get(MessagesService);
}

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let handled: boolean = false;
    this.request = req;
    return next.handle(req)
    .pipe(
      retry(0),
      catchError((returnedError) => {
        let errorMessage = null;
        if (returnedError) {
          if (returnedError.error instanceof ErrorEvent) {
            errorMessage = `Error: ${returnedError.error.message}`;
          }
          else if (returnedError instanceof HttpErrorResponse) {
            // errorMessage =  `Error Status ${returnedError.status} : ${returnedError.error} - ${returnedError.error.message}`;
            handled = this.handleServerSideError(returnedError);
          }
        } 

        console.log(errorMessage ? errorMessage : returnedError);       
        if (!handled) {
          if (errorMessage) {
            return throwError(errorMessage);
          } else {
            if (returnedError ) {
              return throwError(returnedError);
            }
            return throwError(returnedError);
          }
        } else {
          return of(returnedError);
        }
      })
    )
  }


private handleServerSideError(error: HttpErrorResponse): boolean {
  let handled: boolean =false;
  const responseMessages: Message[] = [];
  const logFormat = 'background: maroon; color: white';
  const newMessage = new Message();
  newMessage.messageKey = "Something went wrong, please retry or refresh the browser. If the problem pesists please contact ...";
  newMessage.severity = 1;
  newMessage.value = 1;
  newMessage.unitKey = "";
  console.log('Error handling started..', logFormat);

  switch (error.status) {

                    case HttpError.BadRequest:
                        console.log('%c Bad Request 400', logFormat);
                        handled = false;
      newMessage.displayValue = "The server responded with a 400 error for request - " + this.request.urlWithParams;
      //newMessage.messageKey = error.error[0];
                        break;

                    case HttpError.Unauthorized:
                        console.log('%c Unauthorized 401', logFormat);
                       // window.location.href = '/login' + window.location.hash;
                       handled = false;
                       break;

                    case HttpError.NotFound:
                        //show error toast message
                        console.error('%c Not Found 404', logFormat);
                        // const _toaster = this._injector.get(Toaster),
                        //     _router = this._injector.get(Router);
                        // _toaster.show({
                        //     message: exception.error && exception.error.message ? exception.error.message :
                        //         exception.statusText,
                        //     typeId: 'error',
                        //     isDismissable: true
                        // });
                       // swal("Not Found", error.error && error.error.message ? error.error.message :error.statusText,"error");
                        //_router.navigate(['']);
                        newMessage.displayValue = "The server responded with a 404 error for request - " + this.request.urlWithParams;
                        handled = true;
                        break;

                    case HttpError.TimeOut:
                        // Handled in AnalyticsExceptionHandler
                        console.error('%c TimeOut 408', logFormat);
                        newMessage.displayValue = "The server responded with a 408 error for request - " + this.request.urlWithParams;
                        handled = true;
                        break;

                    case HttpError.Forbidden:
                        console.error('%c Forbidden 403', logFormat);
                       handled = false;
                        break;

                    case HttpError.InternalServerError:
                        console.error('%c big bad 500', logFormat);
                        handled = true;
                        newMessage.displayValue = "The server responded with a 500 error for request - " + this.request.urlWithParams;
                        break;

                    case HttpError.BadGateway:
                        console.error('%c big bad 502', logFormat);
                       // swal("Bad Gateway", error.error && error.error.message ? error.error.message :error.statusText,"error");
                       newMessage.displayValue = "The server responded with a 502 error for request - " + this.request.urlWithParams;
                        handled = true;
                        break;
                }
                responseMessages.push(newMessage);
                this.messagesService.addMessage(responseMessages);
  return handled;
}
}
