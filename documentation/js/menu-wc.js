'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">depa-frontend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppListingModule.html" data-type="entity-link" >AppListingModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppListingModule-7f18cf5ed6b38e30adbbce1f7b8c11622588612513eebac4a3785d4bd5d7c5314d2b2a1829be37193ac4e034d75b7b2be676120f1feff94fba31147cd8fa27b6"' : 'data-target="#xs-components-links-module-AppListingModule-7f18cf5ed6b38e30adbbce1f7b8c11622588612513eebac4a3785d4bd5d7c5314d2b2a1829be37193ac4e034d75b7b2be676120f1feff94fba31147cd8fa27b6"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppListingModule-7f18cf5ed6b38e30adbbce1f7b8c11622588612513eebac4a3785d4bd5d7c5314d2b2a1829be37193ac4e034d75b7b2be676120f1feff94fba31147cd8fa27b6"' :
                                            'id="xs-components-links-module-AppListingModule-7f18cf5ed6b38e30adbbce1f7b8c11622588612513eebac4a3785d4bd5d7c5314d2b2a1829be37193ac4e034d75b7b2be676120f1feff94fba31147cd8fa27b6"' }>
                                            <li class="link">
                                                <a href="components/AddSubmoduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddSubmoduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppListingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppListingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CustomMultiSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomMultiSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditSubmissionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditSubmissionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditSubmoduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditSubmoduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SubmissionTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubmissionTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SubmodulesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubmodulesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TableLoaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableLoaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TableViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableViewComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppListingRoutingModule.html" data-type="entity-link" >AppListingRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-898e9791c275a9197f7f61357c7f75f1c2821e1edc60ad2521e9dade53666300b3c15abd23ef048d63a95a863b579a2b12f8b439a2a6eee0a1cc12d806863e23"' : 'data-target="#xs-components-links-module-AppModule-898e9791c275a9197f7f61357c7f75f1c2821e1edc60ad2521e9dade53666300b3c15abd23ef048d63a95a863b579a2b12f8b439a2a6eee0a1cc12d806863e23"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-898e9791c275a9197f7f61357c7f75f1c2821e1edc60ad2521e9dade53666300b3c15abd23ef048d63a95a863b579a2b12f8b439a2a6eee0a1cc12d806863e23"' :
                                            'id="xs-components-links-module-AppModule-898e9791c275a9197f7f61357c7f75f1c2821e1edc60ad2521e9dade53666300b3c15abd23ef048d63a95a863b579a2b12f8b439a2a6eee0a1cc12d806863e23"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmailSubmissionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailSubmissionComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AuthModule-34b7a9316de6a9b0e8217f0a3d4cf0b0fb81890330073d65839c1739f328c57a1bf4eb26f8c873d30775f03b9f320df6b581f09ee0ab324860f920ca54c8c042"' : 'data-target="#xs-components-links-module-AuthModule-34b7a9316de6a9b0e8217f0a3d4cf0b0fb81890330073d65839c1739f328c57a1bf4eb26f8c873d30775f03b9f320df6b581f09ee0ab324860f920ca54c8c042"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthModule-34b7a9316de6a9b0e8217f0a3d4cf0b0fb81890330073d65839c1739f328c57a1bf4eb26f8c873d30775f03b9f320df6b581f09ee0ab324860f920ca54c8c042"' :
                                            'id="xs-components-links-module-AuthModule-34b7a9316de6a9b0e8217f0a3d4cf0b0fb81890330073d65839c1739f328c57a1bf4eb26f8c873d30775f03b9f320df6b581f09ee0ab324860f920ca54c8c042"' }>
                                            <li class="link">
                                                <a href="components/AuthComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ModuleGuardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ModuleGuardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SubmoduleGuardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubmoduleGuardComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthRoutingModule.html" data-type="entity-link" >AuthRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CoreModule.html" data-type="entity-link" >CoreModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' : 'data-target="#xs-components-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' :
                                            'id="xs-components-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' }>
                                            <li class="link">
                                                <a href="components/CategoriesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompaniesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompaniesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CustomMultiSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomMultiSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridTopAppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridTopAppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UsersListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersListComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' : 'data-target="#xs-directives-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' :
                                        'id="xs-directives-links-module-DashboardModule-a38d0a5eada33b41be9ca4ec4af4eb5152cf9931bc05083a198518754a41a3f40db3ee864fd27643282c24fe8cdae4737dd2398bca49614fb9ecd7c5a66cd2fb"' }>
                                        <li class="link">
                                            <a href="directives/TrimDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TrimDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardRoutingModule.html" data-type="entity-link" >DashboardRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/FormsModule.html" data-type="entity-link" >FormsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-FormsModule-e0ab3308260555333a4da4a1e39ae472e02b2b00f9cc0d6c393f16bb52191a5046cf2c0c06f29917d4df5abafacdb6238bf429898bf5228116526f8b32c20e23"' : 'data-target="#xs-components-links-module-FormsModule-e0ab3308260555333a4da4a1e39ae472e02b2b00f9cc0d6c393f16bb52191a5046cf2c0c06f29917d4df5abafacdb6238bf429898bf5228116526f8b32c20e23"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-FormsModule-e0ab3308260555333a4da4a1e39ae472e02b2b00f9cc0d6c393f16bb52191a5046cf2c0c06f29917d4df5abafacdb6238bf429898bf5228116526f8b32c20e23"' :
                                            'id="xs-components-links-module-FormsModule-e0ab3308260555333a4da4a1e39ae472e02b2b00f9cc0d6c393f16bb52191a5046cf2c0c06f29917d4df5abafacdb6238bf429898bf5228116526f8b32c20e23"' }>
                                            <li class="link">
                                                <a href="components/CustomMultiSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomMultiSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FormBuilderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormBuilderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FormsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/FormsRoutingModule.html" data-type="entity-link" >FormsRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/WorkflowsModule.html" data-type="entity-link" >WorkflowsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-WorkflowsModule-5258aee979faf470cec0999cd8839ce4774d175dd5703190c9b244fbc5a02df42cf569958287863a26e16a448067a7597ba37c87ba2a76e5b409cb7fe2d9e453"' : 'data-target="#xs-components-links-module-WorkflowsModule-5258aee979faf470cec0999cd8839ce4774d175dd5703190c9b244fbc5a02df42cf569958287863a26e16a448067a7597ba37c87ba2a76e5b409cb7fe2d9e453"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-WorkflowsModule-5258aee979faf470cec0999cd8839ce4774d175dd5703190c9b244fbc5a02df42cf569958287863a26e16a448067a7597ba37c87ba2a76e5b409cb7fe2d9e453"' :
                                            'id="xs-components-links-module-WorkflowsModule-5258aee979faf470cec0999cd8839ce4774d175dd5703190c9b244fbc5a02df42cf569958287863a26e16a448067a7597ba37c87ba2a76e5b409cb7fe2d9e453"' }>
                                            <li class="link">
                                                <a href="components/AddSubmissionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddSubmissionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CustomMultiSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomMultiSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TableLoaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableLoaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TableViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TableViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ViewWorkflowComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ViewWorkflowComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WorkflowSkeletonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WorkflowSkeletonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WorkflowsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WorkflowsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/WorkflowsRoutingModule.html" data-type="entity-link" >WorkflowsRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/ActionButtonRenderer.html" data-type="entity-link" >ActionButtonRenderer</a>
                            </li>
                            <li class="link">
                                <a href="components/CategoryActionComponent.html" data-type="entity-link" >CategoryActionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyActionComponent.html" data-type="entity-link" >CompanyActionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CustomMultiSelectComponent.html" data-type="entity-link" >CustomMultiSelectComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogTemplate.html" data-type="entity-link" >DialogTemplate</a>
                            </li>
                            <li class="link">
                                <a href="components/EmailSubmissionComponent.html" data-type="entity-link" >EmailSubmissionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FilterComponent.html" data-type="entity-link" >FilterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GridTopAppComponent.html" data-type="entity-link" >GridTopAppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotFoundComponent.html" data-type="entity-link" >NotFoundComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchBarComponent.html" data-type="entity-link" >SearchBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SubmissionTableComponent.html" data-type="entity-link" >SubmissionTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TableLoaderComponent.html" data-type="entity-link" >TableLoaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TableViewComponent.html" data-type="entity-link" >TableViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserActionsRenderer.html" data-type="entity-link" >UserActionsRenderer</a>
                            </li>
                            <li class="link">
                                <a href="components/WorkflowSkeletonComponent.html" data-type="entity-link" >WorkflowSkeletonComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#directives-links"' :
                                'data-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/SortDirective.html" data-type="entity-link" >SortDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/TrimDirective.html" data-type="entity-link" >TrimDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CodeValidator.html" data-type="entity-link" >CodeValidator</a>
                            </li>
                            <li class="link">
                                <a href="classes/FormKeyValidator.html" data-type="entity-link" >FormKeyValidator</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ApiService.html" data-type="entity-link" >ApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomPreloadingStrategyService.html" data-type="entity-link" >CustomPreloadingStrategyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataTransportService.html" data-type="entity-link" >DataTransportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FormioService.html" data-type="entity-link" >FormioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FormsService.html" data-type="entity-link" >FormsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MediaUploadService.html" data-type="entity-link" >MediaUploadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationsService.html" data-type="entity-link" >NotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WorkflowsService.html" data-type="entity-link" >WorkflowsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/JwtInterceptor.html" data-type="entity-link" >JwtInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/ServerErrorInterceptor.html" data-type="entity-link" >ServerErrorInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/FormKeyResolver.html" data-type="entity-link" >FormKeyResolver</a>
                            </li>
                            <li class="link">
                                <a href="guards/ModuleGuard.html" data-type="entity-link" >ModuleGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/SubmoduleGuard.html" data-type="entity-link" >SubmoduleGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/SubmoduleResolver.html" data-type="entity-link" >SubmoduleResolver</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/BreadCrumbs.html" data-type="entity-link" >BreadCrumbs</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#pipes-links"' :
                                'data-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/WithLoadingPipe.html" data-type="entity-link" >WithLoadingPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise-inverted.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});