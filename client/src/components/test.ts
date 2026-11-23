// @Injectable()
// export class Interceptor implements HttpInterceptor {
//     private interceptorUrlsSkipUser = ['/oauth_loginauth', '/oauth_login'];
//     private isRefreshing = false;

//     intercept(originalReq: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         let httpRequest = originalReq;

//         if(this.myService.getToken() !== null && this.myService.getToken() !== undefined) {
//             httpRequest = this.addTokenToRequest(httpRequest, this.myService.getToken());
//         }

//         if(this.apiTokenService.getApiAuthToken()){
//             if(this.apiTokenService.needRefreshJwt()){
//                 this.handleRefreshToken(httpRequest, next);
//             }
//             httpRequest = httpRequest.clone
//             ({headers: httpRequest.headers.set('Jwt', this.apiTokenService.getApiAuthToken())});
//         }
//         if(this.userService.getToken()) {
//             httpRequest = httpRequest.clone
//             ({headers: httpRequest.headers.set('auth_token', this.userService.getApiAuthToken())});
//         }
//         else {
//             httpRequest = httpRequest.clone
//             ({headers: httpRequest.headers.set('Access-Control-Allow-Origin', "*")});
//         }
//         if (!this.shouldSkipUser(httpRequest.url)) {
//             httpRequest = this.addUserToRequest(httpRequest);
//         }

//         return next.handle(httpRequest);
//         }

//         private addUserToRequest(request: HttpRequest<any>): any {
//             return request.clone({headers: request.headers.set
//             ('user', JSON.stringify(this.userService.getCachedUserInfo() || '{}'))})
//         }

//         private handleRefreshToken(request: HttpRequest<any>, next: HttpHandler): void{
//             if(!this.isRefreshing) {
//                 this.isRefreshing = true;
//                 this.apiTokenService.loadApiToken(environment.baseUrl + '/services/authentication');
//                 this.isRefreshing = false;
//             }
//         }

//         private addTokenToRequest(request: HttpRequest<any>, token: string) {
//             return request.clone({ setHeaders: { Authorization: `Bearer ${token}`}})
//         }
//     }
// }