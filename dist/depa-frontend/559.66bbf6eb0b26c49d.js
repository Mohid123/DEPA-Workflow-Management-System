"use strict";(self.webpackChunkDEPA_FRONTEND=self.webpackChunkDEPA_FRONTEND||[]).push([[559],{55559:(W,v,o)=>{o.r(v),o.d(v,{AuthModule:()=>c});var m=o(36895),h=o(19132),t=o(94650);class l{}l.\u0275fac=function(n){return new(n||l)},l.\u0275cmp=t.Xpm({type:l,selectors:[["app-auth"]],decls:1,vars:0,template:function(n,e){1&n&&t._UZ(0,"router-outlet")},dependencies:[h.lC]});var a=o(90433),P=o(77579),C=o(61135),f=o(82722),g=o(50590),x=o(57505),D=o(15274),b=o(22603),T=o(87089),_=o(60101);function A(i,n){if(1&i&&(t.ynx(0),t.TgZ(1,"div",14)(2,"span",15),t._uU(3),t.qZA()(),t.BQk()),2&i){const e=t.oxw().message;t.xp6(3),t.hij(" ",e," ")}}function O(i,n){if(1&i&&t.YNc(0,A,4,1,"ng-container",13),2&i){const e=n.control;t.Q6J("ngIf",e.hasError(n.validation)&&(e.dirty||e.touched))}}class d{constructor(n,e,s){this.auth=n,this.notif=e,this.router=s,this.isLoggingIn$=this.auth.isLoading$,this.destroy$=new P.x,this.credentialStore=new C.X({}),this.loginViaActiveDir=new a.NI(!0),this.emailLoginForm=x.yA,this.activeDirectoryLoginForm=x.zS,this.options={disableAlerts:!0}}onSubmit(n){if(!0===this.loginViaActiveDir?.value){const e={username:n?.data?.email,password:n?.data?.password};e.username&&e.password&&this.auth.loginWithActiveDirectory(e).pipe((0,f.R)(this.destroy$),(0,g.P)()).subscribe(s=>{s.hasErrors()||(this.notif.displayNotification("Successfully authenticated","Login","success"),this.router.navigate(["/dashboard/home"]))})}else{const e={email:n?.data?.email,password:n?.data?.password};e.email&&e.password&&this.auth.login(e).pipe((0,g.P)(),(0,f.R)(this.destroy$)).subscribe(s=>{s.hasErrors()||(this.notif.displayNotification("Successfully authenticated","Login","success"),this.router.navigate(["/dashboard/home"]))})}}ngOnDestroy(){this.destroy$.complete(),this.destroy$.unsubscribe()}}d.\u0275fac=function(n){return new(n||d)(t.Y36(D.e),t.Y36(b.T),t.Y36(h.F0))},d.\u0275cmp=t.Xpm({type:d,selectors:[["ng-component"]],decls:18,vars:5,consts:[[1,"relative","bg_img"],[1,"absolute","left-0","right-0","mx-auto","text-center","top-20"],[1,"flex","flex-col","items-center","justify-center"],[1,""],["ngSrc","../../../../../assets/depa_logo.svg","width","100","height","97"],[1,"card"],[1,"pt-4","pb-2","text-2xl","font-bold"],[1,"text-lg","text-[#B5B5C3]"],[1,"px-4","pt-2","text-left"],[3,"submission","form","options","submit"],[1,"inline-flex","pb-2","gap-x-3"],[1,"mt-0.5",3,"formControl"],["formError",""],[4,"ngIf"],[1,"w-full","mt-1","text-left","fv-plugins-message-container","text-xxs","2xl:text-xs"],["role","alert",1,"text-red-400","fv-help-block","text-xxs","2xl:text-xs","2xl:mb-2"]],template:function(n,e){1&n&&(t.TgZ(0,"div",0)(1,"section",1)(2,"div",2)(3,"div",3),t._UZ(4,"img",4),t.qZA(),t.TgZ(5,"div",5)(6,"p",6),t._uU(7,"Welcome to Depa App Store"),t.qZA(),t.TgZ(8,"p",7),t._uU(9),t.qZA(),t.TgZ(10,"div",8)(11,"formio",9),t.NdJ("submit",function(r){return e.onSubmit(r)}),t.qZA(),t.TgZ(12,"div",10),t._UZ(13,"tui-checkbox",11),t.TgZ(14,"label"),t._uU(15,"Login via Windows Credentials"),t.qZA()()()()()()(),t.YNc(16,O,1,1,"ng-template",null,12,t.W1O)),2&n&&(t.xp6(9),t.hij("Enter your ",!1===(null==e.loginViaActiveDir?null:e.loginViaActiveDir.value)?"Login":"Windows"," credentials"),t.xp6(2),t.Q6J("submission",e.submission)("form",e.emailLoginForm)("options",e.options),t.xp6(2),t.Q6J("formControl",e.loginViaActiveDir))},dependencies:[m.O5,a.JJ,a.oH,m.Zd,T.f,_.k4],styles:[".bg_img[_ngcontent-%COMP%]{height:100vh;width:100vw;background-image:url(login_bg.749483d234866eab.svg);background-size:contain;background-position:bottom;background-repeat:no-repeat}.card[_ngcontent-%COMP%]{max-height:37.5rem;width:29rem;border-radius:.375rem;--tw-border-opacity: 1;border-color:rgb(255 255 255 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity));padding:1.25rem;--tw-shadow: 0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1);--tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}"]});const S=[{path:"",component:l,children:[{path:"",redirectTo:"login",pathMatch:"full"},{path:"login",component:d}]}];class u{}u.\u0275fac=function(n){return new(n||u)},u.\u0275mod=t.oAB({type:u}),u.\u0275inj=t.cJS({imports:[h.Bz.forChild(S),h.Bz]});var F=o(47846),E=o(8276),H=o(44886),$=o(60117),I=o(71115),M=o(89740);const w={icons:{hide:({$implicit:i})=>"s"===i?"tuiIconEyeOff":"tuiIconEyeOffLarge",show:({$implicit:i})=>"s"===i?"tuiIconEye":"tuiIconEyeLarge"}};new t.OlP("[TUI_INPUT_PASSWORD_OPTIONS]",{factory:()=>w});let V=(()=>{class i{}return i.\u0275fac=function(e){return new(e||i)},i.\u0275mod=t.oAB({type:i}),i.\u0275inj=t.cJS({imports:[[m.ez,a.u5,M.wq,F.W,E.EI,H.go,$.KW,I.cn]]}),i})();var R=o(86679),Z=o(39367);class c{}c.\u0275fac=function(n){return new(n||c)},c.\u0275mod=t.oAB({type:c}),c.\u0275inj=t.cJS({imports:[m.ez,u,a.UX,a.u5,V,R.Qf,I.cn,Z.fN,T.x,_.XI]})}}]);